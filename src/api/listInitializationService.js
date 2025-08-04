import { TipList, User, List, ListType } from './entities';
import {
  createInitialListsForUser,
  createDefaultTipListsForUser,
  createDefaultListTypesForUser,
} from '../utils/defaultListData';

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
      
      // First, ensure default list types exist
      await this.ensureDefaultListTypes(userId);
      
      // Create initial lists for the user
      const initialLists = createInitialListsForUser(userId);
      for (const listData of initialLists) {
        // Create in the lists table
        const listToCreate = {
          list_type: listData.list_type,
          list_name: listData.list_name,
          name: listData.display_name,
          icon: listData.icon,
          items: listData.items,
          owner_id: listData.owner_id,
          created_by_id: listData.created_by_id,
          created_by: listData.created_by,
        };
        await List.create(listToCreate);
      }
      
      // Create default tip lists
      const defaultTipLists = createDefaultTipListsForUser(userId);
      for (const tipListData of defaultTipLists) {
        await TipList.create(tipListData);
      }
      
      // Mark user as initialized
      await User.updateMyUserData({ has_initialized_lists: true });
      
      console.log('✅ Successfully initialized default lists for user');
      return true;
    } catch (error) {
      console.error('❌ Error initializing user lists:', error);
      throw error;
    }
  }

  /**
   * Ensure default list types exist in the database
   */
  static async ensureDefaultListTypes(userId) {
    try {
      console.log('🔧 Ensuring default list types exist');
      
      const defaultListTypes = createDefaultListTypesForUser(userId);
      
      for (const listTypeData of defaultListTypes) {
        // Check if this list type already exists by display name
        const allTypesInGroup = await ListType.getByTypeGroup(listTypeData.type_group);
        const existing = allTypesInGroup.filter(
          item => item.display_name === listTypeData.display_name,
        );
        
        if (existing.length === 0) {
          console.log(
            `Creating default list type: ${listTypeData.type_group}/${listTypeData.list_name}`,
          );
          await ListType.create(listTypeData);
        }
      }
      
      console.log('✅ Default list types ensured');
    } catch (error) {
      console.error('❌ Error ensuring default list types:', error);
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
      
      // Ensure default list types exist
      await this.ensureDefaultListTypes(userId);
      
      // Recreate initial lists
      const initialLists = createInitialListsForUser(userId);
      for (const listData of initialLists) {
        // Create in the lists table
        const listToCreate = {
          list_type: listData.list_type,
          list_name: listData.list_name,
          name: listData.display_name,
          icon: listData.icon,
          items: listData.items,
          owner_id: listData.owner_id,
          created_by_id: listData.created_by_id,
          created_by: listData.created_by,
        };
        await List.create(listToCreate);
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
      
      // If user has any lists, they have custom modifications
      // (since we create initial lists on signup, any changes = modifications)
      const hasCustomLists = customLists.length > 0;
      const hasCustomTipLists = tipLists.length > 0;
      
      return hasCustomLists || hasCustomTipLists;
    } catch (error) {
      console.error('Error checking custom modifications:', error);
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
        totalLists: customLists.length,
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
