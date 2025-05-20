// cacheService.js
// A service for caching API responses to improve performance

/**
 * Cache configuration
 */
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEFAULT_MAX_CACHE_SIZE = 100; // Maximum number of cache entries

/**
 * Cache storage - using a Map for in-memory caching
 * key: cache key (string)
 * value: { data, timestamp, ttl }
 */
const cacheStore = new Map();

/**
 * Generate a cache key based on the URL and parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} - Cache key
 */
const generateCacheKey = (endpoint, params = {}) => {
  // Sort params to ensure consistent key generation regardless of param order
  const sortedParams = Object.entries(params || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  return `${endpoint}:${JSON.stringify(sortedParams)}`;
};

/**
 * Cache service for API responses
 */
const cacheService = {
  /**
   * Get data from cache
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Object|null} - Cached data or null if not found or expired
   */
  get: (endpoint, params = {}) => {
    const key = generateCacheKey(endpoint, params);
    const cached = cacheStore.get(key);
    
    // Check if cache exists and is still valid
    if (cached) {
      const now = Date.now();
      const isExpired = now - cached.timestamp > cached.ttl;
      
      if (!isExpired) {
        console.log(`Cache hit for ${key}`);
        return cached.data;
      } else {
        console.log(`Cache expired for ${key}`);
        cacheStore.delete(key);
      }
    }
    
    console.log(`Cache miss for ${key}`);
    return null;
  },
  
  /**
   * Set data in cache
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set: (endpoint, params = {}, data, ttl = DEFAULT_CACHE_DURATION) => {
    const key = generateCacheKey(endpoint, params);
    
    // Enforce cache size limit - remove oldest entries first
    if (cacheStore.size >= DEFAULT_MAX_CACHE_SIZE) {
      const oldestKey = Array.from(cacheStore.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      console.log(`Cache full, removing oldest entry: ${oldestKey}`);
      cacheStore.delete(oldestKey);
    }
    
    // Store in cache
    cacheStore.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`Cached data for ${key}`);
  },
  
  /**
   * Invalidate cache entry
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   */
  invalidate: (endpoint, params = {}) => {
    const key = generateCacheKey(endpoint, params);
    
    if (cacheStore.has(key)) {
      cacheStore.delete(key);
      console.log(`Invalidated cache for ${key}`);
      return true;
    }
    
    return false;
  },
  
  /**
   * Invalidate all cache entries that match an endpoint prefix
   * @param {string} endpointPrefix - API endpoint prefix
   */
  invalidateByPrefix: (endpointPrefix) => {
    const keysToDelete = [];
    
    for (const key of cacheStore.keys()) {
      if (key.startsWith(`${endpointPrefix}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cacheStore.delete(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries for prefix ${endpointPrefix}`);
    
    return keysToDelete.length;
  },
  
  /**
   * Clear all cache
   */
  clear: () => {
    const size = cacheStore.size;
    cacheStore.clear();
    console.log(`Cleared entire cache (${size} entries)`);
    return size;
  },
  
  /**
   * Get or set cache with auto-fetching
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Function} fetchFunction - Function to fetch data if not cached
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise} - Data from cache or fetch function
   */
  getOrSet: async (endpoint, params, fetchFunction, ttl = DEFAULT_CACHE_DURATION) => {
    // Try to get from cache first
    const cachedData = cacheService.get(endpoint, params);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Not in cache, fetch data
    try {
      const data = await fetchFunction();
      
      // Store in cache
      cacheService.set(endpoint, params, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats: () => {
    return {
      size: cacheStore.size,
      maxSize: DEFAULT_MAX_CACHE_SIZE,
      keys: Array.from(cacheStore.keys()),
      ttl: DEFAULT_CACHE_DURATION
    };
  }
};

export default cacheService;