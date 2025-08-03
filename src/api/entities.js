import { supabase } from './supabaseClient';

// Development mode check
const isDev =
  import.meta.env.DEV &&
  (!import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key'));

// Mock data for development
const mockPackingLists = [
  {
    id: '1',
    name: 'Weekend Trip to Paris',
    owner_id: 'dev-user-123',
    trip_type: 'leisure',
    destination: 'Paris, France',
    start_date: '2024-02-15',
    end_date: '2024-02-17',
    is_favorite: true,
    created_date: '2024-01-15T10:00:00Z',
    updated_date: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Business Trip to Tokyo',
    owner_id: 'dev-user-123',
    trip_type: 'business',
    destination: 'Tokyo, Japan',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    is_favorite: false,
    created_date: '2024-01-10T09:00:00Z',
    updated_date: '2024-01-10T09:00:00Z',
  },
];

const mockBaseLists = [
  {
    id: '1',
    name: 'Beach Vacation',
    list_type: 'activity',
    category_id: 'beach',
    owner_id: 'dev-user-123',
    items: ['Sunscreen', 'Beach towel', 'Swimsuit', 'Sunglasses'],
  },
  {
    id: '2',
    name: 'Business Hotel',
    list_type: 'accommodation',
    category_id: 'hotel',
    owner_id: 'dev-user-123',
    items: ['Business attire', 'Laptop charger', 'Business cards', 'Iron'],
  },
];

const mockTipLists = [
  {
    id: '1',
    name: 'Travel Security Tips',
    owner_id: 'dev-user-123',
    tips: [
      { id: '1', text: 'Keep copies of important documents', completed: false },
      { id: '2', text: 'Use hotel safes for valuables', completed: true },
      { id: '3', text: 'Notify bank of travel plans', completed: false },
    ],
  },
];

const mockCustomLists = [
  {
    id: '1',
    name: 'Beach Essentials',
    list_type: 'activity',
    list_name: 'beach',
    icon: '🏖️',
    owner_id: 'dev-user-123',
    items: [
      {
        name: 'Sunscreen',
        category: 'essentials',
        quantity: 1,
        weather_dependent: false,
        weather_type: 'any',
      },
      {
        name: 'Beach towel',
        category: 'essentials',
        quantity: 1,
        weather_dependent: false,
        weather_type: 'any',
      },
    ],
    is_default: false,
  },
];

export class PackingListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock packing lists');
      return mockPackingLists.filter(list => {
        if (filters.id && list.id !== filters.id) return false;
        if (filters.owner_id && list.owner_id !== filters.owner_id) return false;
        return true;
      });
    }

    let query = supabase.from('packing_lists').select('*');

    if (filters.id) {
      query = query.eq('id', filters.id);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create packing list', data);
      const newList = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      mockPackingLists.push(newList);
      return newList;
    }

    const { data: result, error } = await supabase
      .from('packing_lists')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update packing list', id, data);
      const index = mockPackingLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockPackingLists[index] = {
          ...mockPackingLists[index],
          ...data,
          updated_date: new Date().toISOString(),
        };
        return mockPackingLists[index];
      }
      throw new Error('List not found');
    }

    const { data: result, error } = await supabase
      .from('packing_lists')
      .update({ ...data, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete packing list', id);
      const index = mockPackingLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockPackingLists.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase.from('packing_lists').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters);
  }
}

export class BaseListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock base lists');
      return mockBaseLists.filter(list => !filters.owner_id || list.owner_id === filters.owner_id);
    }

    let query = supabase.from('base_lists').select('*');

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create base list', data);
      const newList = {
        ...data,
        id: Date.now().toString(),
      };
      mockBaseLists.push(newList);
      return newList;
    }

    const { data: result, error } = await supabase
      .from('base_lists')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update base list', id, data);
      const index = mockBaseLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockBaseLists[index] = { ...mockBaseLists[index], ...data };
        return mockBaseLists[index];
      }
      throw new Error('Base list not found');
    }

    const { data: result, error } = await supabase
      .from('base_lists')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete base list', id);
      const index = mockBaseLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockBaseLists.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase.from('base_lists').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters);
  }
}

export class TipListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock tip lists');
      return mockTipLists.filter(list => !filters.owner_id || list.owner_id === filters.owner_id);
    }

    let query = supabase.from('tip_lists').select('*');

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create tip list', data);
      const newList = {
        ...data,
        id: Date.now().toString(),
      };
      mockTipLists.push(newList);
      return newList;
    }

    const { data: result, error } = await supabase
      .from('tip_lists')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update tip list', id, data);
      const index = mockTipLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockTipLists[index] = { ...mockTipLists[index], ...data };
        return mockTipLists[index];
      }
      throw new Error('Tip list not found');
    }

    const { data: result, error } = await supabase
      .from('tip_lists')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete tip list', id);
      const index = mockTipLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockTipLists.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase.from('tip_lists').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters);
  }
}

