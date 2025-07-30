import { storage } from "./storage";
import { providerAPI } from "./provider-api";

class OrderSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("Starting order sync service...");
    
    // Run immediately and then every 2 minutes
    this.syncOrderStatuses();
    this.retryPendingOrders();
    
    this.syncInterval = setInterval(() => {
      this.syncOrderStatuses();
      this.retryPendingOrders();
    }, 2 * 60 * 1000); // Every 2 minutes
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("Order sync service stopped");
  }

  async retryPendingOrders() {
    try {
      console.log("Checking for pending orders to retry...");
      
      // Get pending orders that weren't sent to providers
      const pendingOrders = await storage.getPendingOrdersNotSentToProvider();
      
      if (pendingOrders.length === 0) {
        console.log("No pending orders to retry");
        return;
      }

      console.log(`Found ${pendingOrders.length} pending orders to retry`);
      
      for (const order of pendingOrders) {
        try {
          const service = await storage.getService(order.serviceId);
          if (!service || !service.providerId || !service.providerServiceId) {
            console.log(`Order ${order.id}: Service has no provider configured`);
            continue;
          }

          const provider = await storage.getProvider(service.providerId);
          if (!provider) {
            console.log(`Order ${order.id}: Provider not found`);
            continue;
          }

          console.log(`Retrying order ${order.id} with provider...`);
          
          const providerResult = await providerAPI.placeOrderWithProvider(
            provider,
            service.providerServiceId,
            order.targetUrl,
            order.quantity
          );

          if (providerResult.order) {
            await storage.updateOrder(order.id, {
              providerOrderId: providerResult.order,
              status: 'processing',
              isSentToProvider: true
            });
            console.log(`Order ${order.id}: Successfully sent to provider with ID ${providerResult.order}`);
          } else {
            console.error(`Order ${order.id}: Provider returned invalid response`);
          }
        } catch (error) {
          console.error(`Error retrying order ${order.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in retry pending orders:", error);
    }
  }

  async syncOrderStatuses() {
    try {
      console.log("Syncing order statuses...");
      
      // Get all orders that need status checking
      const orders = await storage.getOrdersForStatusCheck();
      
      if (orders.length === 0) {
        console.log("No orders to sync");
        return;
      }

      console.log(`Found ${orders.length} orders to check`);

      for (const order of orders) {
        try {
          // Get the service to find the provider
          const service = await storage.getService(order.serviceId);
          if (!service || !service.providerId) {
            console.log(`Order ${order.id}: No provider found for service`);
            continue;
          }

          // Get the provider
          const provider = await storage.getProvider(service.providerId);
          if (!provider) {
            console.log(`Order ${order.id}: Provider not found`);
            continue;
          }

          // Check status with provider
          const statusResult = await providerAPI.checkOrderStatus(provider, order.providerOrderId!);
          
          // Update order with real provider data
          const currentStatus = order.status;
          const newStatus = this.mapProviderStatus(statusResult.status || 'pending');
          
          // Always update with latest provider data
          await storage.updateOrderFromProvider(order.id, {
            status: newStatus,
            startCount: statusResult.start_count || 0,
            remains: statusResult.remains || 0,
            deliveredCount: statusResult.delivered_count || 0,
            completionPercentage: statusResult.completion_percentage || 0,
          });

          // If order was cancelled by provider, refund user (but prevent double refund)
          if (currentStatus !== 'cancelled' && newStatus === 'cancelled') {
            console.log(`Order ${order.id}: Auto-cancelled by provider - checking for existing refund`);
            
            // Check if refund already issued to prevent double refund
            const { db } = await import("./db");
            const { transactions } = await import("@shared/schema");
            const { and, eq, or, sql } = await import("drizzle-orm");
            
            const existingRefund = await db.select()
              .from(transactions)
              .where(and(
                eq(transactions.orderId, order.id),
                or(
                  eq(transactions.type, 'refund'),
                  and(
                    eq(transactions.type, 'deposit'),
                    sql`${transactions.description} LIKE '%refund%'`
                  )
                )
              ))
              .limit(1);

            if (existingRefund.length === 0) {
              // Refund wallet balance only once
              await storage.updateUserWalletBalance(order.userId, order.totalPrice, 'add');

              // Create auto-refund transaction
              await storage.createTransaction({
                userId: order.userId,
                type: 'refund',
                amount: order.totalPrice,
                description: `Provider cancelled Order #${order.id} - automatic refund`,
                status: 'completed',
                orderId: order.id,
              });
              console.log(`Order ${order.id}: Refund issued successfully`);
            } else {
              console.log(`Order ${order.id}: Refund already exists, skipping`);
            }
          }

          if (currentStatus !== newStatus) {
            console.log(`Order ${order.id}: Updated status from ${currentStatus} to ${newStatus}`);
          }

        } catch (error) {
          console.error(`Error syncing order ${order.id}:`, error);
        }
      }
      
    } catch (error) {
      console.error("Error in order sync service:", error);
    }
  }

  private mapProviderStatus(providerStatus: string): string {
    switch (providerStatus.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'completed';
      case 'processing':
      case 'in progress':
        return 'processing';
      case 'partial':
        return 'partial';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  // Manual sync for specific order
  async syncSingleOrder(orderId: number): Promise<boolean> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order || !order.providerOrderId) {
        return false;
      }

      const service = await storage.getService(order.serviceId);
      if (!service || !service.providerId) {
        return false;
      }

      const provider = await storage.getProvider(service.providerId);
      if (!provider) {
        return false;
      }

      const statusResult = await providerAPI.getOrderStatus(provider, order.providerOrderId);
      
      if (statusResult.error) {
        return false;
      }

      await storage.updateOrderFromProvider(order.id, {
        status: this.mapProviderStatus(statusResult.status || 'pending'),
        startCount: statusResult.start_count,
        remains: statusResult.remains
      });

      return true;
    } catch (error) {
      console.error(`Error syncing single order ${orderId}:`, error);
      return false;
    }
  }
}

export const orderSyncService = new OrderSyncService();