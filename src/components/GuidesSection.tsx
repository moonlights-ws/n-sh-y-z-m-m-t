'use client';

import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Plus, X, Trash2, Edit2, Check, Link as LinkIcon } from 'lucide-react';
import { loadUserData, saveUserData } from '@/storage/database/cloud-storage';
import { useAuth } from '@/contexts/AuthContext';

const platforms = ['B站', '抖音', '小红书', '微博', '其他'];

interface Guide {
  id: string;
  title: string;
  url: string;
  platform: string;
}

export default function GuidesSection() {
  const { getCurrentUserId, user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isAddingGuide, setIsAddingGuide] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [newGuide, setNewGuide] = useState<Omit<Guide, 'id'>>({ title: '', url: '', platform: 'B站' });

  useEffect(() => {
    const loadDataFromCloud = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      // 先从localStorage读取
      const saved = localStorage.getItem('guides');
      if (saved) {
        setGuides(JSON.parse(saved));
      }
      // 再从云端同步（云端数据优先）
      const cloudData = await loadUserData<Guide[]>(userId, 'guides');
      if (cloudData && cloudData.length > 0) {
        setGuides(cloudData);
        localStorage.setItem('guides', JSON.stringify(cloudData));
      }
    };
    loadDataFromCloud();
  }, [getCurrentUserId, user]); // 添加 user 依赖，登录后重新加载

  const saveGuides = async (newGuides: Guide[]) => {
    const userId = await getCurrentUserId();
    setGuides(newGuides);
    localStorage.setItem('guides', JSON.stringify(newGuides));
    // 同时保存到云端
    if (userId) {
      await saveUserData(userId, 'guides', newGuides);
    }
  };

  const handleAddGuide = () => {
    if (!newGuide.title || !newGuide.url) {
      alert('请填写标题和链接');
      return;
    }
    const guide: Guide = {
      ...newGuide,
      id: Date.now().toString(),
    };
    saveGuides([...guides, guide]);
    setNewGuide({ title: '', url: '', platform: 'B站' });
    setIsAddingGuide(false);
  };

  const handleDeleteGuide = (id: string) => {
    if (confirm('确定删除这条攻略吗？')) {
      saveGuides(guides.filter(g => g.id !== id));
    }
  };

  const handleUpdateGuide = () => {
    if (!editingGuide) return;
    saveGuides(guides.map(g => g.id === editingGuide.id ? editingGuide : g));
    setEditingGuide(null);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'B站': return '📺';
      case '抖音': return '🎵';
      case '小红书': return '📕';
      case '微博': return '🌐';
      default: return '🔗';
    }
  };

  const openLink = (url: string) => {
    // 处理各种链接格式
    const trimmedUrl = url.trim();
    
    // 如果是完整URL，直接打开
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      window.open(trimmedUrl, '_blank');
      return;
    }
    
    // 如果是纯文本口令，尝试识别并转换
    // 小红书口令格式通常是 xhslink.com 或 直接文字
    if (trimmedUrl.includes('xhslink.com') || trimmedUrl.includes('xiaohongshu.com')) {
      window.open('https://' + trimmedUrl.replace(/^https?:\/\//, ''), '_blank');
      return;
    }
    
    // 如果是其他格式，尝试作为URL处理
    if (trimmedUrl.includes('.com') || trimmedUrl.includes('.cn') || trimmedUrl.includes('http')) {
      const fullUrl = trimmedUrl.startsWith('http') ? trimmedUrl : 'https://' + trimmedUrl;
      window.open(fullUrl, '_blank');
      return;
    }
    
    // 如果都匹配不上，提示用户
    alert('请输入有效的链接地址');
  };

  return (
    <section id="guides" className="py-12 bg-[var(--theme-bg-page)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">攻略合集</h2>
          <p className="text-[var(--theme-text-muted)] text-sm">分享你的约战心得</p>
        </div>

        {/* Add Guide Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsAddingGuide(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
          >
            <Plus className="w-5 h-5" />
            添加攻略链接
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAddingGuide || editingGuide) && (
          <div className="mb-6 bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-5">
            <h3 className="text-[var(--theme-text-primary)] font-bold mb-4">{isAddingGuide ? '添加新攻略' : '编辑攻略'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm mb-1 block">标题 *</label>
                <input
                  type="text"
                  placeholder="攻略标题，如：素问奶鸿帮战装备最新穿搭攻略"
                  value={isAddingGuide ? newGuide.title : editingGuide?.title || ''}
                  onChange={(e) => isAddingGuide
                    ? setNewGuide({ ...newGuide, title: e.target.value })
                    : setEditingGuide({ ...editingGuide!, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm mb-1 block">链接 *</label>
                <input
                  type="text"
                  placeholder="B站/抖音/小红书等链接，支持完整URL或平台链接"
                  value={isAddingGuide ? newGuide.url : editingGuide?.url || ''}
                  onChange={(e) => isAddingGuide
                    ? setNewGuide({ ...newGuide, url: e.target.value })
                    : setEditingGuide({ ...editingGuide!, url: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                />
                <p className="text-[var(--theme-text-muted)] text-xs mt-1">支持：B站视频链接、抖音链接、小红书链接或口令</p>
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm mb-1 block">平台</label>
                <select
                  value={isAddingGuide ? newGuide.platform : editingGuide?.platform || 'B站'}
                  onChange={(e) => isAddingGuide
                    ? setNewGuide({ ...newGuide, platform: e.target.value })
                    : setEditingGuide({ ...editingGuide!, platform: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  {platforms.map(p => (
                    <option key={p} value={p}>{getPlatformIcon(p)} {p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => { setIsAddingGuide(false); setEditingGuide(null); }}
                className="px-4 py-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
              >
                取消
              </button>
              <button
                onClick={isAddingGuide ? handleAddGuide : handleUpdateGuide}
                className="flex items-center gap-1 px-5 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
              >
                <Check className="w-4 h-4" />
                {isAddingGuide ? '添加' : '保存'}
              </button>
            </div>
          </div>
        )}

        {/* Guides List */}
        <div className="space-y-3">
          {guides.map(guide => (
            <div
              key={guide.id}
              className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-4 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{getPlatformIcon(guide.platform)}</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--theme-bg-page)] text-[var(--theme-text-secondary)] text-xs">
                      {guide.platform}
                    </span>
                  </div>
                  <h3 className="text-[var(--theme-text-primary)] font-medium mb-2">{guide.title}</h3>
                  <p className="text-[var(--theme-text-muted)] text-xs break-all">{guide.url}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openLink(guide.url)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">跳转</span>
                  </button>
                  <button
                    onClick={() => setEditingGuide(guide)}
                    className="p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGuide(guide.id)}
                    className="p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--lose)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {guides.length === 0 && !isAddingGuide && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[var(--theme-accent)] mx-auto mb-3" />
            <p className="text-[var(--theme-text-muted)] mb-2">暂无攻略链接</p>
            <p className="text-[var(--theme-text-muted)] text-sm">点击上方按钮添加你的攻略链接</p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)]">
          <h4 className="text-[var(--theme-text-secondary)] text-sm font-medium mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            如何添加链接？
          </h4>
          <ul className="text-[var(--theme-text-muted)] text-xs space-y-1">
            <li>• B站/抖音/小红书：直接粘贴视频或帖子的完整链接</li>
            <li>• 小红口令：如 xhslink.com/o/23r9q8ODWHG，直接粘贴即可</li>
            <li>• 点击「跳转」按钮即可在浏览器中打开链接</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
