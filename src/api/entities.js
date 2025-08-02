import { supabase } from './supabaseClient'

// Development mode check
const isDev = import.meta.env.DEV && (
  !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')
)

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
    updated_date: '2024-01-20T15:30:00Z'
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
    updated_date: '2024-01-10T09:00:00Z'
  }
]

const mockBaseLists = [
  {
    id: '1',
    name: 'Beach Vacation',
    list_type: 'activity',
    category_id: 'beach',
    owner_id: 'dev-user-123',
    items: ['Sunscreen', 'Beach towel', 'Swimsuit', 'Sunglasses']
  },
  {
    id: '2',
    name: 'Business Hotel',
    list_type: 'accommodation',
    category_id: 'hotel',
    owner_id: 'dev-user-123',
    items: ['Business attire', 'Laptop charger', 'Business cards', 'Iron']
  }
]

const mockTipLists = [
  {
    id: '1',
    name: 'Travel Security Tips',
    owner_id: 'dev-user-123',
    tips: [
      { id: '1', text: 'Keep copies of important documents', completed: false },
      { id: '2', text: 'Use hotel safes for valuables', completed: true },
      { id: '3', text: 'Notify bank of travel plans', completed: false }
    ]
  }
]

const mockCustomLists = [
  {
    id: '1',
    name: 'Beach Essentials',
    list_type: 'activity',
    category: 'beach',
    icon: '🏖️',
    owner_id: 'dev-user-123',
    items: [
      { name: 'Sunscreen', category: 'essentials', quantity: 1, weather_dependent: false, weather_type: 'any' },
      { name: 'Beach towel', category: 'essentials', quantity: 1, weather_dependent: false, weather_type: 'any' }
    ],
    is_default: false
  }
]

export class PackingListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock packing lists')
      return mockPackingLists.filter(list => {
        if (filters.id && list.id !== filters.id) return false
        if (filters.owner_id && list.owner_id !== filters.owner_id) return false
        return true
      })
    }

    let query = supabase.from('packing_lists').select('*')
    
    if (filters.id) {
      query = query.eq('id', filters.id)
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create packing list', data)
      const newList = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      }
      mockPackingLists.push(newList)
      return newList
    }

    const { data: result, error } = await supabase
      .from('packing_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update packing list', id, data)
      const index = mockPackingLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockPackingLists[index] = { 
          ...mockPackingLists[index], 
          ...data, 
          updated_date: new Date().toISOString() 
        }
        return mockPackingLists[index]
      }
      throw new Error('List not found')
    }

    const { data: result, error } = await supabase
      .from('packing_lists')
      .update({ ...data, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete packing list', id)
      const index = mockPackingLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockPackingLists.splice(index, 1)
      }
      return true
    }

    const { error } = await supabase
      .from('packing_lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters)
  }
}

export class BaseListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock base lists')
      return mockBaseLists.filter(list => 
        !filters.owner_id || list.owner_id === filters.owner_id
      )
    }

    let query = supabase.from('base_lists').select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create base list', data)
      const newList = {
        ...data,
        id: Date.now().toString()
      }
      mockBaseLists.push(newList)
      return newList
    }

    const { data: result, error } = await supabase
      .from('base_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update base list', id, data)
      const index = mockBaseLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockBaseLists[index] = { ...mockBaseLists[index], ...data }
        return mockBaseLists[index]
      }
      throw new Error('Base list not found')
    }

    const { data: result, error } = await supabase
      .from('base_lists')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete base list', id)
      const index = mockBaseLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockBaseLists.splice(index, 1)
      }
      return true
    }

    const { error } = await supabase
      .from('base_lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters)
  }
}

export class TipListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock tip lists')
      return mockTipLists.filter(list => 
        !filters.owner_id || list.owner_id === filters.owner_id
      )
    }

    let query = supabase.from('tip_lists').select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create tip list', data)
      const newList = {
        ...data,
        id: Date.now().toString()
      }
      mockTipLists.push(newList)
      return newList
    }

    const { data: result, error } = await supabase
      .from('tip_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update tip list', id, data)
      const index = mockTipLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockTipLists[index] = { ...mockTipLists[index], ...data }
        return mockTipLists[index]
      }
      throw new Error('Tip list not found')
    }

    const { data: result, error } = await supabase
      .from('tip_lists')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete tip list', id)
      const index = mockTipLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockTipLists.splice(index, 1)
      }
      return true
    }

    const { error } = await supabase
      .from('tip_lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // Compatibility aliases
  static async filter(filters) {
    return this.findMany(filters)
  }
}

export class CustomListService {
  static async findMany(filters = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock custom lists')
      return mockCustomLists.filter(list => {
        if (filters.owner_id && list.owner_id !== filters.owner_id) return false
        if (filters.list_type && list.list_type !== filters.list_type) return false
        if (filters.category && list.category !== filters.category) return false
        return true
      })
    }

    let query = supabase.from('lists').select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock create custom list', data)
      const newList = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      }
      mockCustomLists.push(newList)
      return newList
    }

    const { data: result, error } = await supabase
      .from('lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    if (isDev) {
      console.log('🚀 Development mode: Mock update custom list', id, data)
      const index = mockCustomLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockCustomLists[index] = { 
          ...mockCustomLists[index], 
          ...data, 
          updated_date: new Date().toISOString() 
        }
        return mockCustomLists[index]
      }
      throw new Error('Custom list not found')
    }

    const { data: result, error } = await supabase
      .from('lists')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    if (isDev) {
      console.log('🚀 Development mode: Mock delete custom list', id)
      const index = mockCustomLists.findIndex(list => list.id === id)
      if (index !== -1) {
        mockCustomLists.splice(index, 1)
      }
      return true
    }

    const { data, error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return data
  }

  static async filter(filters) {
    return this.findMany(filters)
  }
}

// Export aliases for compatibility with existing code
export const PackingList = PackingListService
export const BaseList = BaseListService  
export const TipList = TipListService
export const CustomList = CustomListService
export const List = CustomListService // For custom lists (lists table)

export { User } from './auth'