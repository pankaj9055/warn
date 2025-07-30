import axios from 'axios';
import { storage } from './storage';
import type { Provider, Service, ServiceCategory } from '@shared/schema';

export interface ProviderService {
  service: string;
  name: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  type: string;
  description?: string;
}

export interface ProviderResponse {
  services?: ProviderService[];
  error?: string;
}

export class ProviderAPI {
  private static instance: ProviderAPI;
  
  public static getInstance(): ProviderAPI {
    if (!ProviderAPI.instance) {
      ProviderAPI.instance = new ProviderAPI();
    }
    return ProviderAPI.instance;
  }

  // Get provider account balance
  async getProviderBalance(provider: Provider): Promise<{ balance: number; currency: string }> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'balance'
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && typeof response.data.balance !== 'undefined') {
        return {
          balance: parseFloat(response.data.balance) || 0,
          currency: response.data.currency || 'USD'
        };
      }
      
      return { balance: 0, currency: 'USD' };
    } catch (error) {
      console.error(`Error fetching balance from provider ${provider.name}:`, error);
      return { balance: 0, currency: 'USD' };
    }
  }



  // Check order status with provider
  async checkOrderStatus(provider: Provider, orderId: string): Promise<{
    status: string;
    start_count?: number;
    remains?: number;
    delivered_count?: number;
    completion_percentage?: number;
  }> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'status',
        order: orderId
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data) {
        const startCount = parseInt(response.data.start_count || '0');
        const remains = parseInt(response.data.remains || '0');
        
        // Calculate delivered count and completion percentage
        let deliveredCount = 0;
        let completionPercentage = 0;
        
        if (startCount > 0 && response.data.charge) {
          // Calculate delivered based on start count and remains
          // For most providers: delivered = total_ordered - remains
          const currentCount = parseInt(response.data.current || response.data.current_count || startCount.toString());
          deliveredCount = Math.max(0, currentCount - startCount);
          
          // Calculate completion percentage
          if (response.data.charge) {
            const totalQuantity = parseInt(response.data.charge) || (startCount + remains);
            completionPercentage = totalQuantity > 0 ? (deliveredCount / totalQuantity) * 100 : 0;
          }
        }

        return {
          status: response.data.status || 'Pending',
          start_count: startCount,
          remains: remains,
          delivered_count: deliveredCount,
          completion_percentage: Math.round(completionPercentage * 100) / 100
        };
      }
      
      return { status: 'Pending', start_count: 0, remains: 0, delivered_count: 0, completion_percentage: 0 };
    } catch (error) {
      console.error(`Error checking order status with provider ${provider.name}:`, error);
      return { status: 'Pending', start_count: 0, remains: 0, delivered_count: 0, completion_percentage: 0 };
    }
  }

  async fetchProviderServices(provider: Provider): Promise<ProviderService[]> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'services'
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      throw new Error('Invalid response format from provider');
    } catch (error) {
      console.error(`Error fetching services from provider ${provider.name}:`, error);
      throw error;
    }
  }

  async syncProviderServices(providerId: number): Promise<{ synced: number; errors: string[] }> {
    const provider = await storage.getProvider(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    try {
      const providerServices = await this.fetchProviderServices(provider);
      const errors: string[] = [];
      let synced = 0;

      // Create category map
      const categoryMap = new Map<string, number>();
      const categories = await storage.getServiceCategories();
      
      for (const category of categories) {
        categoryMap.set(category.slug.toLowerCase(), category.id);
      }

      // Create missing categories
      const categorySet = new Set(providerServices.map(s => s.category.toLowerCase()));
      const uniqueCategories = Array.from(categorySet);
      for (const categoryName of uniqueCategories) {
        if (!categoryMap.has(categoryName)) {
          try {
            const newCategory = await storage.createServiceCategory({
              name: this.formatCategoryName(categoryName),
              slug: categoryName,
              icon: this.getCategoryIcon(categoryName),
              color: this.getCategoryColor(categoryName),
              isActive: true
            });
            categoryMap.set(categoryName, newCategory.id);
          } catch (error) {
            errors.push(`Failed to create category ${categoryName}: ${error}`);
          }
        }
      }

      // Sync services
      for (const providerService of providerServices) {
        try {
          const categoryId = categoryMap.get(providerService.category.toLowerCase());
          if (!categoryId) {
            errors.push(`Category not found for service ${providerService.service}`);
            continue;
          }

          // Check if service already exists
          const existingService = await storage.getServiceByProviderServiceId(
            providerId, 
            providerService.service
          );

          const serviceData = {
            categoryId,
            name: providerService.name,
            description: providerService.description || `${providerService.name} from ${provider.name}`,
            pricePerThousand: parseFloat(providerService.rate).toString(),
            minQuantity: parseInt(providerService.min),
            maxQuantity: parseInt(providerService.max),
            isActive: true,
            providerId,
            providerServiceId: providerService.service
          };

          if (existingService) {
            await storage.updateService(existingService.id, serviceData);
          } else {
            await storage.createService(serviceData);
          }
          
          synced++;
        } catch (error) {
          errors.push(`Failed to sync service ${providerService.service}: ${error}`);
        }
      }

      // Update provider balance
      await this.updateProviderBalance(provider);

      return { synced, errors };
    } catch (error) {
      throw new Error(`Failed to sync services: ${error}`);
    }
  }

  async updateProviderBalance(provider: Provider): Promise<void> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'balance'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.balance) {
        await storage.updateProvider(provider.id, {
          balance: parseFloat(response.data.balance).toFixed(2)
        });
      }
    } catch (error) {
      console.error(`Error updating balance for provider ${provider.name}:`, error);
    }
  }

  async placeOrderWithProvider(
    provider: Provider, 
    service: string, 
    link: string, 
    quantity: number
  ): Promise<{ order?: string; error?: string }> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'add',
        service,
        link,
        quantity: quantity.toString()
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.order) {
        return { order: response.data.order };
      }
      
      return { error: response.data?.error || 'Unknown error occurred' };
    } catch (error) {
      return { error: `API Error: ${error}` };
    }
  }

  async getOrderStatus(
    provider: Provider, 
    orderId: string
  ): Promise<{ status?: string; start_count?: number; remains?: number; error?: string }> {
    try {
      const response = await axios.post(provider.apiUrl, {
        key: provider.apiKey,
        action: 'status',
        order: orderId
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data) {
        return {
          status: response.data.status,
          start_count: response.data.start_count ? parseInt(response.data.start_count) : undefined,
          remains: response.data.remains ? parseInt(response.data.remains) : undefined
        };
      }
      
      return { error: 'No data received' };
    } catch (error) {
      return { error: `API Error: ${error}` };
    }
  }

  private formatCategoryName(slug: string): string {
    const nameMap: Record<string, string> = {
      'instagram': 'Instagram',
      'youtube': 'YouTube',
      'facebook': 'Facebook',
      'twitter': 'Twitter',
      'tiktok': 'TikTok',
      'telegram': 'Telegram',
      'linkedin': 'LinkedIn',
      'snapchat': 'Snapchat',
      'pinterest': 'Pinterest',
      'discord': 'Discord',
      'twitch': 'Twitch',
      'spotify': 'Spotify',
      'soundcloud': 'SoundCloud'
    };
    
    return nameMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  private getCategoryIcon(slug: string): string {
    const iconMap: Record<string, string> = {
      'instagram': 'Instagram',
      'youtube': 'Youtube',
      'facebook': 'Facebook',
      'twitter': 'Twitter',
      'tiktok': 'Music',
      'telegram': 'Send',
      'linkedin': 'Linkedin',
      'snapchat': 'Camera',
      'pinterest': 'Pin',
      'discord': 'MessageCircle',
      'twitch': 'Tv',
      'spotify': 'Music',
      'soundcloud': 'Headphones'
    };
    
    return iconMap[slug] || 'Globe';
  }

  private getCategoryColor(slug: string): string {
    const colorMap: Record<string, string> = {
      'instagram': '#E4405F',
      'youtube': '#FF0000',
      'facebook': '#1877F2',
      'twitter': '#1DA1F2',
      'tiktok': '#000000',
      'telegram': '#0088CC',
      'linkedin': '#0077B5',
      'snapchat': '#FFFC00',
      'pinterest': '#BD081C',
      'discord': '#5865F2',
      'twitch': '#9146FF',
      'spotify': '#1DB954',
      'soundcloud': '#FF5500'
    };
    
    return colorMap[slug] || '#6366F1';
  }
}

export const providerAPI = ProviderAPI.getInstance();

// Export convenience functions for backward compatibility
export const getProviderBalance = async (provider: Provider) => {
  return providerAPI.getProviderBalance(provider);
};

export const placeOrder = async (provider: Provider, service: string, link: string, quantity: number) => {
  return providerAPI.placeOrderWithProvider(provider, service, link, quantity);
};

export const checkOrderStatus = async (provider: Provider, orderId: string) => {
  return providerAPI.getOrderStatus(provider, orderId);
};

export const updateProviderBalance = async (provider: Provider) => {
  return providerAPI.updateProviderBalance(provider);
};

export const getProviderServices = async (provider: Provider) => {
  return providerAPI.fetchProviderServices(provider);
};

export const testProviderConnection = async (provider: Provider) => {
  try {
    const balance = await providerAPI.getProviderBalance(provider);
    return { success: true, balance };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const fetchProviderServices = async (provider: Provider) => {
  return providerAPI.fetchProviderServices(provider);
};