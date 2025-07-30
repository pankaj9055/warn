import { 
  users, 
  serviceCategories,
  services,
  orders,
  transactions,
  referrals,
  supportTickets,
  providers,
  paymentMethods,
  cryptoPayments,
  upiPayments,
  supportContacts,
  adminMessages,
  adminSettings,
  userMessages,
  type User, 
  type InsertUser,
  type ServiceCategory,
  type Service,
  type Order,
  type InsertOrder,
  type Transaction,
  type InsertTransaction,
  type Referral,
  type InsertReferral,
  type SupportTicket,
  type InsertSupportTicket,
  type Provider,
  type InsertProvider,
  type PaymentMethod,
  type InsertPaymentMethod,
  type CryptoPayment,
  type InsertCryptoPayment,
  type UpiPayment,
  type InsertUpiPayment,
  type SupportContact,
  type InsertSupportContact,
  type InsertService,
  type InsertServiceCategory,
  type UserMessage,
  type InsertUserMessage,
  type AdminMessage,
  type InsertAdminSetting,
  type AdminSetting,
  type InsertAdminMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, count, and, or, isNotNull } from "drizzle-orm";

// Storage interface
interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserReferrer(userId: number, referrerId: number): Promise<void>;
  updateUserWalletBalance(userId: number, amount: string, operation: 'add' | 'subtract'): Promise<void>;
  updateUserWalletBalanceWithTransaction(userId: number, amount: string, operation: 'add' | 'subtract', description?: string): Promise<void>;
  updateUser(userId: number, data: Partial<User>): Promise<User>;
  getAllUsers(page: number, limit: number, search?: string): Promise<User[]>;
  
  // Service methods
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(data: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(categoryId: number, data: Partial<ServiceCategory>): Promise<ServiceCategory>;
  getServices(categoryId?: number): Promise<Service[]>;
  getService(serviceId: number): Promise<Service | undefined>;
  createService(data: InsertService): Promise<Service>;
  updateService(serviceId: number, data: Partial<Service>): Promise<Service>;
  deleteService(serviceId: number): Promise<void>;
  
  // Order methods
  createOrder(data: InsertOrder): Promise<Order>;
  getOrder(orderId: number): Promise<Order | undefined>;
  updateOrder(orderId: number, data: Partial<Order>): Promise<Order>;
  cancelOrder(orderId: number): Promise<Order>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(page: number, limit: number, status?: string): Promise<Order[]>;
  
  // Transaction methods
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Referral methods
  createReferral(data: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  
  // Support methods
  createSupportTicket(data: InsertSupportTicket): Promise<SupportTicket>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  updateSupportTicket(ticketId: number, data: Partial<SupportTicket>): Promise<SupportTicket>;
  
  // Provider methods
  getAllProviders(): Promise<Provider[]>;
  getProvider(providerId: number): Promise<Provider | undefined>;
  createProvider(data: InsertProvider): Promise<Provider>;
  updateProvider(providerId: number, data: Partial<Provider>): Promise<Provider>;
  deleteProvider(providerId: number): Promise<void>;
  
  // Service category methods
  createServiceCategory(data: InsertServiceCategory): Promise<ServiceCategory>;
  getServiceByProviderServiceId(providerId: number, providerServiceId: string): Promise<Service | undefined>;
  
  // Payment method functions
  getAllPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;
  createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<void>;
  
  // Crypto payment functions
  createCryptoPayment(data: InsertCryptoPayment): Promise<CryptoPayment>;
  getUserCryptoPayments(userId: number): Promise<CryptoPayment[]>;
  updateCryptoPayment(id: number, data: Partial<CryptoPayment>): Promise<CryptoPayment>;
  getAllCryptoPayments(): Promise<CryptoPayment[]>;
  
  // UPI payment functions
  createUpiPayment(data: InsertUpiPayment): Promise<UpiPayment>;
  getUserUpiPayments(userId: number): Promise<UpiPayment[]>;
  updateUpiPayment(id: number, data: Partial<UpiPayment>): Promise<UpiPayment>;
  getAllUpiPayments(): Promise<UpiPayment[]>;
  
  // Dashboard stats
  getUserDashboardStats(userId: number): Promise<any>;
  getAdminDashboardStats(): Promise<any>;
  
  // Admin messages
  createAdminMessage(data: InsertAdminMessage): Promise<AdminMessage>;
  getAllAdminMessages(): Promise<AdminMessage[]>;
  getActiveAdminMessages(): Promise<AdminMessage[]>;
  updateAdminMessage(id: number, data: Partial<AdminMessage>): Promise<AdminMessage>;
  deleteAdminMessage(id: number): Promise<void>;

  // Admin order operations
  adminCancelOrder(orderId: number): Promise<Order>;
  
  // Support ticket operations
  getSupportTicketByTicketId(ticketId: string): Promise<SupportTicket | undefined>;

  // User messages
  createUserMessage(data: InsertUserMessage): Promise<UserMessage>;
  getUserMessages(userId: number): Promise<UserMessage[]>;
  getAllUserMessages(): Promise<UserMessage[]>;
  markUserMessageAsRead(messageId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`LOWER(${users.username}) = LOWER(${username})`);
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user || undefined;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserReferrer(userId: number, referrerId: number): Promise<void> {
    await db.update(users)
      .set({ referredBy: referrerId })
      .where(eq(users.id, userId));
  }

  async updateUserWalletBalance(userId: number, amount: string, operation: 'add' | 'subtract'): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const currentBalance = parseFloat(user.walletBalance || '0');
    const changeAmount = parseFloat(amount);
    const newBalance = operation === 'add' 
      ? currentBalance + changeAmount 
      : currentBalance - changeAmount;

    await db.update(users)
      .set({ walletBalance: newBalance.toFixed(2) })
      .where(eq(users.id, userId));
  }

  // Function to update wallet balance AND create transaction (for manual deposits)
  async updateUserWalletBalanceWithTransaction(userId: number, amount: string, operation: 'add' | 'subtract', description?: string): Promise<void> {
    await this.updateUserWalletBalance(userId, amount, operation);
    
    // Create transaction record
    await this.createTransaction({
      userId,
      type: operation === 'add' ? 'deposit' : 'withdrawal',
      amount: amount,
      description: description || (operation === 'add' ? 'Wallet deposit' : 'Wallet withdrawal'),
      status: 'completed'
    });
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(page: number, limit: number, search?: string): Promise<User[]> {
    if (search && search.trim()) {
      return await db.select().from(users)
        .where(sql`${users.username} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'}`)
        .limit(limit)
        .offset((page - 1) * limit);
    }
    return await db.select().from(users)
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories)
      .where(eq(serviceCategories.isActive, true));
  }

  async createServiceCategory(data: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db.insert(serviceCategories)
      .values(data)
      .returning();
    return category;
  }

  async updateServiceCategory(categoryId: number, data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const [category] = await db.update(serviceCategories)
      .set(data)
      .where(eq(serviceCategories.id, categoryId))
      .returning();
    return category;
  }

  async getServices(categoryId?: number): Promise<Service[]> {
    if (categoryId) {
      return await db.select().from(services)
        .where(eq(services.categoryId, categoryId));
    }
    return await db.select().from(services);
  }

  async getService(serviceId: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services)
      .where(eq(services.id, serviceId));
    return service || undefined;
  }

  async createService(data: InsertService): Promise<Service> {
    const [service] = await db.insert(services)
      .values(data)
      .returning();
    return service;
  }

  async updateService(serviceId: number, data: Partial<Service>): Promise<Service> {
    const [service] = await db.update(services)
      .set(data)
      .where(eq(services.id, serviceId))
      .returning();
    return service;
  }

  async deleteService(serviceId: number): Promise<void> {
    await db.delete(services).where(eq(services.id, serviceId));
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders)
      .values(data)
      .returning();
    return order;
  }

  async getOrder(orderId: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders)
      .where(eq(orders.id, orderId));
    return order || undefined;
  }

  async updateOrder(orderId: number, data: Partial<Order>): Promise<Order> {
    const [order] = await db.update(orders)
      .set(data)
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getOrdersForStatusCheck(): Promise<Order[]> {
    // Get orders that are pending or processing and have provider order IDs
    return await db.select().from(orders)
      .where(and(
        or(eq(orders.status, 'pending'), eq(orders.status, 'processing')),
        isNotNull(orders.providerOrderId)
      ));
  }

  async getPendingOrdersNotSentToProvider(): Promise<Order[]> {
    // Get orders that are pending and haven't been sent to providers
    return await db.select().from(orders)
      .where(and(
        eq(orders.status, 'pending'),
        eq(orders.isSentToProvider, false)
      ));
  }

  async updateOrderFromProvider(orderId: number, providerData: {
    status?: string;
    startCount?: number;
    remains?: number;
    deliveredCount?: number;
    completionPercentage?: number;
  }): Promise<Order> {
    const updateData: any = {};
    
    if (providerData.status) {
      // Map provider status to our status
      switch (providerData.status.toLowerCase()) {
        case 'completed':
        case 'complete':
          updateData.status = 'completed';
          updateData.completedAt = new Date();
          break;
        case 'processing':
        case 'in progress':
          updateData.status = 'processing';
          break;
        case 'partial':
          updateData.status = 'partial';
          break;
        case 'cancelled':
        case 'canceled':
          updateData.status = 'cancelled';
          break;
        default:
          updateData.status = 'pending';
      }
    }
    
    if (providerData.startCount !== undefined) {
      updateData.startCount = providerData.startCount;
    }
    
    if (providerData.remains !== undefined) {
      updateData.remains = providerData.remains;
    }

    if (providerData.deliveredCount !== undefined) {
      updateData.deliveredCount = providerData.deliveredCount;
    }

    if (providerData.completionPercentage !== undefined) {
      updateData.completionPercentage = providerData.completionPercentage.toString();
    }

    const [order] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async cancelOrder(orderId: number): Promise<Order> {
    // Get the order first to refund wallet balance
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    
    // Only allow cancellation for orders NOT sent to provider
    if (order.isSentToProvider) {
      throw new Error('Order cannot be cancelled - already sent to provider');
    }

    // Only allow cancellation for pending orders (not yet processed)
    if (order.status !== 'pending') {
      throw new Error('Order cannot be cancelled - already processed');
    }

    // Refund wallet balance
    await this.updateUserWalletBalance(order.userId, order.totalPrice, 'add');

    // Create refund transaction
    await this.createTransaction({
      userId: order.userId,
      type: 'deposit',
      amount: order.totalPrice,
      description: `Order #${order.id} cancelled - refund`,
      status: 'completed',
      orderId: order.id,
    });

    // Update order status to cancelled
    const [cancelledOrder] = await db.update(orders)
      .set({ status: 'cancelled' })
      .where(eq(orders.id, orderId))
      .returning();
    
    return cancelledOrder;
  }

  // Admin-specific cancel order that can cancel even provider orders
  async adminCancelOrder(orderId: number): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    
    // Admin can cancel any order except completed ones
    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed orders');
    }

    // Refund wallet balance
    await this.updateUserWalletBalance(order.userId, order.totalPrice, 'add');

    // Create refund transaction
    await this.createTransaction({
      userId: order.userId,
      type: 'deposit',
      amount: order.totalPrice,
      description: `Order #${order.id} cancelled by admin - refund`,
      status: 'completed',
      orderId: order.id,
    });

    // Update order status to cancelled
    const [cancelledOrder] = await db.update(orders)
      .set({ status: 'cancelled' })
      .where(eq(orders.id, orderId))
      .returning();
    
    return cancelledOrder;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select({
      id: orders.id,
      userId: orders.userId,
      serviceId: orders.serviceId,
      targetUrl: orders.targetUrl,
      quantity: orders.quantity,
      totalPrice: orders.totalPrice,
      status: orders.status,
      startCount: orders.startCount,
      remains: orders.remains,
      deliveredCount: orders.deliveredCount,
      completionPercentage: orders.completionPercentage,
      isSentToProvider: orders.isSentToProvider,
      providerOrderId: orders.providerOrderId,
      cancelReason: orders.cancelReason,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      service: {
        id: services.id,
        name: services.name,
        description: services.description,
        pricePerThousand: services.pricePerThousand,
      }
    })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(page: number, limit: number, status?: string): Promise<Order[]> {
    if (status) {
      return await db.select({
        id: orders.id,
        userId: orders.userId,
        serviceId: orders.serviceId,
        targetUrl: orders.targetUrl,
        quantity: orders.quantity,
        totalPrice: orders.totalPrice,
        status: orders.status,
        startCount: orders.startCount,
        remains: orders.remains,
        deliveredCount: orders.deliveredCount,
        completionPercentage: orders.completionPercentage,
        isSentToProvider: orders.isSentToProvider,
        providerOrderId: orders.providerOrderId,
        cancelReason: orders.cancelReason,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        username: users.username,
        serviceName: services.name,
      })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(services, eq(orders.serviceId, services.id))
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
    }
    
    return await db.select({
      id: orders.id,
      userId: orders.userId,
      serviceId: orders.serviceId,
      targetUrl: orders.targetUrl,
      quantity: orders.quantity,
      totalPrice: orders.totalPrice,
      status: orders.status,
      startCount: orders.startCount,
      remains: orders.remains,
      deliveredCount: orders.deliveredCount,
      completionPercentage: orders.completionPercentage,
      isSentToProvider: orders.isSentToProvider,
      providerOrderId: orders.providerOrderId,
      cancelReason: orders.cancelReason,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      username: users.username,
      serviceName: services.name,
    })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(services, eq(orders.serviceId, services.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    // Generate reference number if not provided
    const transactionData = {
      ...data,
      referenceNumber: data.referenceNumber || `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };
    
    const [transaction] = await db.insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createReferral(data: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals)
      .values(data)
      .returning();
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async createSupportTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const [ticket] = await db.insert(supportTickets)
      .values({
        ...data,
        ticketId
      })
      .returning();
    return ticket;
  }

  async getSupportTicketByTicketId(ticketId: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.ticketId, ticketId));
    return ticket || undefined;
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async updateSupportTicket(ticketId: number, data: Partial<SupportTicket>): Promise<SupportTicket> {
    const [ticket] = await db.update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    return ticket;
  }

  async getUserDashboardStats(userId: number): Promise<any> {
    const userOrders = await this.getUserOrders(userId);
    
    return {
      totalOrders: userOrders.length,
      completedOrders: userOrders.filter(o => o.status === 'completed').length,
      pendingOrders: userOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      cancelledOrders: userOrders.filter(o => o.status === 'cancelled').length,
    };
  }

  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers);
  }

  async getProvider(providerId: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, providerId));
    return provider || undefined;
  }

  async createProvider(data: InsertProvider): Promise<Provider> {
    const [provider] = await db.insert(providers)
      .values(data)
      .returning();
    return provider;
  }

  async updateProvider(providerId: number, data: Partial<Provider>): Promise<Provider> {
    const [provider] = await db.update(providers)
      .set(data)
      .where(eq(providers.id, providerId))
      .returning();
    return provider;
  }

  async deleteProvider(providerId: number): Promise<void> {
    await db.delete(providers).where(eq(providers.id, providerId));
  }

  // Payment method functions
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods);
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));
  }

  async createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    const [method] = await db.insert(paymentMethods)
      .values(data)
      .returning();
    return method;
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const updateData = { ...data };
    // Remove timestamps to avoid conversion errors
    delete updateData.createdAt;
    
    const [method] = await db.update(paymentMethods)
      .set(updateData)
      .where(eq(paymentMethods.id, id))
      .returning();
    return method;
  }

  async deletePaymentMethod(id: number): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Support contacts management
  async getAllSupportContacts(): Promise<any[]> {
    return await db.select().from(supportContacts).orderBy(supportContacts.displayOrder);
  }

  async createSupportContact(data: any): Promise<any> {
    const [contact] = await db.insert(supportContacts)
      .values(data)
      .returning();
    return contact;
  }

  async updateSupportContact(id: number, data: any): Promise<any> {
    const [contact] = await db.update(supportContacts)
      .set(data)
      .where(eq(supportContacts.id, id))
      .returning();
    return contact;
  }

  async deleteSupportContact(id: number): Promise<void> {
    await db.delete(supportContacts).where(eq(supportContacts.id, id));
  }

  // Crypto payment functions
  async createCryptoPayment(data: InsertCryptoPayment): Promise<CryptoPayment> {
    const [payment] = await db.insert(cryptoPayments)
      .values(data)
      .returning();
    return payment;
  }

  async getUserCryptoPayments(userId: number): Promise<CryptoPayment[]> {
    return await db.select().from(cryptoPayments)
      .where(eq(cryptoPayments.userId, userId))
      .orderBy(desc(cryptoPayments.createdAt));
  }

  async updateCryptoPayment(id: number, data: Partial<CryptoPayment>): Promise<CryptoPayment> {
    const [payment] = await db.update(cryptoPayments)
      .set(data)
      .where(eq(cryptoPayments.id, id))
      .returning();
    return payment;
  }

  async getAllCryptoPayments(): Promise<CryptoPayment[]> {
    return await db.select().from(cryptoPayments)
      .orderBy(desc(cryptoPayments.createdAt));
  }

  // UPI payment functions
  async createUpiPayment(data: InsertUpiPayment): Promise<UpiPayment> {
    const [payment] = await db.insert(upiPayments)
      .values(data)
      .returning();
    return payment;
  }

  async getUserUpiPayments(userId: number): Promise<UpiPayment[]> {
    return await db.select().from(upiPayments)
      .where(eq(upiPayments.userId, userId))
      .orderBy(desc(upiPayments.createdAt));
  }

  async updateUpiPayment(id: number, data: Partial<UpiPayment>): Promise<UpiPayment> {
    const [payment] = await db.update(upiPayments)
      .set(data)
      .where(eq(upiPayments.id, id))
      .returning();
    return payment;
  }

  async getUpiPayment(id: number): Promise<UpiPayment | null> {
    const [payment] = await db.select().from(upiPayments)
      .where(eq(upiPayments.id, id))
      .limit(1);
    return payment || null;
  }

  async getAllUpiPayments(): Promise<UpiPayment[]> {
    return await db.select().from(upiPayments)
      .orderBy(desc(upiPayments.createdAt));
  }

  // Admin Settings functions
  async getAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings)
      .orderBy(adminSettings.settingKey);
  }

  async getAdminSetting(key: string): Promise<AdminSetting | null> {
    const [setting] = await db.select().from(adminSettings)
      .where(eq(adminSettings.settingKey, key))
      .limit(1);
    return setting || null;
  }

  async createAdminSetting(data: InsertAdminSetting): Promise<AdminSetting> {
    const [setting] = await db.insert(adminSettings)
      .values(data)
      .returning();
    return setting;
  }

  async updateAdminSetting(key: string, value: string, updatedBy: number): Promise<AdminSetting> {
    const [setting] = await db.update(adminSettings)
      .set({ 
        settingValue: value,
        updatedBy,
        updatedAt: new Date()
      })
      .where(eq(adminSettings.settingKey, key))
      .returning();
    return setting;
  }

  async upsertAdminSetting(key: string, value: string, description: string, updatedBy: number): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(key);
    
    if (existing) {
      return await this.updateAdminSetting(key, value, updatedBy);
    } else {
      return await this.createAdminSetting({
        settingKey: key,
        settingValue: value,
        description,
        updatedBy
      });
    }
  }

  // Service notes management
  async getServiceNote(): Promise<any> {
    try {
      // Simple approach: store in a config-like way
      const result = await db.select().from(services).where(eq(services.id, -1)).limit(1);
      if (result.length > 0) {
        return { content: result[0].description };
      }
      return null;
    } catch (error) {
      // If no config found, return null
      return null;
    }
  }

  async updateServiceNote(content: string): Promise<any> {
    try {
      // Store service note in a special config record
      const existing = await db.select().from(services).where(eq(services.id, -1)).limit(1);
      
      if (existing.length > 0) {
        await db.update(services)
          .set({ description: content })
          .where(eq(services.id, -1));
      } else {
        await db.insert(services).values({
          id: -1,
          categoryId: -1,
          name: "SERVICE_NOTE_CONFIG",
          description: content,
          pricePerThousand: "0",
          minQuantity: 1,
          maxQuantity: 1,
          isActive: false
        });
      }
      
      return { content };
    } catch (error) {
      console.error("Update service note error:", error);
      throw new Error("Failed to update service note");
    }
  }

  // Admin cancel order with reason - prevents double refund
  async adminCancelOrderWithReason(orderId: number, reason: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    
    // Admin can cancel any order except completed ones
    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed orders');
    }

    // Check if already cancelled to prevent double refund
    if (order.status === 'cancelled') {
      throw new Error('Order already cancelled');
    }

    // Only refund if not already refunded
    const existingRefund = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.orderId, orderId),
        eq(transactions.type, 'refund')
      ))
      .limit(1);

    if (existingRefund.length === 0) {
      // Refund wallet balance only once
      await this.updateUserWalletBalance(order.userId, order.totalPrice, 'add');

      // Create refund transaction with reason
      await this.createTransaction({
        userId: order.userId,
        type: 'refund',
        amount: order.totalPrice,
        description: `Admin cancelled Order #${order.id} - ${reason}`,
        status: 'completed',
        orderId: order.id,
      });
    }

    // Update order status to cancelled with reason
    const [cancelledOrder] = await db.update(orders)
      .set({ 
        status: 'cancelled',
        cancelReason: reason
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return cancelledOrder;
  }

  async getAdminDashboardStats(): Promise<any> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalOrdersResult] = await db.select({ count: count() }).from(orders);
    const [totalRevenueResult] = await db.select({ 
      total: sql<number>`sum(cast(${orders.totalPrice} as decimal))` 
    }).from(orders).where(eq(orders.status, 'completed'));
    const [supportTicketsResult] = await db.select({ count: count() }).from(supportTickets);
    const [activeOrdersResult] = await db.select({ count: count() }).from(orders)
      .where(sql`${orders.status} IN ('pending', 'processing')`);

    return {
      totalUsers: totalUsersResult.count,
      totalOrders: totalOrdersResult.count,
      totalRevenue: totalRevenueResult.total || 0,
      activeOrders: activeOrdersResult.count,
      supportTickets: supportTicketsResult.count,
    };
  }





  async getServiceByProviderServiceId(providerId: number, providerServiceId: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services)
      .where(
        sql`${services.providerId} = ${providerId} AND ${services.providerServiceId} = ${providerServiceId}`
      );
    return service || undefined;
  }

  async getSupportTicket(ticketId: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
    return ticket || undefined;
  }

  // Admin Messages Implementation
  async createAdminMessage(data: any): Promise<any> {
    const [message] = await db.insert(adminMessages).values(data).returning();
    return message;
  }

  async getAllAdminMessages(): Promise<any[]> {
    return await db.select().from(adminMessages).orderBy(desc(adminMessages.createdAt));
  }

  async getActiveAdminMessages(): Promise<any[]> {
    return await db.select().from(adminMessages)
      .where(eq(adminMessages.isActive, true))
      .orderBy(desc(adminMessages.createdAt));
  }

  async updateAdminMessage(id: number, data: any): Promise<any> {
    const [message] = await db.update(adminMessages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(adminMessages.id, id))
      .returning();
    return message;
  }

  async deleteAdminMessage(id: number): Promise<void> {
    await db.delete(adminMessages).where(eq(adminMessages.id, id));
  }

  // User messages functions
  async createUserMessage(data: InsertUserMessage): Promise<UserMessage> {
    const [message] = await db.insert(userMessages)
      .values(data)
      .returning();
    return message;
  }

  async getUserMessages(userId: number): Promise<UserMessage[]> {
    return await db.select().from(userMessages)
      .where(eq(userMessages.userId, userId))
      .orderBy(userMessages.createdAt);
  }

  async getAllUserMessages(): Promise<UserMessage[]> {
    return await db.select({
      id: userMessages.id,
      userId: userMessages.userId,
      username: users.username,
      message: userMessages.message,
      isFromAdmin: userMessages.isFromAdmin,
      adminId: userMessages.adminId,
      createdAt: userMessages.createdAt,
      isRead: userMessages.isRead
    })
    .from(userMessages)
    .leftJoin(users, eq(userMessages.userId, users.id))
    .orderBy(userMessages.createdAt);
  }

  async markUserMessageAsRead(messageId: number): Promise<void> {
    await db.update(userMessages)
      .set({ isRead: true })
      .where(eq(userMessages.id, messageId));
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(userMessages)
      .set({ isRead: true })
      .where(eq(userMessages.id, messageId));
  }
}

export const storage = new DatabaseStorage();