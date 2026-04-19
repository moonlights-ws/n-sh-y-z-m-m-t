'use client';

import { useState, useEffect } from 'react';
import { Calendar, Trophy, ChevronDown, ChevronUp, Plus, Trash2, Edit2, Target, Heart, Shield, Zap, Star, Swords, RotateCcw, Search, X } from 'lucide-react';
import { loadUserData, saveUserData } from '@/storage/database/cloud-storage';
import { useAuth } from '@/contexts/AuthContext';

// 格式化万单位数值（保留1-2位小数）
function formatWanValue(value: string): string {
  if (!value) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (num >= 10000) {
    const wan = num / 10000;
    // 保留1-2位小数，去掉尾部的0
    return wan.toFixed(2).replace(/\.?0+$/, '') + '万';
  }
  return value;
}

// 判断是否为万单位字段
const wanFields = ['humanDamage', 'towerDamage', 'removeArmor', 'heal', 'damage'];

// 职业核心字段对照
const classCoreStats: Record<string, string[]> = {
  '碎梦': ['击败/清泉', '重伤'],
  '龙吟': ['塔伤', '重伤'],
  '神相': ['击败/清泉', '重伤', '人伤'],
  '玄机': ['击败/清泉', '重伤', '人伤'],
  '潮光': ['击败/清泉', '塔伤', '重伤'],
  '沧澜': ['塔伤', '重伤'],
  '九灵': ['击败/清泉', '重伤', '人伤', '焚骨'],
  '素问': ['治疗', '承伤', '复活/清泉', '重伤'],
  '铁衣': ['承伤', '重伤'],
  '血河': ['击败/清泉', '重伤', '人伤'],
  '鸿音': ['击败/清泉', '重伤', '人伤', '塔伤', '卸甲', '治疗', '承伤', '复活/清泉', '重伤'],
};

// 职业配置（使用图标图片）
const classes = [
  { name: '碎梦', icon: '/class-suimeng.png' },
  { name: '龙吟', icon: '/class-longyin.png' },
  { name: '神相', icon: '/class-shenxiang.png' },
  { name: '玄机', icon: '/class-xuanji.png' },
  { name: '潮光', icon: '/class-chaoguang.png' },
  { name: '沧澜', icon: '/class-qian.png' },
  { name: '九灵', icon: '/class-jiuling.png' },
  { name: '素问', icon: '/class-suwun.png' },
  { name: '铁衣', icon: '/class-tieyi.png' },
  { name: '血河', icon: '/class-xuehe.png' },
  { name: '鸿音', icon: '/class-jiyi.png' },
];

interface MatchRecord {
  id: string;
  date: string;
  mode: string;
  result: string;
  myClass: string;
  myGuild: string;
  opponentGuild: string;
  strength: string;
  // 我的数据
  defeat: string;      // 击败/清泉
  humanDamage: string; // 人伤
  towerDamage: string; // 塔伤
  removeArmor: string; // 卸甲
  heal: string;        // 治疗
  damage: string;       // 承伤
  resurrect: string;   // 复活/清泉
  burnBone: string;    // 焚骨
  death: string;       // 重伤
  // 其他
  replayUrl: string;
  review: string;
}

const defaultRecord: Omit<MatchRecord, 'id'> = {
  date: '',
  mode: '帮会联赛',
  result: '胜利',
  myClass: '龙吟',
  myGuild: '',
  opponentGuild: '',
  strength: '',
  defeat: '',
  humanDamage: '',
  towerDamage: '',
  removeArmor: '',
  heal: '',
  damage: '',
  resurrect: '',
  burnBone: '',
  death: '',
  replayUrl: '',
  review: '',
};

const allStats = [
  { key: 'defeat', label: '击败/清泉', icon: Target },
  { key: 'death', label: '重伤', icon: Shield },
  { key: 'humanDamage', label: '人伤', icon: Zap },
  { key: 'towerDamage', label: '塔伤', icon: Shield },
  { key: 'removeArmor', label: '卸甲', icon: Star },
  { key: 'heal', label: '治疗', icon: Heart },
  { key: 'damage', label: '承伤', icon: Shield },
  { key: 'resurrect', label: '复活/清泉', icon: Star },
  { key: 'burnBone', label: '焚骨', icon: Zap },
];

