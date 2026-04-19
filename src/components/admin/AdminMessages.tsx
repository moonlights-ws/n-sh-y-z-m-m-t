'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Trash2, Check, Clock, User, Calendar, Shield, AlertCircle, ArrowLeft, Eye, EyeOff, RefreshCw, X, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Suggestion {
  id: number;
  content: string;
  created_at: string;
  user_id: string | null;
  is_read?: boolean;
}

// 本地存储的已读状态（用于兼容没有 is_read 字段的数据库）
const getLocalReadStatus = (id: number): boolean => {
  try {
    const stored = localStorage.getItem('readStatus');
    if (stored) {
      const status = JSON.parse(stored);
      return status[id] === true;
    }
  } catch {}
  return false;
};

const setLocalReadStatus = (id: number, isRead: boolean) => {
  try {
    const stored = localStorage.getItem('readStatus');
    const status = stored ? JSON.parse(stored) : {};
    status[id] = isRead;
    localStorage.setItem('readStatus', JSON.stringify(status));
  } catch {}
};

// 管理员邮箱列表
const ADMIN_EMAILS = ['3185529795@qq.com'];

export default function AdminMessagesPage() {
  const { user, isLoading: authLoading, isSupabaseConfigured } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // 检查是否是管理员
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  // 检查授权状态
  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) {
      return;
    }

    // 用户未登录
    if (!user) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    // 检查是否是管理员
    if (isAdmin) {
      setIsAuthorized(true);
      // 保存管理员邮箱到 localStorage
      localStorage.setItem('adminEmail', user.email!);
    } else {
      setIsAuthorized(false);
    }
  }, [user, authLoading, isAdmin]);

  // 加载留言数据
  const loadSuggestions = useCallback(async () => {
    if (!user?.email || !isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/suggestions', {
        headers: {
          'x-admin-email': user.email
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 合并本地存储的已读状态
        const dataWithReadStatus = result.data.map((s: Suggestion) => ({
          ...s,
          is_read: s.is_read ?? getLocalReadStatus(s.id)
        }));
        setSuggestions(dataWithReadStatus);
      } else {
        if (response.status === 403) {
          setIsAuthorized(false);
        } else {
          setError(result.error || '获取留言失败');
        }
      }
    } catch (err) {
      console.error('Load suggestions error:', err);
      setError('网络错误，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, [user?.email, isAdmin]);

  useEffect(() => {
    if (isAuthorized === true) {
      loadSuggestions();
    }
  }, [isAuthorized, loadSuggestions]);

  // 删除留言
  const handleDelete = async (id: number) => {
    if (!user?.email || !isAdmin) return;
    if (!confirm('确定删除这条留言吗？')) return;
    
    try {
      const response = await fetch(`/api/admin/suggestions?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': user.email
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
      } else {
        alert(result.error || '删除失败');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('删除失败，请重试');
    }
  };

  // 标记已读/未读（更新服务器，失败时使用本地存储）
  const toggleRead = async (id: number) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion || !user?.email || !isAdmin) return;
    
    const newStatus = !suggestion.is_read;
    
    // 先更新本地状态，提供即时反馈
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, is_read: newStatus } : s
    ));
    
    // 同时尝试更新服务器
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email
        },
        body: JSON.stringify({ id, is_read: newStatus })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 服务器更新成功，同时保存到本地存储
        setLocalReadStatus(id, newStatus);
      } else {
        // 服务器更新失败，但本地状态已更新，下次加载时会合并
        console.warn('Failed to update server, using local storage');
      }
    } catch (err) {
      console.error('Toggle read error:', err);
      // 网络错误时使用本地存储
      setLocalReadStatus(id, newStatus);
    }
  };

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 未读数量
  const unreadCount = suggestions.filter(s => !s.is_read).length;

  // 加载中（认证状态加载中）
  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-page)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[var(--theme-text-muted)]">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录或无权限页面
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-page)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-8 text-center">
          <div className="w-16 h-16 bg-[var(--lose)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[var(--lose)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--theme-text-primary)] mb-2">无权限访问</h1>
          <p className="text-[var(--theme-text-muted)] mb-6">
            {!user 
              ? '请先登录管理员账号后再访问此页面' 
              : '只有管理员才能访问此页面'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 管理员留言管理页面
  return (
    <div className="min-h-screen bg-[var(--theme-bg-page)]">
      {/* Header */}
      <header className="bg-[var(--theme-bg-card)] border-b border-[var(--theme-accent)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 hover:bg-[var(--theme-bg-page)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--theme-text-secondary)]" />
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[var(--theme-primary)]" />
                <h1 className="text-xl font-bold text-[var(--theme-text-primary)]">留言管理</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadSuggestions}
                className="p-2 hover:bg-[var(--theme-bg-page)] rounded-lg transition-colors"
                title="刷新"
              >
                <RefreshCw className={`w-5 h-5 text-[var(--theme-text-secondary)] ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[var(--win)] rounded-full"></div>
                <span className="text-[var(--theme-text-secondary)]">管理员</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--theme-primary)]">{suggestions.length}</p>
            <p className="text-sm text-[var(--theme-text-muted)]">总留言数</p>
          </div>
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--lose)]">{unreadCount}</p>
            <p className="text-sm text-[var(--theme-text-muted)]">未读</p>
          </div>
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--win)]">{suggestions.length - unreadCount}</p>
            <p className="text-sm text-[var(--theme-text-muted)]">已读</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--lose)]/10 border border-[var(--lose)]/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--lose)] flex-shrink-0" />
              <p className="text-[var(--lose)]">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-[var(--lose)]/20 rounded"
            >
              <X className="w-4 h-4 text-[var(--lose)]" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && suggestions.length === 0 && (
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-12 text-center">
            <div className="w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-[var(--theme-text-muted)]">加载留言中...</p>
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-12 text-center">
                <MessageSquare className="w-12 h-12 text-[var(--theme-accent)] mx-auto mb-3" />
                <p className="text-[var(--theme-text-muted)]">暂无留言</p>
              </div>
            ) : (
              suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`bg-[var(--theme-bg-card)] rounded-xl border p-4 transition-all ${
                    suggestion.is_read 
                      ? 'border-[var(--theme-accent)]/50' 
                      : 'border-[var(--theme-primary)]/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {/* User */}
                        <div className="flex items-center gap-1.5 text-sm text-[var(--theme-text-secondary)]">
                          {suggestion.user_id ? (
                            <>
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">{suggestion.user_id}</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
                              <span className="text-[var(--theme-text-muted)]">匿名用户</span>
                            </>
                          )}
                        </div>
                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-sm text-[var(--theme-text-muted)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(suggestion.created_at)}</span>
                        </div>
                        {/* Status */}
                        {suggestion.is_read ? (
                          <span className="px-2 py-0.5 bg-[var(--theme-accent)]/20 text-[var(--theme-text-muted)] text-xs rounded">
                            已读
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-xs rounded">
                            未读
                          </span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <p className="text-[var(--theme-text-primary)] whitespace-pre-wrap break-words">
                        {suggestion.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle Read */}
                      <button
                        onClick={() => toggleRead(suggestion.id)}
                        className="p-2 hover:bg-[var(--theme-bg-page)] rounded-lg transition-colors"
                        title={suggestion.is_read ? '标记未读' : '标记已读'}
                      >
                        {suggestion.is_read ? (
                          <EyeOff className="w-4 h-4 text-[var(--theme-text-muted)]" />
                        ) : (
                          <Eye className="w-4 h-4 text-[var(--theme-primary)]" />
                        )}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(suggestion.id)}
                        className="p-2 hover:bg-[var(--lose)]/10 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-[var(--theme-text-muted)] hover:text-[var(--lose)]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
