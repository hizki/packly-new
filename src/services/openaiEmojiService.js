import OpenAI from 'openai';

/**
 * OpenAI Emoji Generation Service
 * Uses OpenAI API to generate contextually appropriate emojis for items
 */

class OpenAIEmojiService {
  constructor() {
    this.openai = null;
    this.cache = new Map(); // Cache to avoid repeated API calls
    this.maxCacheSize = 1000; // Limit cache size
    this.apiKey = import.meta.env.VITE_OPENAI_EMOJI_API_KEY;
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        // Note: In production, this should be handled server-side
        dangerouslyAllowBrowser: true,
      });
    }
  }

  /**
   * Generate emoji for an item using OpenAI
   * @param {string} itemName - The name of the item
   * @param {string} category - Optional category for context
   * @param {string[]} activities - Optional activities for context
   * @returns {Promise<string|null>} - The generated emoji or null if failed
   */
  async generateEmoji(itemName, category = null, activities = []) {
    if (!this.openai || !itemName?.trim()) {
      return null;
    }

    // Create cache key
    const activitiesPart = activities.sort().join(',');
    const cacheKey = `${itemName.toLowerCase()}-${category}-${activitiesPart}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Build context for better emoji selection
      let phrase = itemName.trim();
      
      if (category) {
        phrase += ` (${category})`;
      }
      
      if (activities.length > 0) {
        phrase += ` for ${activities.join(', ')}`;
      }

      const completion = await this.openai.chat.completions.create({
        model: 'o4-mini',
        messages: [
          {
            role: 'developer',
            content: 
              'You are an emoji matcher. Return exactly ONE emoji that best represents the item. ' +
              'Examples: "hat" → 🧢, "sunscreen" → ☀️, "toothbrush" → 🪥, "passport" → 📘, ' +
              '"shoes" → 👟, "jacket" → 🧥, "camera" → 📷, "phone charger" → 🔌. ' +
              'Always prioritize: 1) Physical object emojis over abstract ones. ' +
              '2) Most commonly used emoji for that item. 3) Return ONLY the emoji, no text.',
          },
          {
            role: 'user',
            content: `Input: '${phrase}'\nOutput: [exactly one emoji]`,
          },
        ],
        max_tokens: 10,
        // Lower temperature for more consistent results
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      
      // Validate that response is a single emoji
      if (response && this.isValidEmoji(response)) {
        // Cache the result
        this.addToCache(cacheKey, response);
        return response;
      }
      
      console.warn('OpenAI emoji response not valid:', response);
      return null;
      
    } catch (error) {
      console.error('OpenAI emoji generation failed:', error);
      console.error('Error details:', error.message);
      if (error.code) console.error('Error code:', error.code);
      return null;
    }
  }

  /**
   * Check if a string is a valid single emoji
   * @param {string} str - String to check
   * @returns {boolean} - True if valid emoji
   */
  isValidEmoji(str) {
    if (!str || str.length === 0) return false;
    
    // Basic emoji regex pattern
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
    
    // Check if it's a single emoji (accounting for some multi-byte emojis)
    const trimmed = str.trim();
    return emojiRegex.test(trimmed) && trimmed.length <= 4;
  }

  /**
   * Add emoji to cache with size management
   * @param {string} key - Cache key
   * @param {string} emoji - Emoji to cache
   */
  addToCache(key, emoji) {
    // If cache is too large, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, emoji);
  }

  /**
   * Clear the emoji cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()).slice(0, 10), // First 10 keys for debugging
    };
  }

  /**
   * Check if OpenAI service is available
   * @returns {boolean} - True if service is configured and ready
   */
  isAvailable() {
    return !!this.openai;
  }
}

// Create and export singleton instance
export const openaiEmojiService = new OpenAIEmojiService();

// Export the class for testing
export { OpenAIEmojiService }; 
