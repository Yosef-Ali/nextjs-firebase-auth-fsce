import { LRUCache } from 'lru-cache';
import type { Partner } from '@/app/types/partner';
import { partnersService } from '@/app/services/partners';

// Define cache options type
type PartnersCacheOptions = {
  max: number;
  ttl: number;
  updateAgeOnGet: boolean;
  allowStale: boolean;
};

// Configure cache options
const cacheOptions: PartnersCacheOptions = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true, // Reset TTL when item is accessed
  allowStale: false, // Don't serve stale items
};

// Initialize cache
const partnersCache = new LRUCache<string, Partner>(cacheOptions);

export const partnersMemoryCache = {
  /**
   * Get partner from cache or fetch from database
   */
  async getPartner(partnerId: string): Promise<Partner> {
    try {
      const cached = partnersCache.get(partnerId);
      if (cached) {
        return cached;
      }

      const partner = await partnersService.getPartnerById(partnerId);
      if (!partner) {
        throw new Error(`Partner not found: ${partnerId}`);
      }

      partnersCache.set(partnerId, partner);
      return partner;
    } catch (error) {
      console.error('Cache error:', error);
      throw error;
    }
  },

  /**
   * Set or update partner in cache
   */
  setPartner(partnerId: string, partner: Partner): void {
    partnersCache.set(partnerId, partner);
  },

  /**
   * Remove partner from cache
   */
  invalidatePartner(partnerId: string): void {
    partnersCache.delete(partnerId);
  },

  /**
   * Clear entire cache
   */
  clearCache(): void {
    partnersCache.clear();
  },

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics including size, max size, hits, and misses
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
  } {
    try {
      return {
        size: partnersCache.size,
        maxSize: cacheOptions.max,
        hits: 0,
        misses: 0, // LRU Cache v6+ doesn't expose misses count
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        size: 0,
        maxSize: cacheOptions.max,
        hits: 0,
        misses: 0,
      };
    }
  },

  /**
   * Check if partner exists in cache
   */
  hasPartner(partnerId: string): boolean {
    return partnersCache.has(partnerId);
  }
};
