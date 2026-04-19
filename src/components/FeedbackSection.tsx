'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SubmitState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function FeedbackSection() {
  const { getCurrentUserId, user } = useAuth();
  const [content, setContent] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 获取当前用户ID
  useEffect(() => {
    const init = async () => {
      const uid = await getCurrentUserId();
      setCurrentUserId(uid);
    };
    init();
  }, [getCurrentUserId]);

  // 重置提交状态（4秒后自动清除）
  useEffect(() => {
    if (submitState.status === 'success' || submitState.status === 'error') {
      const timer = setTimeout(() => {
        setSubmitState({ status: 'idle', message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitState.status]);

  // 提交留言
  const handleSubmit = useCallback(async () => {
    // 防止重复提交
    if (isSubmitting) return;

    const trimmedContent = content.trim();

    // 前端验证 - 内容不能为空
    if (!trimmedContent) {
      setSubmitState({ status: 'error', message: '留言内容不能为空' });
      return;
    }

    // 前端验证 - 最少5字
    if (trimmedContent.length < 5) {
      setSubmitState({ status: 'error', message: '至少需要5个字符' });
      return;
    }

    // 前端验证 - 最多500字
    if (trimmedContent.length > 500) {
      setSubmitState({ status: 'error', message: '不能超过500字' });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: 'loading', message: '提交中...' });

    try {
      // 设置15秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedContent,
          userId: currentUserId  // 登录用户有值，游客为 null
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (result.success) {
        // 成功：显示"留言提交成功！"
        setSubmitState({ status: 'success', message: '留言提交成功！' });
        setContent('');  // 清空表单
      } else {
        // 失败：显示具体错误信息
        setSubmitState({ 
          status: 'error', 
          message: result.error || '提交失败，请稍后重试' 
        });
      }
    } catch (err: unknown) {
      console.error('Submit feedback error:', err);
      
      // 区分超时错误和网络错误
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setSubmitState({ status: 'error', message: '请求超时，请检查网络后重试' });
        } else {
          setSubmitState({ status: 'error', message: '网络错误，请重试' });
        }
      } else {
        setSubmitState({ status: 'error', message: '网络错误，请重试' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [content, isSubmitting, currentUserId]);

  // 快捷短语
  const quickPhrases = [
    '希望增加XX功能',
    '建议优化XX体验',
    '发现一个BUG',
    '其他建议'
  ];

  const handleQuickPhrase = (phrase: string) => {
    if (!isSubmitting) {
      const newContent = content.trim() 
        ? `${content.trim()}\n${phrase}：` 
        : `${phrase}：`;
      setContent(newContent);
    }
  };

  // 字数统计
  const charCount = content.length;
  const maxChars = 500;
  const isOverLimit = charCount > maxChars;
  const isNearLimit = charCount > maxChars * 0.8;

  // 是否可以提交
  const canSubmit = content.trim().length >= 5 && !isOverLimit && !isSubmitting;

  return (
    <section id="feedback" className="py-12 bg-[var(--theme-bg-page)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">
            给网站提个建议
          </h2>
          <p className="text-[var(--theme-text-muted)] text-sm">
            您的反馈是我们改进的动力
          </p>
        </div>

        {/* 留言卡片 */}
        <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-5">
          {/* 用户身份提示 */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--theme-primary)]" />
              {user ? (
                <span className="text-[var(--theme-text-secondary)]">
                  登录身份：{user.email || '已登录用户'}
                </span>
              ) : (
                <span className="text-[var(--theme-text-muted)]">
                  游客模式（提交后将匿名记录）
                </span>
              )}
            </div>
          </div>

          {/* 快捷短语 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={isSubmitting}
                className="px-3 py-1 text-xs bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-full text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* 文本输入框 */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的建议/反馈/BUG...（至少5个字）"
              rows={4}
              maxLength={maxChars + 50}
              className={`w-full px-4 py-3 bg-[var(--theme-bg-page)] border rounded-lg text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] resize-none focus:outline-none transition-colors ${
                isOverLimit
                  ? 'border-[var(--lose)] focus:border-[var(--lose)]'
                  : 'border-[var(--theme-accent)] focus:border-[var(--theme-primary)]'
              }`}
            />
            {/* 字数统计 */}
            <div className={`absolute bottom-2 right-3 text-xs ${
              isOverLimit
                ? 'text-[var(--lose)]'
                : isNearLimit
                  ? 'text-[var(--theme-primary)]'
                  : 'text-[var(--theme-text-muted)]'
            }`}>
              {charCount}/{maxChars}
            </div>
          </div>

          {/* 提交区域 */}
          <div className="flex items-center justify-between mt-4">
            {/* 状态提示 */}
            {submitState.status !== 'idle' && (
              <div className={`flex items-center gap-1.5 text-sm animate-in fade-in slide-in-from-left-2 ${
                submitState.status === 'success'
                  ? 'text-[var(--win)]'
                  : submitState.status === 'error'
                    ? 'text-[var(--lose)]'
                    : 'text-[var(--theme-text-secondary)]'
              }`}>
                {submitState.status === 'success' && <Check className="w-4 h-4" />}
                {submitState.status === 'error' && <AlertCircle className="w-4 h-4" />}
                {submitState.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitState.message}</span>
              </div>
            )}
            {submitState.status === 'idle' && (
              <span className="text-xs text-[var(--theme-text-muted)]">
                提交后可前往个人中心查看回复
              </span>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                canSubmit
                  ? 'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-dark)] active:scale-95'
                  : 'bg-[var(--theme-accent)]/50 text-[var(--theme-text-muted)] cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>提交留言</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
