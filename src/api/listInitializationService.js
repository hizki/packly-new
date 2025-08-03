import { TipList, User, List } from './entities';
import { createDefaultListsForUser, createDefaultTipListsForUser } from '../utils/defaultListData';
import { generateEmojisForItems } from '../utils/emojiGenerator';

/**
 * Service for initializing and managing user's default lists
 */
export class ListInitializationService {
  /**
   * Initialize all default lists for a new user
   */
  static async initializeUserLists(userId) {
    try {
      console.log('🚀 Initializing default lists for user:', userId);
      
      // Create default lists using the List service (custom lists table)
      const defaultBaseLists = createDefaultListsForUser(userId);
      for (const listData of defaultBaseLists) {
        // Convert to custom list format for the lists table
        const customListData = {
          list_type: listData.list_type,
          category: listData.category,
          name: `${listData.category.charAt(0).toUpperCase() + 
            listData.category.slice(1)} Essentials`,
          items: listData.items,
          owner_id: listData.owner_id,
          created_by_id: listData.created_by_id,
          created_by: listData.created_by,
          is_sample: listData.is_sample,
          is_default: true,
        };
        await List.create(customListData);
      }
      
      // Create default tip lists
      const defaultTipLists = createDefaultTipListsForUser(userId);
      for (const tipListData of defaultTipLists) {
        await TipList.create(tipListData);
      }
      
      // Mark user as initialized
      await User.updateMyUserData({ has_initialized_base_lists: true });
      
      console.log('✅ Successfully initialized default lists for user');
      return true;
    } catch (error) {
      console.error('❌ Error initializing user lists:', error);
      throw error;
    }
  }

  /**
   * Reset user's lists to default values
   */
  static async resetUserListsToDefaults(userId) {
    try {
      console.log('🚀 Resetting lists to defaults for user:', userId);
      
      // Get all existing lists for the user (both custom lists and tip lists)
      const existingCustomLists = await List.filter({ owner_id: userId });
      const existingTipLists = await TipList.filter({ owner_id: userId });
      
      // Delete existing lists
      for (const list of existingCustomLists) {
        await List.delete(list.id);
      }
      
      for (const list of existingTipLists) {
        await TipList.delete(list.id);
      }
      
      // Recreate default lists using the List service (custom lists table)
      const defaultBaseLists = createDefaultListsForUser(userId);
      for (const listData of defaultBaseLists) {
        // Convert to custom list format for the lists table
        const customListData = {
          list_type: listData.list_type,
          category: listData.category,
          name: `${listData.category.charAt(0).toUpperCase() + 
            listData.category.slice(1)} Essentials`,
          items: listData.items,
          owner_id: listData.owner_id,
          created_by_id: listData.created_by_id,
          created_by: listData.created_by,
          is_sample: listData.is_sample,
          is_default: true,
        };
        await List.create(customListData);
      }
      
      const defaultTipLists = createDefaultTipListsForUser(userId);
      for (const tipListData of defaultTipLists) {
        await TipList.create(tipListData);
      }
      
      console.log('✅ Successfully reset lists to defaults');
      return true;
    } catch (error) {
      console.error('❌ Error resetting user lists:', error);
      throw error;
    }
  }

  /**
   * Check if user has any custom modifications to their lists
   */
  static async hasCustomModifications(userId) {
    try {
      const customLists = await List.filter({ owner_id: userId });
      const tipLists = await TipList.filter({ owner_id: userId });
      
      // Check if any lists are not marked as samples (meaning they're custom)
      const hasCustomLists = customLists.some(list => !list.is_sample);
      const hasCustomTipLists = tipLists.some(list => !list.is_sample);
      
      return hasCustomLists || hasCustomTipLists;
    } catch (error) {
      console.error('Error checking for custom modifications:', error);
      return false;
    }
  }

  /**
   * Get statistics about user's lists
   */
  static async getUserListStats(userId) {
    try {
      const customLists = await List.filter({ owner_id: userId });
      const tipLists = await TipList.filter({ owner_id: userId });
      
      const activityLists = customLists.filter(list => list.list_type === 'activity');
      const accommodationLists = customLists.filter(list => list.list_type === 'accommodation');
      const companionLists = customLists.filter(list => list.list_type === 'companion');
      
      const totalItems = customLists.reduce((total, list) => {
        return total + (list.items ? list.items.length : 0);
      }, 0);
      
      const totalTips = tipLists.reduce((total, list) => {
        return total + (list.tips ? list.tips.length : 0);
      }, 0);
      
      return {
        totalBaseLists: customLists.length,
        activityLists: activityLists.length,
        accommodationLists: accommodationLists.length,
        companionLists: companionLists.length,
        tipLists: tipLists.length,
        totalItems,
        totalTips,
        hasCustomModifications: await this.hasCustomModifications(userId),
      };
    } catch (error) {
      console.error('Error getting user list stats:', error);
      return null;
    }
  }
} 
