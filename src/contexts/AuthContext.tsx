'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { getSupabaseClientAsync, isSupabaseConfigured } from '@/storage/database/supabase-client';
import { User, Session } from '@supabase/supabase-js';

// 游客数据键名
const VISITOR_USER_ID_KEY = 'nishuihan_visitor_user_id';

// Auth Context 类型
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  isAuthModalOpen: boolean;
  isMergeModalOpen: boolean;
  pendingMergeData: {
    matchStats: unknown;
    matchRecords: unknown[];
    guides: unknown[];
    profile: unknown;
  } | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openMergeModal: (data: {
    matchStats: unknown;
    matchRecords: unknown[];
    guides: unknown[];
    profile: unknown;
  }) => void;
  closeMergeModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  getCurrentUserId: () => string;
  isVisitorMode: () => boolean;
  getVisitorUserId: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 生成游客ID
function generateVisitorId(): string {
  const id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  return id;
}

// 获取或创建游客ID
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_USER_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_USER_ID_KEY, visitorId);
  }
  return visitorId;
}

// 默认的 Auth Context 值
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isSupabaseConfigured: false,
  isAuthModalOpen: false,
  isMergeModalOpen: false,
  pendingMergeData: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  openMergeModal: () => {},
  closeMergeModal: () => {},
  signIn: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  signOut: async () => {},
  getCurrentUserId: () => '',
  isVisitorMode: () => true,
  getVisitorUserId: () => '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [pendingMergeData, setPendingMergeData] = useState<{
    matchStats: unknown;
    matchRecords: unknown[];
    guides: unknown[];
    profile: unknown;
  } | null>(null);
  const [visitorUserId, setVisitorUserId] = useState<string>('');
  const initRef = useRef(false);

  // 初始化（仅在客户端执行一次）
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      // 初始化游客ID（服务端渲染时不执行）
      if (typeof window !== 'undefined') {
        const id = getOrCreateVisitorId();
        setVisitorUserId(id);
      }
      
      // 异步获取 Supabase 客户端
      const client = await getSupabaseClientAsync();
      
      if (!client) {
        // Supabase 未配置，降级为游客模式
        setIsLoading(false);
        return;
      }
      
      setIsSupabaseReady(true);
      
      try {
        // 获取初始 session
        const { data: { session: initialSession } } = await client.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        
        // 设置 auth 状态监听
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        });

        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('Auth init error:', err);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 检查游客数据并提示合并
  const checkVisitorDataAndPromptMerge = useCallback(async (userId: string) => {
    if (!visitorUserId || !isSupabaseReady) return;
    
    const client = await getSupabaseClientAsync();
    if (!client) return;
    
    try {
      // 检查游客是否有数据
      const { data: visitorData } = await client
        .from('data')
        .select('type, payload')
        .eq('user_id', visitorUserId);

      if (!visitorData || visitorData.length === 0) {
        return;
      }

      // 检查账号是否已有数据
      const { data: userData } = await client
        .from('data')
        .select('type')
        .eq('user_id', userId);

      // 如果账号没有数据，或者游客有战绩/攻略数据
      const hasVisitorData = visitorData.some(d => {
        try {
          const payload = JSON.parse(d.payload || '{}');
          if (Array.isArray(payload) && payload.length > 0) return true;
          if (!Array.isArray(payload) && Object.keys(payload).length > 0) return true;
          return false;
        } catch {
          return false;
        }
      });

      if (hasVisitorData && (!userData || userData.length === 0)) {
        // 提取需要合并的数据
        const matchStats = visitorData.find(d => d.type === 'matchStats');
        const matchRecords = visitorData.find(d => d.type === 'matchRecords');
        const guides = visitorData.find(d => d.type === 'guides');
        const profile = visitorData.find(d => d.type === 'profile');

        setPendingMergeData({
          matchStats: matchStats ? JSON.parse(matchStats.payload) : null,
          matchRecords: matchRecords ? JSON.parse(matchRecords.payload) : [],
          guides: guides ? JSON.parse(guides.payload) : [],
          profile: profile ? JSON.parse(profile.payload) : null,
        });
        setIsMergeModalOpen(true);
      }
    } catch (err) {
      console.warn('Check visitor data error:', err);
    }
  }, [visitorUserId, isSupabaseReady]);

  // 监听用户变化，当登录时检查是否需要合并数据
  useEffect(() => {
    if (user && visitorUserId) {
      checkVisitorDataAndPromptMerge(user.id);
    }
  }, [user, visitorUserId, checkVisitorDataAndPromptMerge]);
  
  // 获取当前用户ID（账号优先，游客兜底）
  const getCurrentUserId = useCallback((): string => {
    return user?.id || visitorUserId;
  }, [user, visitorUserId]);

  // 判断是否游客模式
  const isVisitorMode = useCallback((): boolean => {
    return !user;
  }, [user]);

  // 获取游客ID
  const getVisitorUserId = useCallback((): string => {
    return visitorUserId;
  }, [visitorUserId]);

  // 登录 - 通过 API 路由
  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseReady) {
      return { success: false, error: '云端服务未就绪，请刷新页面后重试' };
    }
    
    try {
      // 添加请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '登录失败，请稍后重试' };
      }
      
      // 登录成功后更新 context 中的用户状态
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
      }
      
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      // 区分超时错误和其他错误
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, error: '请求超时，请检查网络后重试' };
      }
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }, [isSupabaseReady]);

  // 注册 - 通过 API 路由
  const signUp = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseReady) {
      return { success: false, error: '云端服务未就绪，请刷新页面后重试' };
    }
    
    try {
      // 添加请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '注册失败，请稍后重试' };
      }
      
      // 注册成功后自动登录
      const loginController = new AbortController();
      const loginTimeoutId = setTimeout(() => loginController.abort(), 15000);
      
      const loginResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: loginController.signal,
      });
      
      clearTimeout(loginTimeoutId);
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.user) {
        setUser(loginData.user);
        setSession(loginData.session);
      } else {
        // 注册成功但登录失败，返回成功但提示用户稍后登录
        console.warn('Auto login after signup failed:', loginData);
      }
      
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, error: '请求超时，请检查网络后重试' };
      }
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }, [isSupabaseReady]);

  // 退出登录
  const signOut = useCallback(async (): Promise<void> => {
    // 即使 Supabase 未准备好，也清理本地状态
    try {
      if (isSupabaseReady) {
        const client = await getSupabaseClientAsync();
        if (client) {
          await client.auth.signOut();
        }
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      // 无论成功与否，都清理本地状态
      setUser(null);
      setSession(null);
    }
  }, [isSupabaseReady]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openMergeModal = useCallback((data: {
    matchStats: unknown;
    matchRecords: unknown[];
    guides: unknown[];
    profile: unknown;
  }) => {
    setPendingMergeData(data);
    setIsMergeModalOpen(true);
  }, []);
  const closeMergeModal = useCallback(() => {
    setIsMergeModalOpen(false);
    setPendingMergeData(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isSupabaseConfigured: isSupabaseReady,
        isAuthModalOpen,
        isMergeModalOpen,
        pendingMergeData,
        openAuthModal,
        closeAuthModal,
        openMergeModal,
        closeMergeModal,
        signIn,
        signUp,
        signOut,
        getCurrentUserId,
        isVisitorMode,
        getVisitorUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
}