export default function MatchHistory() {
  const { getCurrentUserId, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRecord | null>(null);
  const [newMatch, setNewMatch] = useState<Omit<MatchRecord, 'id'>>(defaultRecord);

  useEffect(() => {
    const loadDataFromCloud = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      // 直接从云端拉取最新数据，不使用本地缓存
      const cloudData = await loadUserData<MatchRecord[]>(userId, 'match_records');
      if (cloudData && cloudData.length > 0) {
        setMatches(cloudData);
        localStorage.setItem('matchRecords', JSON.stringify(cloudData));
      } else {
        // 云端没有数据时，从本地存储读取
        const saved = localStorage.getItem('matchRecords');
        if (saved) {
          setMatches(JSON.parse(saved));
        }
      }
    };
    loadDataFromCloud();
  }, [getCurrentUserId, user]); // 添加 user 依赖，登录后重新加载

  const saveMatches = async (newMatches: MatchRecord[]) => {
    const userId = await getCurrentUserId();
    setMatches(newMatches);
    localStorage.setItem('matchRecords', JSON.stringify(newMatches));
    // 通知其他组件数据已更新
    window.dispatchEvent(new Event('matchRecordsUpdated'));
    // 同时保存到云端
    if (userId) {
      await saveUserData(userId, 'match_records', newMatches);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (!searchQuery.trim()) return true;
    
    // 将搜索词分割成多个关键词，支持多条件搜索
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    
    // 每个关键词都必须匹配上（AND 逻辑）
    return keywords.every(keyword => {
      // 1. 检查是否匹配帮会名称（我方或对方）
      const myGuildMatch = match.myGuild?.toLowerCase().includes(keyword);
      const opponentMatch = match.opponentGuild?.toLowerCase().includes(keyword);
      if (myGuildMatch || opponentMatch) return true;
      
      // 2. 检查是否匹配结果
      const resultKeyword = keyword === '胜' || keyword === '胜利' || keyword === '赢'
        ? '胜利'
        : (keyword === '败' || keyword === '失败' || keyword === '输')
          ? '失败'
          : null;
      if (resultKeyword && match.result === resultKeyword) return true;
      
      // 3. 检查是否匹配日期（支持多种格式）
      if (match.date) {
        const dateStr = match.date;
        const dateStrLower = dateStr.toLowerCase();
        
        // 直接包含关键词
        if (dateStrLower.includes(keyword)) return true;
        
        // 提取日期部分进行匹配
        const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          // 年份匹配
          if (year.includes(keyword)) return true;
          // 月份匹配
          if (month === keyword || month.replace(/^0/, '') === keyword) return true;
          // 日期匹配
          if (day === keyword || day.replace(/^0/, '') === keyword) return true;
          // 月/日组合
          if (keyword.includes('/')) {
            const [m, d] = keyword.split('/');
            if ((month === m || month.replace(/^0/, '') === m) && (day === d || day.replace(/^0/, '') === d)) return true;
          }
          // 月-日组合
          if (keyword.includes('-') && !keyword.startsWith('20')) {
            const [m, d] = keyword.split('-');
            if ((month === m || month.replace(/^0/, '') === m) && (day === d || day.replace(/^0/, '') === d)) return true;
          }
        }
      }
      
      return false;
    });
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 重置搜索
  const resetSearch = () => {
    setSearchQuery('');
  };

  // 检查是否正在搜索
  const isSearching = searchQuery.trim().length > 0;

  // 派发筛选条件变化事件，通知 StatsOverview 更新
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('matchFilterChanged', {
      detail: { isSearching, searchQuery }
    }));
  }, [searchQuery, isSearching]);

  const handleAddMatch = () => {
    if (!newMatch.date || !newMatch.myGuild || !newMatch.opponentGuild) {
      alert('请填写日期、我方帮会和对方帮会');
      return;
    }
    const match: MatchRecord = {
      ...newMatch,
      id: Date.now().toString(),
    };
    saveMatches([...matches, match]);
    setNewMatch(defaultRecord);
    setIsAddingMatch(false);
  };

  const handleDeleteMatch = (id: string) => {
    if (confirm('确定删除这条战绩记录吗？')) {
      saveMatches(matches.filter(m => m.id !== id));
    }
  };

  const handleUpdateMatch = () => {
    if (!editingMatch) return;
    saveMatches(matches.map(m => m.id === editingMatch.id ? editingMatch : m));
    setEditingMatch(null);
  };

  // 获取当前职业的核心字段
  const getCoreStats = (className: string) => {
    return classCoreStats[className] || [];
  };

  // 判断是否是核心字段
  const isCoreStat = (className: string, statLabel: string) => {
    return getCoreStats(className).includes(statLabel);
  };

  // 清洗录屏链接：从混杂文本中提取有效的 URL
  // 输入示例：`【2026-04-08_21-02-42-哔哩哔哩】 https://b23.tv/M7Qev0wz`
  // 输出示例：`https://b23.tv/M7Qev0wz`
  const processReplayUrl = (url: string): string => {
    if (!url) return '';
    
    // 去除前后空格
    const processed = url.trim();
    
    // 使用正则表达式从文本中提取 http:// 或 https:// 开头的完整 URL
    const urlMatch = processed.match(/(https?:\/\/[^\s\u4e00-\u9fa5]*)/i);
    
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    
    return '';
  };

  // 打开录屏链接
  const openReplayUrl = (e: React.MouseEvent, replayUrl: string) => {
    e.stopPropagation();
    const processedUrl = processReplayUrl(replayUrl);
    if (processedUrl) {
      window.open(processedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="stats" className="py-12 bg-[var(--theme-bg-page)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">历史战绩</h2>
          <p className="text-[var(--theme-text-muted)] text-sm">记录每一场约战</p>
        </div>

        {/* Global Search Bar */}
        <div className="mb-6 bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-4">
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <div className="flex-shrink-0">
              <Search className="w-5 h-5 text-[var(--theme-text-muted)]" />
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="搜索帮会/日期/结果..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-2 py-2 bg-transparent border-none text-[var(--theme-text-primary)] text-base focus:outline-none placeholder-[var(--theme-text-muted)]"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={resetSearch}
                className="flex-shrink-0 p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Reset Button */}
            {isSearching && (
              <button
                onClick={resetSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--theme-text-secondary)] border border-[var(--theme-accent)] rounded-lg hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            )}
            
            {/* Result Count */}
            <div className="flex-shrink-0 flex items-center gap-1.5 text-sm">
              <span className="text-[var(--theme-text-muted)]">共</span>
              <span className={`font-bold ${filteredMatches.length > 0 ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-muted)]'}`}>
                {filteredMatches.length}
              </span>
              <span className="text-[var(--theme-text-muted)]">条</span>
            </div>
          </div>
          
          {/* Search Tips */}
          {!isSearching && (
            <div className="mt-2 text-xs text-[var(--theme-text-muted)]">
              支持帮会名称、日期（如 04/08、2026）、结果（胜/败）关键词，多个关键词用空格分隔
            </div>
          )}
        </div>

        {/* Add Match Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsAddingMatch(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
          >
            <Plus className="w-5 h-5" />
            添加战绩
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAddingMatch || editingMatch) && (
          <div className="mb-6 bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-5 max-h-[80vh] overflow-y-auto">
            <h3 className="text-[var(--theme-text-primary)] font-bold mb-4 sticky top-0 bg-[var(--theme-bg-card)] pb-2">
              {isAddingMatch ? '添加新战绩' : '编辑战绩'}
            </h3>
            
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm">日期时间 *</label>
                <input
                  type="datetime-local"
                  value={isAddingMatch ? newMatch.date : editingMatch?.date || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, date: e.target.value })
                    : setEditingMatch({ ...editingMatch!, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm">职业 *</label>
                <div className="relative">
                  <select
                    value={isAddingMatch ? newMatch.myClass : editingMatch?.myClass || '龙吟'}
                    onChange={(e) => isAddingMatch
                      ? setNewMatch({ ...newMatch, myClass: e.target.value })
                      : setEditingMatch({ ...editingMatch!, myClass: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)] appearance-none"
                  >
                    {classes.map(cls => (
                      <option key={cls.name} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    {(isAddingMatch ? newMatch.myClass : editingMatch?.myClass || '龙吟') && (
                      <img 
                        src={classes.find(c => c.name === (isAddingMatch ? newMatch.myClass : editingMatch?.myClass))?.icon || ''} 
                        alt=""
                        className="h-6 w-6 object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm">模式</label>
                <select
                  value={isAddingMatch ? newMatch.mode : editingMatch?.mode || '帮会联赛'}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, mode: e.target.value })
                    : setEditingMatch({ ...editingMatch!, mode: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  <option value="帮会联赛">帮会联赛</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm">结果</label>
                <select
                  value={isAddingMatch ? newMatch.result : editingMatch?.result || '胜利'}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, result: e.target.value })
                    : setEditingMatch({ ...editingMatch!, result: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  <option value="胜利">胜利</option>
                  <option value="失败">失败</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--theme-text-secondary)] text-sm">强度(cw)</label>
                <input
                  type="text"
                  placeholder="如: 45cw"
                  value={isAddingMatch ? newMatch.strength : editingMatch?.strength || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, strength: e.target.value })
                    : setEditingMatch({ ...editingMatch!, strength: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="text-[#666666] text-sm">我方帮会 *</label>
                <input
                  type="text"
                  placeholder="我方帮会名称"
                  value={isAddingMatch ? newMatch.myGuild : editingMatch?.myGuild || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, myGuild: e.target.value })
                    : setEditingMatch({ ...editingMatch!, myGuild: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[#666666] text-sm">对方帮会 *</label>
                <input
                  type="text"
                  placeholder="对方帮会名称"
                  value={isAddingMatch ? newMatch.opponentGuild : editingMatch?.opponentGuild || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, opponentGuild: e.target.value })
                    : setEditingMatch({ ...editingMatch!, opponentGuild: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
            </div>

            {/* 数据模块标题 */}
            <div className="mt-6 mb-3">
              <h4 className="text-[#666666] text-sm font-medium flex items-center gap-2">
                <Swords className="w-4 h-4" />
                数据统计（选填）
              </h4>
            </div>

            {/* 我方数据 - 网格布局 */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {allStats.map(stat => {
                const currentClass = isAddingMatch ? newMatch.myClass : editingMatch?.myClass || '龙吟';
                const isCore = isCoreStat(currentClass, stat.label);
                const isWanField = wanFields.includes(stat.key);
                const value = isAddingMatch 
                  ? newMatch[stat.key as keyof typeof newMatch]
                  : editingMatch?.[stat.key as keyof MatchRecord] || '';
                
                return (
                  <div 
                    key={stat.key} 
                    className={`rounded-lg p-2 transition-colors ${
                      isCore 
                        ? 'bg-blue-50 border border-blue-200' 
                        : ''
                    }`}
                  >
                    <label className={`text-xs mb-1 block ${isCore ? 'text-blue-600 font-medium' : 'text-[#999999]'}`}>
                      {stat.label}{isWanField && <span className="text-[#999999] font-normal">（单位：万）</span>} {isCore && <span className="text-blue-500">*</span>}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={value}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isAddingMatch) {
                          setNewMatch({ ...newMatch, [stat.key]: val });
                        } else if (editingMatch) {
                          setEditingMatch({ ...editingMatch, [stat.key]: val });
                        }
                      }}
                      className={`w-full px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${
                        isCore 
                          ? 'bg-blue-100/70 border border-blue-200 text-blue-800' 
                          : 'bg-white border border-[#e5e5e5] text-[#1a1a1a] focus:border-[var(--theme-primary)]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* 其他信息 */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[#666666] text-sm">录屏链接</label>
                <input
                  type="text"
                  placeholder="B站/抖音等录屏链接"
                  value={isAddingMatch ? newMatch.replayUrl : editingMatch?.replayUrl || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, replayUrl: e.target.value })
                    : setEditingMatch({ ...editingMatch!, replayUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="text-[#666666] text-sm">复盘备注</label>
                <textarea
                  placeholder="对战简评、胜负原因..."
                  rows={3}
                  value={isAddingMatch ? newMatch.review : editingMatch?.review || ''}
                  onChange={(e) => isAddingMatch
                    ? setNewMatch({ ...newMatch, review: e.target.value })
                    : setEditingMatch({ ...editingMatch!, review: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[var(--theme-primary)] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setIsAddingMatch(false); setEditingMatch(null); }}
                className="px-4 py-2 text-[#666666] hover:text-[#1a1a1a]"
              >
                取消
              </button>
              <button
                onClick={isAddingMatch ? handleAddMatch : handleUpdateMatch}
                className="px-5 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
              >
                {isAddingMatch ? '添加' : '保存'}
              </button>
            </div>
          </div>
        )}

        {/* Match List */}
        <div className="space-y-2">
          {filteredMatches.map(match => {
            const isExpanded = expandedId === match.id;

            return (
              <div
                key={match.id}
                className={`bg-[var(--theme-bg-card)] rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                  match.result === '胜利'
                    ? 'border-[var(--win)]/30'
                    : 'border-[var(--lose)]/30'
                }`}
              >
                {/* Match Row - 缩略状态，一行水平排列 */}
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-[var(--theme-bg-page)]/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : match.id)}
                >
                  {/* 主行：日期 | 对战双方+强度 | 结果 | 录屏 | 展开箭头 */}
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    
                    {/* 1. 结果标签 */}
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                        match.result === '胜利'
                          ? 'bg-[var(--theme-primary)] text-white'
                          : 'bg-[var(--lose)] text-white'
                      }`}
                    >
                      {match.result === '胜利' ? '胜' : '败'}
                    </span>

                    {/* 2. 日期 */}
                    <div className="flex items-center gap-1 text-[var(--theme-text-secondary)] flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        {match.date ? new Date(match.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) : '—'}
                      </span>
                    </div>

                    {/* 3. 对战双方 + 强度 */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                      {/* 职业图标 */}
                      <img 
                        src={classes.find(c => c.name === match.myClass)?.icon || ''} 
                        alt={match.myClass}
                        className="h-4 w-4 object-contain flex-shrink-0"
                      />
                      <span className="text-[var(--theme-text-primary)] truncate text-xs sm:text-sm">{match.myGuild || '我方'}</span>
                      <span className="text-[var(--theme-text-muted)] text-[10px] sm:text-xs flex-shrink-0">VS</span>
                      <span className="text-[var(--theme-text-primary)] truncate text-xs sm:text-sm">{match.opponentGuild || '对方'}</span>
                      {match.strength && (
                        <span className="px-1 py-0.5 rounded bg-[var(--theme-primary-light)] text-[var(--theme-primary)] text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                          {match.strength}
                        </span>
                      )}
                    </div>

                    {/* 4. 录屏链接 - 有链接显示可点击按钮，无链接显示置灰文字 */}
                    {processReplayUrl(match.replayUrl) ? (
                      <button
                        onClick={(e) => openReplayUrl(e, match.replayUrl)}
                        className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0 cursor-pointer transition-all ${
                          match.result === '胜利'
                            ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20'
                            : 'bg-[var(--lose)]/10 text-[var(--lose)] hover:bg-[var(--lose)]/20'
                        }`}
                      >
                        <Trophy className="w-3 h-3" />
                        <span>录屏</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[var(--theme-text-muted)] text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0 pointer-events-none">
                        <Trophy className="w-3 h-3" />
                        <span>录屏</span>
                      </span>
                    )}

                    {/* 5. 展开/收起图标 - 最右侧 */}
                    <div className="flex-shrink-0 ml-auto">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--theme-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--theme-text-muted)]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content - 展开状态，流畅动画 */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-[var(--theme-accent)] p-4 bg-[var(--theme-bg-page)]">
                    {/* 数据统计网格 */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {/* 人伤 */}
                      {match.humanDamage && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{formatWanValue(match.humanDamage)}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">人伤</div>
                        </div>
                      )}
                      {/* 塔伤 */}
                      {match.towerDamage && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{formatWanValue(match.towerDamage)}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">塔伤</div>
                        </div>
                      )}
                      {/* 卸甲 */}
                      {match.removeArmor && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{formatWanValue(match.removeArmor)}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">卸甲</div>
                        </div>
                      )}
                      {/* 治疗 */}
                      {match.heal && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--win)]">{formatWanValue(match.heal)}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">治疗</div>
                        </div>
                      )}
                      {/* 承伤 */}
                      {match.damage && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{formatWanValue(match.damage)}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">承伤</div>
                        </div>
                      )}
                      {/* 复活/清泉 */}
                      {match.resurrect && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{match.resurrect}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">复活/清泉</div>
                        </div>
                      )}
                      {/* 焚骨 */}
                      {match.burnBone && (
                        <div className="bg-[var(--theme-bg-card)] rounded-lg border border-[var(--theme-accent)] p-2 text-center">
                          <div className="text-sm font-bold text-[var(--theme-text-primary)]">{match.burnBone}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">焚骨</div>
                        </div>
                      )}
                    </div>

                    {/* 复盘信息 */}
                    {match.review && (
                      <div className="mt-3 pt-3 border-t border-[var(--theme-accent)]">
                        <p className="text-[var(--theme-text-secondary)] text-xs">{match.review}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end gap-3 mt-3">
                      <button
                        onClick={() => setEditingMatch(match)}
                        className="flex items-center gap-1 px-3 py-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] text-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>编辑</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--lose)] text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-[var(--theme-accent)] mx-auto mb-3" />
            <p className="text-[var(--theme-text-muted)]">暂无战绩记录，点击上方按钮添加</p>
          </div>
        )}
      </div>
    </section>
  );
}
