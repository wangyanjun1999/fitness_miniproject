import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AuthState, Profile } from '../types/database';
import { logger } from '../utils/logger';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initializeAuth: async () => {
    try {
      logger.info('auth', '初始化认证状态');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('auth', '获取会话状态失败', error);
        throw error;
      }

      if (session) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          logger.error('auth', '获取用户资料失败', profileError);
          throw profileError;
        }

        logger.info('auth', '恢复用户会话成功', { userId: profileData.id });
        set({ user: profileData });
      }

      set({ isLoading: false });
    } catch (error) {
      logger.error('auth', '初始化认证状态失败', error);
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      logger.info('auth', '用户开始登录', { email });
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          expiresIn: 3600 // 1小时过期
        }
      });
      if (signInError) {
        logger.error('auth', '用户登录失败', signInError);
        throw signInError;
      }

      // Fetch user profile after successful sign in
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        logger.error('auth', '获取用户资料失败', profileError);
        throw profileError;
      }

      logger.info('auth', '用户登录成功', { userId: profileData.id });
      set({ user: profileData });
    } catch (error) {
      logger.error('auth', '登录过程发生错误', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      logger.info('auth', '用户开始注册', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          expiresIn: 3600 // 1小时过期
        }
      });
      if (error) {
        logger.error('auth', '用户注册失败', error);
        throw error;
      }
      if (data.user) {
        const profile = { 
          id: data.user.id, 
          email, 
          created_at: new Date().toISOString() 
        } as Profile;
        
        logger.info('auth', '用户注册成功', { userId: profile.id });
        set({ user: profile });
      }
    } catch (error) {
      logger.error('auth', '注册过程发生错误', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      logger.info('auth', '用户开始登出');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('auth', '用户登出失败', error);
        throw error;
      }

      logger.info('auth', '用户登出成功');
      set({ user: null });
    } catch (error) {
      logger.error('auth', '登出过程发生错误', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    try {
      logger.info('user', '开始更新用户资料', { 
        updates: Object.keys(data)
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        logger.error('auth', '未找到认证用户');
        throw new Error('No authenticated user');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('user', '更新用户资料失败', error);
        throw error;
      }

      logger.info('user', '用户资料更新成功', { 
        userId: profile.id,
        updatedFields: Object.keys(data)
      });
      
      set({ user: profile });
    } catch (error) {
      logger.error('user', '更新用户资料过程发生错误', error);
      throw error;
    }
  },
}));