export class CustomListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock custom lists');
      return mockCustomLists.filter(list => {
        if (filters.owner_id && list.owner_id !== filters.owner_id) return false;
        if (filters.list_type && list.list_type !== filters.list_type) return false;

        return true;
      });
    }

    let query = supabase.from('lists').select('*');

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create custom list', data);
      const newList = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      mockCustomLists.push(newList);
      return newList;
    }

    const { data: result, error } = await supabase.from('lists').insert([data]).select().single();

    if (error) throw error;
    return result;
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update custom list', id, data);
      const index = mockCustomLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockCustomLists[index] = {
          ...mockCustomLists[index],
          ...data,
          updated_date: new Date().toISOString(),
        };
        return mockCustomLists[index];
      }
      throw new Error('Custom list not found');
    }

    const { data: result, error } = await supabase
      .from('lists')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete custom list', id);
      const index = mockCustomLists.findIndex(list => list.id === id);
      if (index !== -1) {
        mockCustomLists.splice(index, 1);
      }
      return true;
    }

    const { data, error } = await supabase.from('lists').delete().eq('id', id);

    if (error) throw error;
    return data;
  }

  static async filter(filters) {
    return this.findMany(filters);
  }
}

export class ListTypeService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚧 Dev mode: Using mock list types');
      // Return mock list types based on the actual structure
      return [
        { id: '1', name: 'Beach Trip', parent_type: 'activity', icon: '🏖️', display_name: 'Beach Trip' },
        { id: '2', name: 'Camping', parent_type: 'activity', icon: '🏕️', display_name: 'Camping' },
        { id: '3', name: 'Hotel', parent_type: 'accommodation', icon: '🏨', display_name: 'Hotel' },
        { id: '4', name: 'Solo Travel', parent_type: 'companion', icon: '🧍', display_name: 'Solo Travel' },
      ].filter(item => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      });
    }

    let query = supabase.from('list_categories').select(`
      id,
      name,
      icon,
      is_active,
      sort_order,
      list_types!inner(name)
    `);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'type_group') {
          // Filter by the parent list_type name
          query = query.eq('list_types.name', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    
    // Transform data to match expected format
    return (data || []).map(item => ({
      id: item.id,
      list_name: item.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: item.name,
      icon: item.icon,
      type_group: item.list_types.name,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));
  }

  static async findOne(id) {
    if (isDev) {
      console.log('🚧 Dev mode: Using mock list type');
      const mockTypes = await this.findMany();
      return mockTypes.find(item => item.id === id) || null;
    }

    const { data, error } = await supabase
      .from('list_categories')
      .select(`
        id,
        name,
        icon,
        is_active,
        sort_order,
        list_types!inner(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    // Transform data to match expected format
    return {
      id: data.id,
      list_name: data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: data.name,
      icon: data.icon,
      type_group: data.list_types.name,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
  }

  static async create(listTypeData) {
    if (isDev) {
      console.log('🚧 Dev mode: Mock creating list type:', listTypeData);
      return { ...listTypeData, id: `mock-${Date.now()}` };
    }

    // For creating new list types, we'd need to:
    // 1. Find the parent list_type by name
    // 2. Insert into list_categories with the parent ID
    const { data: parentType, error: parentError } = await supabase
      .from('list_types')
      .select('id')
      .eq('name', listTypeData.type_group)
      .single();

    if (parentError) throw parentError;

    const { data, error } = await supabase
      .from('list_categories')
      .insert([{
        name: listTypeData.display_name,
        icon: listTypeData.icon,
        list_type_id: parentType.id,
        is_active: true,
        sort_order: 999, // Add to end
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Transform response to match expected format
    return {
      id: data.id,
      list_name: data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_name: data.name,
      icon: data.icon,
      type_group: listTypeData.type_group,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
  }

  static async update(id, updates) {
    if (isDev) {
      console.log('🚧 Dev mode: Mock updating list type:', { id, updates });
      return { id, ...updates };
    }

    const { data, error } = await supabase
      .from('list_categories')
      .update({
        name: updates.display_name,
        icon: updates.icon,
        is_active: updates.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚧 Dev mode: Mock deleting list type:', id);
      return { id };
    }

    const { error } = await supabase
      .from('list_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { id };
  }

  static async filter(filters) {
    return this.findMany(filters);
  }

  static async getByTypeGroup(typeGroup) {
    return this.findMany({ type_group: typeGroup });
  }
}

// Export aliases for compatibility with existing code
export const PackingList = PackingListService;
export const BaseList = BaseListService;
export const TipList = TipListService;
export const CustomList = CustomListService;
export const List = CustomListService; // For custom lists (lists table)
export const ListType = ListTypeService; // For list types (list_categories table)

export { User } from './auth';
