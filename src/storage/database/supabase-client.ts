import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 运行时配置缓存
let runtimeConfig: { url: string; anonKey: string } | null = null;
let configChecked = false;

// 异步获取服务端配置
async function fetchRuntimeConfig(): Promise<{ url: string; anonKey: string } | null> {
  if (runtimeConfig) {
    return runtimeConfig;
  }
  
  try {
    const response = await fetch('/api/config/supabase');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    
    if (data.configured && data.url && data.anonKey) {
      runtimeConfig = {
        url: data.url,
        anonKey: data.anonKey,
      };
      return runtimeConfig;
    }
  } catch (err) {
    console.warn('Failed to fetch Supabase config:', err);
  }
  
  return null;
}

// 同步检查配置是否已缓存
function hasCachedConfig(): boolean {
  return runtimeConfig !== null;
}

// 获取缓存的配置
function getCachedConfig(): { url: string; anonKey: string } | null {
  return runtimeConfig;
}

// 浏览器端使用的客户端（单例）
let browserClient: SupabaseClient | null = null;

// 异步获取 Supabase 客户端（推荐）
export async function getSupabaseClientAsync(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (browserClient) {
    return browserClient;
  }
  
  // 先尝试从缓存获取
  let config = getCachedConfig();
  
  // 如果没有缓存，异步获取
  if (!config) {
    config = await fetchRuntimeConfig();
  }
  
  if (!config) {
    return null;
  }
  
  browserClient = createClient(config.url, config.anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  
  return browserClient;
}

// 同步获取客户端（仅在确认配置已加载后使用）
export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient should only be called on the browser');
  }
  
  if (!browserClient) {
    const config = getCachedConfig();
    if (!config) {
      throw new Error('Supabase not configured yet. Use getSupabaseClientAsync instead.');
    }
    
    browserClient = createClient(config.url, config.anonKey, {
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  
  return browserClient;
}

// 检查配置是否可用
export function isSupabaseConfigured(): boolean {
  return hasCachedConfig();
}

// 安全地获取客户端（返回 null 而不是抛出异常）
export function tryGetSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

// 检查是否为有效的 JWT anon key
export function isValidAnonKey(key: string): boolean {
  return key.startsWith('eyJ');
}
