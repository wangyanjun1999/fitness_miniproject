import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logApi } from '../lib/api/logs';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  initialize: async () => {
    if (get().initialized) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          if (profile) {
            set({ user, profile });
            await logApi.createLog(user.id, 'SESSION_RESTORED', {
              email: user.email
            });
          } else {
            console.warn('No profile found for user:', user.id);
            set({ user, profile: null });
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          set({ user, profile: null });
        }
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user ?? null;
        set({ user: currentUser });

        if (currentUser) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select()
              .eq('id', currentUser.id)
              .maybeSingle();
            
            if (error) throw error;
            if (profile) {
              set({ profile });
              await logApi.createLog(currentUser.id, 'AUTH_STATE_CHANGED', {
                event,
                email: currentUser.email
              });
            } else {
              console.warn('No profile found for user:', currentUser.id);
              set({ profile: null });
            }
          } catch (err) {
            console.error('Error loading profile on auth change:', err);
            set({ profile: null });
          }
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, profile: null });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      if (data.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (error) throw error;
          if (profile) {
            set({ user: data.user, profile });
            await logApi.createLog(data.user.id, 'SIGN_IN', {
              email: data.user.email
            });
          } else {
            console.warn('No profile found after sign in for user:', data.user.id);
            throw new Error('Profile not found');
          }
        } catch (err) {
          console.error('Error loading profile after sign in:', err);
          throw new Error('Failed to load profile');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, username) => {
    set({ loading: true });
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              username,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (error) throw error;
          if (profile) {
            set({ user: data.user, profile });
            await logApi.createLog(data.user.id, 'SIGN_UP', {
              email: data.user.email,
              username
            });
          } else {
            throw new Error('Failed to create profile');
          }
        } catch (err) {
          console.error('Error creating profile:', err);
          throw new Error('Failed to create profile');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    const { user } = get();
    set({ loading: true });
    try {
      if (user) {
        await logApi.createLog(user.id, 'SIGN_OUT', {
          email: user.email
        });
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (profile) {
        set({ profile });
        await logApi.createLog(user.id, 'PROFILE_LOADED', {
          email: user.email
        });
      } else {
        console.warn('No profile found during load for user:', user.id);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  },
}));