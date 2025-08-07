/**
 * Default activity packing lists
 */
export const DEFAULT_ACTIVITY_LISTS = {
  'Beach': {
    list_type: 'activity',
    icon: '🏖️',
    items: [
      { name: 'Swimsuit', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Beach towel', category: 'essentials', quantity: 2, weather_dependent: false },
      { name: 'Sunscreen', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Sunglasses', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Sun hat', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Flip flops/sandals', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Beach bag', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Waterproof phone case', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Beach umbrella', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Snorkel gear', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Beach volleyball/frisbee', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Cooler with drinks', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Aloe vera (sunburn relief)', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Water shoes', category: 'clothing', quantity: 1, weather_dependent: false },
    ],
  },
  'Climbing': {
    list_type: 'activity',
    icon: '🧗',
    items: [
      { name: 'Climbing shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Harness', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Helmet', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Chalk and chalk bag', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Rope (if leading)', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Quickdraws/carabiners', category: 'gear', quantity: 10, weather_dependent: false },
      { name: 'Belay device', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Approach shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Climbing tape', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Guidebook/route info', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Headlamp', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Emergency whistle', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Multi-tool', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Weather layers', category: 'clothing', quantity: 3, weather_dependent: true },
      { name: 'Rain jacket', category: 'clothing', quantity: 1, weather_dependent: true },
    ],
  },
  'Hiking': {
    list_type: 'activity',
    icon: '🥾',
    items: [
      { name: 'Hiking boots', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Backpack', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Water bottles/hydration system', category: 'essentials', quantity: 2, weather_dependent: false },
      { name: 'Trail snacks/energy bars', category: 'essentials', quantity: 5, weather_dependent: false },
      { name: 'Map and compass/GPS', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Hiking poles', category: 'gear', quantity: 2, weather_dependent: false },
      { name: 'Weather-appropriate layers', category: 'clothing', quantity: 3, weather_dependent: true },
      { name: 'Rain gear', category: 'clothing', quantity: 1, weather_dependent: true },
      { name: 'Hat and sunglasses', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Sunscreen', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Insect repellent', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Emergency whistle', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Headlamp/flashlight', category: 'tech', quantity: 1, weather_dependent: false },
    ],
  },
  'Party': {
    list_type: 'activity',
    icon: '🎉',
    items: [
      { name: 'Party outfits', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Dress shoes/heels', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Comfortable walking shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Dressy accessories', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Portable charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Cash for tips/drinks', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'ID/passport copy', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Pain relievers', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Breath mints/gum', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Small purse/wallet', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Jacket/light sweater', category: 'clothing', quantity: 1, weather_dependent: true },
      { name: 'Makeup/grooming items', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  'Business': {
    list_type: 'activity',
    icon: '💼',
    items: [
      { name: 'Business suits/formal attire', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Dress shirts', category: 'clothing', quantity: 5, weather_dependent: false },
      { name: 'Ties/accessories', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Dress shoes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Laptop and charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Business cards', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Notebook and pens', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Phone charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Presentation materials', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Professional bag/briefcase', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Travel iron', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Blazer/light jacket', category: 'clothing', quantity: 1, weather_dependent: true },
    ],
  },
  'Sightseeing': {
    list_type: 'activity',
    icon: '🏛️',
    items: [
      { name: 'Comfortable walking shoes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Camera and memory cards', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Portable charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Day pack/small backpack', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Guidebook/maps', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Water bottle', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Snacks', category: 'essentials', quantity: 3, weather_dependent: false },
      { name: 'Sunglasses', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Hat', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Comfortable casual clothes', category: 'clothing', quantity: 4, weather_dependent: false },
      { name: 'Light jacket/sweater', category: 'clothing', quantity: 1, weather_dependent: true },
      { name: 'Umbrella', category: 'essentials', quantity: 1, weather_dependent: true },
    ],
  },
};

/**
 * Default accommodation packing lists
 */
export const DEFAULT_ACCOMMODATION_LISTS = {
  'Hotel': {
    list_type: 'accommodation',
    icon: '🏨',
    items: [
      { name: 'Hair dryer (if not provided)', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Slippers', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Robe', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Do not disturb sign knowledge', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  'Camping': {
    list_type: 'accommodation',
    icon: '🏕️',
    items: [
      { name: 'Tent', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Sleeping bag', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Camping pillow', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Outdoor mattress', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Camping stove and fuel', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Cookware and utensils', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Cooler with ice', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Headlamp/flashlight', category: 'tech', quantity: 2, weather_dependent: false },
      { name: 'Fire starter/matches', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Insect repellent', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Camping chairs', category: 'gear', quantity: 2, weather_dependent: false },
      { name: 'Rope/paracord', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Multi-tool/knife', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Trash bags', category: 'essentials', quantity: 5, weather_dependent: false },
      { name: 'Toilet paper', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Hand sanitizer', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  'Glamping': {
    list_type: 'accommodation',
    icon: '⛺',
    items: [
      { name: 'Comfortable loungewear', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Slippers', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Personal toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Camera for glamping photos', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Book/e-reader', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  'Couch Surfing': {
    list_type: 'accommodation',
    icon: '🛋️',
    items: [
      { name: 'Sleeping bag or bedding', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Travel pillow', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Toiletries bag', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Towel', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Flip flops/slippers', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Host gift', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Eye mask and earplugs', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  'Airbnb': {
    list_type: 'accommodation',
    icon: '🏠',
    items: [
      { name: 'Toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Towel (check if provided)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Basic cooking supplies', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Coffee/tea', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Cleaning supplies', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Slippers', category: 'clothing', quantity: 1, weather_dependent: false },
    ],
  },
};

/**
 * Default companion packing lists
 */
export const DEFAULT_COMPANION_LISTS = {
  'Solo Travel': {
    list_type: 'companion',
    icon: '🧍',
    items: [
      { name: 'Personal safety items', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Emergency contact list', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Entertainment (books, music)', category: 'essentials', quantity: 3, weather_dependent: false },
      { name: 'Backup communication device', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Solo dining comfort items', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  'With Partner': {
    list_type: 'companion',
    icon: '💑',
    items: [
      { name: 'Shared items coordination', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Romantic dinner outfit', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Camera for couple photos', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Shared toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  'With Friends': {
    list_type: 'companion',
    icon: '👥',
    items: [
      { name: 'Group activity supplies', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Shared accommodation items', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Party/social clothes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Group photos camera', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Cash for splitting bills', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  'With Family': {
    list_type: 'companion',
    icon: '👨‍👩‍👧',
    items: [
      { name: 'Family activity supplies', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Child-friendly items', category: 'essentials', quantity: 3, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Entertainment for kids', category: 'essentials', quantity: 5, weather_dependent: false },
      { name: 'Snacks', category: 'essentials', quantity: 10, weather_dependent: false },
      { name: 'Family photos equipment', category: 'tech', quantity: 1, weather_dependent: false },
    ],
  },
};

// Expanded tip lists
export const DEFAULT_TIP_LISTS = {
  day_before: [
    'Check flight/travel times and any delays',
    'Print boarding passes and tickets',
    'Charge all electronic devices',
    'Download offline maps and entertainment',
    'Set out-of-office email response',
    'Check weather forecast for destination',
    'Empty fridge of perishables',
    'Do laundry if needed',
    'Prepare documents and tickets',
    'Confirm accommodation bookings',
    'Check visa/passport expiration dates',
    'Notify bank of travel plans',
    'Pack carry-on essentials',
    'Check airline baggage restrictions',
    'Set up international phone plan',
    'Research local customs and tipping',
    'Pack medications in carry-on',
    'Check public transport options',
    'Prepare emergency contact list',
    'Download translation apps if needed',
  ],
  before_leaving: [
    'Check all windows are closed and locked',
    'Unplug non-essential appliances',
    'Adjust thermostat for energy savings',
    'Lock all doors and activate security',
    'Take out trash and recycling',
    'Check you have your passport/ID',
    'Check you have your wallet and cards',
    'Turn off water main if needed',
    'Set lights on timers for security',
    'Stop mail and newspaper delivery',
    'Double-check luggage locks',
    'Confirm ride to airport/station',
    'Check one last time for essentials',
    'Take final photos of important documents',
    'Ensure all devices are fully charged',
    'Check flight status one more time',
    'Verify accommodation address',
    'Keep emergency cash accessible',
    'Leave itinerary with trusted contact',
    'Do final weather check for destination',
  ],
};

/**
 * Get all default lists for a user
 */
export function getAllDefaultLists() {
  return {
    activities: DEFAULT_ACTIVITY_LISTS,
    accommodation: DEFAULT_ACCOMMODATION_LISTS,
    companions: DEFAULT_COMPANION_LISTS,
    tips: DEFAULT_TIP_LISTS,
  };
}

/**
 * Create initial list data for database insertion
 */
export function createInitialListsForUser(userId) {
  const lists = [];
  
  // Add activity lists
  Object.entries(DEFAULT_ACTIVITY_LISTS).forEach(([displayName, listData]) => {
    lists.push({
      ...listData,
      display_name: displayName,
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
    });
  });
  
  // Add accommodation lists
  Object.entries(DEFAULT_ACCOMMODATION_LISTS).forEach(([displayName, listData]) => {
    lists.push({
      ...listData,
      display_name: displayName,
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
    });
  });
  
  // Add companion lists
  Object.entries(DEFAULT_COMPANION_LISTS).forEach(([displayName, listData]) => {
    lists.push({
      ...listData,
      display_name: displayName,
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
    });
  });
  
  return lists;
}

/**
 * Create default tip lists for database insertion
 */
export function createDefaultTipListsForUser(userId) {
  return Object.entries(DEFAULT_TIP_LISTS).map(([listType, tips]) => ({
    list_type: listType,
    owner_id: userId,
    created_by_id: userId,
    created_by: 'system',
    tips: tips.map((content, index) => ({
      id: `${listType}_${index}`,
      content,
      order: index,
    })),
  }));
}

/**
 * Create default list types for database insertion
 */
export function createDefaultListTypesForUser(userId) {
  const listTypes = [];
  
  // Add activity list types
  Object.entries(DEFAULT_ACTIVITY_LISTS).forEach(([displayName, listData]) => {
    listTypes.push({
      type_group: 'activity',
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: displayName,
      icon: listData.icon,
      description: `Items needed for ${displayName.toLowerCase()}`,
      created_by_id: userId,
    });
  });
  
  // Add accommodation list types
  Object.entries(DEFAULT_ACCOMMODATION_LISTS).forEach(([displayName, listData]) => {
    listTypes.push({
      type_group: 'accommodation',
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: displayName,
      icon: listData.icon,
      description: `Items needed for ${displayName.toLowerCase()}`,
      created_by_id: userId,
    });
  });
  
  // Add companion list types
  Object.entries(DEFAULT_COMPANION_LISTS).forEach(([displayName, listData]) => {
    listTypes.push({
      type_group: 'companion',
      list_name: displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: displayName,
      icon: listData.icon,
      description: `Items needed when traveling with ${displayName.toLowerCase()}`,
      created_by_id: userId,
    });
  });
  
  return listTypes;
}