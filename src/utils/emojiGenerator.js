/**
 * Emoji generation utility for list items
 * Uses OpenAI API for intelligent emoji selection with fallback to mock logic
 */

import { openaiEmojiService } from '../services/openaiEmojiService';

const CATEGORY_EMOJIS = {
  clothing: {
    default: '👕',
    keywords: {
      shirt: '👕',
      pants: '👖',
      jeans: '👖',
      dress: '👗',
      jacket: '🧥',
      coat: '🧥',
      shoes: '👟',
      boots: '🥾',
      sneakers: '👟',
      sandals: '🩴',
      socks: '🧦',
      underwear: '🩲',
      bra: '👙',
      hat: '🧢',
      cap: '🧢',
      swimsuit: '🩱',
      bikini: '👙',
      shorts: '�³',
      sweater: '🧥',
      hoodie: '🧥',
      outfit: '👗',
      'party outfit': '🎉',
      'formal outfit': '👔',
      'casual outfit': '👕',
      'evening outfit': '👗',
      'party dress': '💃',
      'party clothes': '🎉',
      'formal wear': '👔',
      'evening wear': '👗',
      blouse: '👚',
      skirt: '👗',
      tie: '👔',
      suit: '👔',
      tuxedo: '🤵',
      'evening gown': '👗',
    },
  },
  toiletries: {
    default: '🧴',
    keywords: {
      toothbrush: '🪥',
      toothpaste: '🦷',
      shampoo: '🧴',
      soap: '🧼',
      razor: '🪒',
      towel: '🩴',
      sunscreen: '🧴',
      lotion: '🧴',
      perfume: '💐',
      deodorant: '🧴',
      makeup: '💄',
      lipstick: '💄',
      medicine: '💊',
      pills: '💊',
      bandaid: '🩹',
    },
  },
  tech: {
    default: '📱',
    keywords: {
      phone: '📱',
      laptop: '💻',
      computer: '💻',
      camera: '📷',
      charger: '🔌',
      cable: '🔌',
      headphones: '🎧',
      earbuds: '🎧',
      watch: '⌚',
      tablet: '📱',
      battery: '🔋',
      adapter: '🔌',
      cord: '🔌',
    },
  },
  gear: {
    default: '🎒',
    keywords: {
      backpack: '🎒',
      bag: '🎒',
      tent: '⛺',
      sleeping: '🛏️',
      flashlight: '🔦',
      torch: '🔦',
      compass: '🧭',
      knife: '🔪',
      rope: '🪢',
      carabiner: '🔗',
      helmet: '⛑️',
      gloves: '🧤',
      sunglasses: '🕶️',
      umbrella: '☂️',
    },
  },
  essentials: {
    default: '⭐',
    keywords: {
      passport: '📘',
      ticket: '🎫',
      boarding: '🎫',
      wallet: '💳',
      money: '💰',
      cash: '💵',
      keys: '🔑',
      documents: '📋',
      insurance: '📋',
      map: '🗺️',
      guide: '📖',
      water: '💧',
      bottle: '🍼',
      snacks: '🍿',
      food: '🍎',
    },
  },
  additional: {
    default: '📦',
    keywords: {
      gift: '🎁',
      souvenir: '🎁',
      book: '📖',
      journal: '📔',
      pen: '✏️',
      pencil: '✏️',
      notebook: '📓',
    },
  },
};

const ACTIVITY_EMOJIS = {
  beach: '🏖️',
  camping: '🏕️',
  hiking: '🥾',
  climbing: '🧗',
  business: '💼',
  partying: '🎉',
  sightseeing: '📸',
};

/**
 * Generate an emoji for an item using OpenAI with fallback to mock logic
 * @param {string} itemName - The name of the item
 * @param {string} category - The category of the item
 * @param {string[]} activities - Activities associated with the list (optional)
 * @returns {Promise<string>|string} - The generated emoji (async if OpenAI, sync if fallback)
 */
export async function generateEmojiForItem(itemName, category = 'essentials', activities = []) {
  if (!itemName) return '📦';

  // Try OpenAI first if available
  if (openaiEmojiService.isAvailable()) {
    try {
      console.log(`🤖 Generating emoji for "${itemName}" using OpenAI o4-mini...`);
      const aiEmoji = await openaiEmojiService.generateEmoji(itemName, category, activities);
      if (aiEmoji) {
        console.log(`✅ OpenAI generated: ${aiEmoji} for "${itemName}"`);
        return aiEmoji;
      }
    } catch (error) {
      console.warn('OpenAI emoji generation failed, falling back to mock logic:', error);
    }
  } else {
    console.log(`⚠️ OpenAI not available for "${itemName}", using mock logic`);
  }

  // Fallback to original mock logic
  const mockEmoji = generateEmojiMockLogic(itemName, category, activities);
  console.log(`🎭 Mock logic generated: ${mockEmoji} for "${itemName}" (category: ${category})`);
  return mockEmoji;
}

