/**
 * Default list data for new users
 * Comprehensive packing suggestions based on activity, accommodation, and companion types
 */

// Activity-based packing lists
export const DEFAULT_ACTIVITY_LISTS = {
  beach: {
    list_type: 'activity',
    display_name: 'Beach Trip',
    icon: '🏖️',
    items: [
      { name: 'Sunscreen (SPF 30+)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Beach towel', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Swimsuit/Bikini', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Sunglasses', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Beach hat/cap', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Flip flops/sandals', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Beach bag', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Water bottle', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Waterproof phone case', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Beach umbrella', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Snorkeling gear', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Beach volleyball', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Aloe vera gel', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  camping: {
    list_type: 'activity',
    display_name: 'Camping',
    icon: '🏕️',
    items: [
      { name: 'Tent', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Sleeping bag', category: 'gear', quantity: 1, weather_dependent: true },
      { name: 'Sleeping pad/mat', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Camping pillow', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Headlamp/flashlight', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Extra batteries', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Camping stove', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Cookware set', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Water filter/purification tablets', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Multi-tool/knife', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Rope/paracord', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Rain jacket', category: 'clothing', quantity: 1, weather_dependent: true },
      { name: 'Warm layers', category: 'clothing', quantity: 2, weather_dependent: true },
      { name: 'Hiking boots', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Quick-dry clothes', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Bug spray', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Toilet paper & trowel', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  climbing: {
    list_type: 'activity',
    display_name: 'Climbing',
    icon: '🧗',
    items: [
      { name: 'Climbing harness', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Climbing helmet', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Climbing shoes', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Dynamic rope', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Quickdraws', category: 'gear', quantity: 12, weather_dependent: false },
      { name: 'Belay device', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Carabiners', category: 'gear', quantity: 6, weather_dependent: false },
      { name: 'Chalk bag', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Chalk', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Climbing gloves', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Approach shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Athletic tape', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'First aid kit', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Weather protection', category: 'clothing', quantity: 1, weather_dependent: true },
    ],
  },
  hiking: {
    list_type: 'activity',
    display_name: 'Hiking',
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
  partying: {
    list_type: 'activity',
    display_name: 'Party',
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
  business: {
    list_type: 'activity',
    display_name: 'Business',
    icon: '💼',
    items: [
      { name: 'Business suits/professional attire', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Dress shirts/blouses', category: 'clothing', quantity: 5, weather_dependent: false },
      { name: 'Ties/scarves', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Professional shoes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Laptop and charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Business cards', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Notebook and pens', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Presentation materials', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Phone charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Professional bag/briefcase', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Iron/wrinkle release spray', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Belt and cufflinks', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Travel-sized toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
    ],
  },
  sightseeing: {
    list_type: 'activity',
    display_name: 'Sightseeing',
    icon: '🏛️',
    items: [
      { name: 'Comfortable walking shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Camera or smartphone', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Portable charger/power bank', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Guidebook or offline maps', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Day backpack', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Water bottle', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Snacks', category: 'essentials', quantity: 3, weather_dependent: false },
      { name: 'Sunscreen and hat', category: 'toiletries', quantity: 1, weather_dependent: true },
      { name: 'Weather-appropriate layers', category: 'clothing', quantity: 2, weather_dependent: true },
      { name: 'Cash for entrance fees', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Tickets/reservations printouts', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Comfortable casual clothes', category: 'clothing', quantity: 3, weather_dependent: false },
    ],
  },
};

// Accommodation-based packing lists
export const DEFAULT_ACCOMMODATION_LISTS = {
  hotel: {
    list_type: 'accommodation',
    display_name: 'Hotel',
    icon: '🏨',
    items: [
      { name: 'Formal/semi-formal attire', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Comfortable room clothes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Slippers', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Phone charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Travel-sized toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Hair dryer (if not provided)', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Iron/garment steamer', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Cash for tips', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Laptop/tablet for entertainment', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Room service menu research', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  camping: {
    list_type: 'accommodation',
    display_name: 'Camping',
    icon: '🏕️',
    items: [
      { name: 'Tent (if not provided)', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Sleeping bag', category: 'gear', quantity: 1, weather_dependent: true },
      { name: 'Sleeping pad', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Camping pillow', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Flashlight/headlamp', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Biodegradable soap', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Quick-dry towel', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Campsite cooking gear', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Water storage/filtration', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Weather protection layers', category: 'clothing', quantity: 3, weather_dependent: true },
      { name: 'Extra socks and underwear', category: 'clothing', quantity: 5, weather_dependent: false },
    ],
  },
  glamping: {
    list_type: 'accommodation',
    display_name: 'Glamping',
    icon: '⛺',
    items: [
      { name: 'Comfortable outdoor clothes', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'Cozy evening wear', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Sturdy outdoor shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Light jacket/sweater', category: 'clothing', quantity: 1, weather_dependent: true },
      { name: 'Camera for scenic views', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Books/kindle for relaxation', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Binoculars for wildlife', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Insect repellent', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Flashlight for night walks', category: 'tech', quantity: 1, weather_dependent: false },
    ],
  },
  couch_surfing: {
    list_type: 'accommodation',
    display_name: 'Couch Surfing',
    icon: '🛋️',
    items: [
      { name: 'Sleeping bag/travel sheets', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Travel pillow', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Eye mask and ear plugs', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Respectful guest gifts', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Quick-dry towel', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Minimal, organized toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Comfortable indoor clothes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Slippers/house shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Host contact information', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Backup accommodation plan', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  airbnb: {
    list_type: 'accommodation',
    display_name: 'Airbnb',
    icon: '🏠',
    items: [
      { name: 'Check-in instructions printout', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Host contact information', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Groceries for cooking', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Coffee/tea supplies', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Kitchen basics (if needed)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Laundry detergent pods', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Comfortable home clothes', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'All necessary toiletries', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Entertainment (books, games)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Extra bedding (if uncertain)', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
};

// Companion-based packing lists
export const DEFAULT_COMPANION_LISTS = {
  alone: {
    list_type: 'companion',
    display_name: 'Solo Travel',
    icon: '🧍',
    items: [
      { name: 'Emergency contact list', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Copies of important documents', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Personal safety items', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Entertainment (books, games)', category: 'essentials', quantity: 2, weather_dependent: false },
      { name: 'Solo dining research', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Local SIM card/international plan', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Portable charger', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Journal/travel diary', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Cash for solo expenses', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Confidence-boosting outfits', category: 'clothing', quantity: 2, weather_dependent: false },
    ],
  },
  spouse: {
    list_type: 'companion',
    display_name: 'With Partner',
    icon: '💑',
    items: [
      { name: 'Romantic dinner outfit', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Couple activities research', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Camera for couple photos', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Shared toiletries (if preferred)', category: 'toiletries', quantity: 1, weather_dependent: false },
      { name: 'Anniversary/special occasion items', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Comfortable matching outfits', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Surprise treats/gifts', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Shared entertainment', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Couple spa/massage items', category: 'essentials', quantity: 1, weather_dependent: false },
    ],
  },
  friends: {
    list_type: 'companion',
    display_name: 'With Friends',
    icon: '👥',
    items: [
      { name: 'Group activity supplies', category: 'gear', quantity: 1, weather_dependent: false },
      { name: 'Sharing-size snacks', category: 'essentials', quantity: 3, weather_dependent: false },
      { name: 'Party/social clothes', category: 'clothing', quantity: 2, weather_dependent: false },
      { name: 'Group games/cards', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Shared expenses fund', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Group photo props', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'First aid kit (for group)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Group communication plan', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Backup plans for activities', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Extra phone chargers', category: 'tech', quantity: 2, weather_dependent: false },
    ],
  },
  family: {
    list_type: 'companion',
    display_name: 'With Family',
    icon: '👨‍👩‍👧',
    items: [
      { name: 'Family entertainment/games', category: 'essentials', quantity: 2, weather_dependent: false },
      { name: 'Child-friendly snacks', category: 'essentials', quantity: 5, weather_dependent: false },
      { name: 'Family-appropriate outfits', category: 'clothing', quantity: 3, weather_dependent: false },
      { name: 'First aid kit (comprehensive)', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Child safety items', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Educational materials/guidebooks', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Camera for family memories', category: 'tech', quantity: 1, weather_dependent: false },
      { name: 'Comfortable family shoes', category: 'clothing', quantity: 1, weather_dependent: false },
      { name: 'Emergency contact information', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Family activity research', category: 'essentials', quantity: 1, weather_dependent: false },
      { name: 'Extra clothing for kids', category: 'clothing', quantity: 2, weather_dependent: false },
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
 * Create default list data for database insertion
 */
export function createDefaultListsForUser(userId) {
  const lists = [];
  
  // Add activity lists
  Object.entries(DEFAULT_ACTIVITY_LISTS).forEach(([listName, listData]) => {
    lists.push({
      ...listData,
      list_name: listName,
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
      is_sample: true,
    });
  });
  
  // Add accommodation lists
  Object.entries(DEFAULT_ACCOMMODATION_LISTS).forEach(([listName, listData]) => {
    lists.push({
      ...listData,
      list_name: listName,
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
      is_sample: true,
    });
  });
  
  // Add companion lists
  Object.entries(DEFAULT_COMPANION_LISTS).forEach(([listName, listData]) => {
    lists.push({
      ...listData,
      list_name: listName,
      owner_id: userId,
      created_by_id: userId,
      created_by: 'system',
      is_sample: true,
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
    is_sample: true,
    tips: tips.map((content, index) => ({
      id: `${listType}_${index}`,
      content,
      is_default: true,
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
  Object.entries(DEFAULT_ACTIVITY_LISTS).forEach(([listName, listData]) => {
    listTypes.push({
      type_group: 'activity',
      list_name: listName,
      display_name: listData.display_name,
      icon: listData.icon,
      description: `Items needed for ${listData.display_name.toLowerCase()}`,
      is_default: true,
      created_by_id: userId,
    });
  });
  
  // Add accommodation list types
  Object.entries(DEFAULT_ACCOMMODATION_LISTS).forEach(([listName, listData]) => {
    listTypes.push({
      type_group: 'accommodation',
      list_name: listName,
      display_name: listData.display_name,
      icon: listData.icon,
      description: `Items for staying at ${listData.display_name.toLowerCase()}`,
      is_default: true,
      created_by_id: userId,
    });
  });
  
  // Add companion list types
  Object.entries(DEFAULT_COMPANION_LISTS).forEach(([listName, listData]) => {
    listTypes.push({
      type_group: 'companion',
      list_name: listName,
      display_name: listData.display_name,
      icon: listData.icon,
      description: `Items for traveling ${listData.display_name.toLowerCase()}`,
      is_default: true,
      created_by_id: userId,
    });
  });
  
  return listTypes;
} 