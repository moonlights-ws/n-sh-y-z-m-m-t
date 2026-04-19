'use client';

import { getSupabaseClientAsync } from './supabase-client';

// 游客ID存储键名
const VISITOR_USER_ID_KEY = 'nishuihan_visitor_user_id';

// 获取游客ID（用于未登录状态）
export function getVisitorUserId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(VISITOR_USER_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(VISITOR_USER_ID_KEY, visitorId);
  }
  return visitorId;
}

// 保存数据到data表
export async function saveUserData(userId: string, type: string, payload: unknown): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const client = await getSupabaseClientAsync();
  if (!client) {
    return false;
  }

  try {
    const payloadStr = JSON.stringify(payload);
    
    // 先查询是否已存在
    const { data: existing } = await client
      .from('data')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();

    if (existing) {
      // 更新现有记录
      const { error } = await client
        .from('data')
        .update({ 
          payload: payloadStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (error) {
        console.warn(`更新 ${type} 失败:`, error.message);
        return false;
      }
    } else {
      // 插入新记录
      const { error } = await client
        .from('data')
        .insert({ 
          user_id: userId, 
          type, 
          payload: payloadStr 
        });
      
      if (error) {
        console.warn(`插入 ${type} 失败:`, error.message);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.warn(`保存 ${type} 异常:`, err);
    return false;
  }
}

// 从data表加载数据
export async function loadUserData<T>(userId: string, type: string): Promise<T | null> {
  if (!userId) {
    return null;
  }

  const client = await getSupabaseClientAsync();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('data')
      .select('payload')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    if (!data.payload) {
      return null;
    }

    try {
      return JSON.parse(data.payload) as T;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// 加载当前用户的所有数据
export async function loadAllUserData<T>(userId: string): Promise<Record<string, T | null>> {
  if (!userId) {
    return {};
  }

  const client = await getSupabaseClientAsync();
  if (!client) {
    return {};
  }

  try {
    const { data, error } = await client
      .from('data')
      .select('type, payload')
      .eq('user_id', userId);

    if (error) {
      return {};
    }

    const result: Record<string, T | null> = {};
    if (data && data.length > 0) {
      for (const item of data) {
        try {
          if (item.payload) {
            result[item.type] = JSON.parse(item.payload) as T;
          }
        } catch {
          result[item.type] = null;
        }
      }
    }
    
    return result;
  } catch {
    return {};
  }
}

// 删除用户数据
export async function deleteUserData(userId: string, type?: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const client = await getSupabaseClientAsync();
  if (!client) {
    return false;
  }

  try {
    let query = client.from('data').delete().eq('user_id', userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { error } = await query;
    
    if (error) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