/**
 * Original mock logic for emoji generation (used as fallback)
 * @param {string} itemName - The name of the item
 * @param {string} category - The category of the item
 * @param {string[]} activities - Activities associated with the list (optional)
 * @returns {string} - The generated emoji
 */
function generateEmojiMockLogic(itemName, category = 'essentials', activities = []) { // eslint-disable-line no-unused-vars
  if (!itemName) return '📦';

  const name = itemName.toLowerCase();
  
  // First: Search across ALL categories for keyword matches (more intelligent)
  for (const [categoryName, categoryConfig] of Object.entries(CATEGORY_EMOJIS)) {
    for (const [keyword, emoji] of Object.entries(categoryConfig.keywords)) {
      if (name.includes(keyword)) {
        console.log(
          `🎯 Found emoji ${emoji} for "${itemName}" in ${categoryName} keywords`,
        );
        return emoji;
      }
    }
  }

  // Second: Check activity-related keywords in the item name
  for (const [activity, emoji] of Object.entries(ACTIVITY_EMOJIS)) {
    if (name.includes(activity)) {
      console.log(`🏃 Found activity emoji ${emoji} for "${itemName}" (activity: ${activity})`);
      return emoji;
    }
  }
  
  // Check for "party" specifically (handles "party outfit", "party dress", etc.)
  if (name.includes('party')) {
    console.log(`🎉 Found party-related item: ${itemName}`);
    return '🎉';
  }

  // Third: Special cases for common items
  const specialCases = {
    'sun': '☀️',
    'rain': '🌧️', 
    'snow': '❄️',
    'warm': '🔥',
    'hot': '🔥',
    'cold': '❄️',
    'cool': '❄️',
    'emergency': '🚨',
    'first aid': '🩹',
    'travel': '✈️',
    'money': '💰',
    'cash': '💵',
    'credit card': '💳',
    'passport': '📘',
    'ticket': '🎫',
    'camera': '📷',
    'phone': '📱',
    'charger': '🔌',
    'battery': '🔋',
    'book': '📖',
    'medicine': '💊',
    'pills': '💊',
    'vitamins': '💊',
  };
  
  for (const [keyword, emoji] of Object.entries(specialCases)) {
    if (name.includes(keyword)) {
      console.log(`⭐ Found special case emoji ${emoji} for "${itemName}" (keyword: ${keyword})`);
      return emoji;
    }
  }

  // Fourth: Use category default if category exists
  const categoryConfig = CATEGORY_EMOJIS[category];
  if (categoryConfig) {
            console.log(
          `📂 Using category default ${categoryConfig.default} for "${itemName}" ` +
          `(category: ${category})`,
        );
    return categoryConfig.default;
  }

  // Final fallback
  console.log(`📦 Using final fallback for "${itemName}" (no matches found)`);
  return '📦';
}

/**
 * Generate emojis for a list of items (async version for OpenAI)
 * @param {Array} items - Array of items with name and category
 * @param {string[]} activities - Activities associated with the list (optional)
 * @returns {Promise<Array>} - Array of items with emojis added
 */
export async function generateEmojisForItems(items, activities = []) {
  const results = [];
  
  for (const item of items) {
    if (!item.emoji) {
      const emoji = await generateEmojiForItem(item.name, item.category, activities);
      results.push({ ...item, emoji });
    } else {
      results.push(item);
    }
  }
  
  return results;
}

/**
 * Synchronous version using only mock logic (for backward compatibility)
 * @param {Array} items - Array of items with name and category
 * @param {string[]} activities - Activities associated with the list (optional)
 * @returns {Array} - Array of items with emojis added
 */
export function generateEmojisForItemsSync(items, activities = []) {
  return items.map(item => ({
    ...item,
    emoji: item.emoji || generateEmojiMockLogic(item.name, item.category, activities),
  }));
}

/**
 * Get suggested emojis for a category
 * @param {string} category - The category to get emojis for
 * @returns {string[]} - Array of suggested emojis
 */
export function getSuggestedEmojisForCategory(category) {
  const categoryConfig = CATEGORY_EMOJIS[category];
  if (!categoryConfig) return ['📦'];
  
  return [
    categoryConfig.default,
    ...Object.values(categoryConfig.keywords).slice(0, 5),
  ];
} 
