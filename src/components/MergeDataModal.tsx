'use client';

import { useState } from 'react';
import { X, Upload, FileText, Users, BookOpen, User, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export default function MergeDataModal() {
  const { isMergeModalOpen, closeMergeModal, pendingMergeData, user, getVisitorUserId } = useAuth();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<'success' | 'skipped' | null>(null);

  if (!isMergeModalOpen || !pendingMergeData || !user) return null;

  const hasMatchRecords = Array.isArray(pendingMergeData.matchRecords) && pendingMergeData.matchRecords.length > 0;
  const hasGuides = Array.isArray(pendingMergeData.guides) && pendingMergeData.guides.length > 0;
  const hasMatchStats = pendingMergeData.matchStats !== null && pendingMergeData.matchStats !== undefined && Object.keys(pendingMergeData.matchStats as object).length > 0;
  const hasProfile = pendingMergeData.profile !== null && pendingMergeData.profile !== undefined && Object.keys(pendingMergeData.profile as object).length > 0;

  const totalItems = 
    (hasMatchRecords ? 1 : 0) + 
    (hasGuides ? 1 : 0) + 
    (hasMatchStats ? 1 : 0) + 
    (hasProfile ? 1 : 0);

  const handleMerge = async () => {
    setIsMerging(true);
    
    try {
      const client = getSupabaseClient();
      const visitorId = getVisitorUserId();
      const userId = user.id;

      // 保存每个类型的数据
      if (hasMatchRecords) {
        await client.from('data').upsert({
          user_id: userId,
          type: 'matchRecords',
          payload: JSON.stringify(pendingMergeData.matchRecords),
        }, {
          onConflict: 'user_id,type',
        });
      }

      if (hasGuides) {
        await client.from('data').upsert({
          user_id: userId,
          type: 'guides',
          payload: JSON.stringify(pendingMergeData.guides),
        }, {
          onConflict: 'user_id,type',
        });
      }

      if (hasMatchStats) {
        await client.from('data').upsert({
          user_id: userId,
          type: 'matchStats',
          payload: JSON.stringify(pendingMergeData.matchStats),
        }, {
          onConflict: 'user_id,type',
        });
      }

      if (hasProfile) {
        await client.from('data').upsert({
          user_id: userId,
          type: 'profile',
          payload: JSON.stringify(pendingMergeData.profile),
        }, {
          onConflict: 'user_id,type',
        });
      }

      // 删除游客数据
      await client.from('data').delete().eq('user_id', visitorId);

      // 清除本地游客ID
      localStorage.removeItem('nishuihan_visitor_user_id');

      setMergeResult('success');
      
      // 2秒后关闭
      setTimeout(() => {
        closeMergeModal();
        setMergeResult(null);
        // 刷新页面以加载新数据
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('合并数据失败:', err);
      setIsMerging(false);
    }
  };

  const handleSkip = () => {
    setMergeResult('skipped');
    closeMergeModal();
    setMergeResult(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e5e5e5]">
          <button
            onClick={closeMergeModal}
            className="absolute top-4 right-4 p-2 rounded-full text-[#999999] hover:text-[#666666] hover:bg-[#f5f5f5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#fff8e6] rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--theme-primary)]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">
              发现本地数据
            </h2>
            <p className="text-[#999999] text-sm mt-1">
              是否将游客数据迁移到当前账号？
            </p>
          </div>
        </div>

        {/* Content */}
        {mergeResult === 'success' ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium text-[#1a1a1a]">数据迁移成功</p>
            <p className="text-sm text-[#999999] mt-1">页面即将刷新...</p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-3">
              <p className="text-sm text-[#666666] mb-4">
                检测到您有 <span className="font-medium text-[var(--theme-primary)]">{totalItems}</span> 类本地数据：
              </p>

              {hasMatchStats && (
                <div className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                  <FileText className="w-5 h-5 text-[var(--theme-primary)]" />
                  <span className="text-sm text-[#1a1a1a]">战绩统计</span>
                </div>
              )}

              {hasMatchRecords && (
                <div className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                  <Users className="w-5 h-5 text-[var(--theme-primary)]" />
                  <span className="text-sm text-[#1a1a1a]">
                    战绩记录（{(pendingMergeData.matchRecords as unknown[]).length} 条）
                  </span>
                </div>
              )}

              {hasGuides && (
                <div className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                  <BookOpen className="w-5 h-5 text-[var(--theme-primary)]" />
                  <span className="text-sm text-[#1a1a1a]">
                    攻略合集（{(pendingMergeData.guides as unknown[]).length} 个）
                  </span>
                </div>
              )}

              {hasProfile && (
                <div className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                  <User className="w-5 h-5 text-[var(--theme-primary)]" />
                  <span className="text-sm text-[#1a1a1a]">个人信息</span>
                </div>
              )}

              <div className="mt-4 p-3 bg-[#fff8e6] rounded-lg text-sm text-[#666666]">
                <p>迁移后：</p>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>所有数据将保存到当前账号</li>
                  <li>换设备登录后可查看</li>
                  <li>本地游客数据将被清除</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleSkip}
                disabled={isMerging}
                className="flex-1 py-2.5 border border-[#e5e5e5] text-[#666666] font-medium rounded-lg hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
              >
                跳过
              </button>
              <button
                onClick={handleMerge}
                disabled={isMerging}
                className="flex-1 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>迁移中...</span>
                  </>
                ) : (
                  <span>确认迁移</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
