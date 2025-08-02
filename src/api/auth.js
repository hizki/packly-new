import { supabase } from './supabaseClient';

// Development mode check
const isDev =
  import.meta.env.DEV &&
  (!import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key'));

// Mock user for development
const mockUser = {
  id: 'dev-user-123',
  email: 'dev@example.com',
  full_name: 'Developer User',
  has_initialized_base_lists: true,
  settings: {
    notifications: true,
    theme: 'light',
  },
};

export class AuthService {
  static async getCurrentUser() {
    if (isDev) {
      console.log('🚀 Running in development mode with mock user');
      return mockUser;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      // Handle specific "session missing" error - this is normal when not logged in
      if (error && error.name === 'AuthSessionMissingError') {
        console.log('No active session found - user not logged in');
        return null;
      }

      if (error) throw error;

      // If no user is authenticated, return null instead of throwing
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      // Get user profile data from the users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            has_initialized_base_lists: false,
            settings: {},
          })
          .select()
          .single();

        if (createError) throw createError;
        return { ...user, ...newProfile };
      }

      if (profileError) throw profileError;

      return { ...user, ...profile };
    } catch (error) {
      // Only log unexpected errors (not session missing)
      if (error.name !== 'AuthSessionMissingError') {
        console.error('Authentication error:', error);
      }
      return null; // Return null instead of throwing to handle gracefully
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    if (isDev) return true;

    const user = await this.getCurrentUser();
    return !!user;
  }

  // Alias for compatibility with existing code
  static async me() {
    const user = await this.getCurrentUser();
    if (!user && !isDev) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  static async signInWithGoogle() {
    if (isDev) {
      console.log('🚀 Development mode: Mock Google sign-in');
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Sign-in error:', error);
      return { data: null, error };
    }
  }

  // Sign in with email/password (for development/testing)
  static async signInWithEmail(email, password) {
    if (isDev) {
      console.log('🚀 Development mode: Mock email sign-in');
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // Sign up with email/password
  static async signUpWithEmail(email, password, userData = {}) {
    if (isDev) {
      console.log('🚀 Development mode: Mock email sign-up');
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  }

  static async signOut() {
    if (isDev) {
      console.log('🚀 Development mode: Mock sign-out');
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static onAuthStateChange(callback) {
    if (isDev) {
      // Mock auth state change for development
      setTimeout(() => callback('SIGNED_IN', mockUser), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  }

  // Additional methods for compatibility
  static async updateMyUserData(updates) {
    if (isDev) {
      console.log('🚀 Development mode: Mock user data update', updates);
      Object.assign(mockUser, updates);
      return mockUser;
    }

    // In production, this would update the user profile in Supabase
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        updated_date: new Date().toISOString(),
        ...updates,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async logout() {
    return this.signOut();
  }
}

export const User = AuthService; // Maintain same export name for compatibility
