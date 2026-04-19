'use client';

import { useState } from 'react';
import { Shield, Trophy, Medal, Star, ChevronDown, ChevronUp, Crown, Zap, Sun, Moon, Sparkles, Search, Loader2, AlertCircle } from 'lucide-react';
import {
  jianyingS1,
  jianyingStar,
  jianyingS2,
  jianyingS3,
  panzhiCup1,
  panzhiCup2,
  panzhiCup3,
  HonorTeam,
} from '@/config/honor-data';

const tabs = [
  { id: 'gods', name: '诸神榜单', icon: Crown },
  { id: 'wanren', name: '万刃争锋', icon: Zap },
  { id: 'honor', name: '荣誉殿堂', icon: Sparkles },
];

// 强度等级配色
const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  '顶尖': { bg: 'bg-[#d4af37]/10', text: 'text-[#d4af37]', border: 'border-[#d4af37]/30' },
  '高端': { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
  '中高端': { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200' },
  '中端': { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-200' },
  '中低端': { bg: 'bg-green-50', text: 'text-green-500', border: 'border-green-200' },
  '普通甲1': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  '普通': { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' },
};

// 诸神榜单数据 - 第八期（用户提供）
const godsRanking = {
  tianBang: [
    { rank: 1, guild: '花港观鱼', server: '玲珑相思' },
    { rank: 2, guild: '元气丶剑鸣沧海', server: '沧海月明' },
    { rank: 3, guild: '好甜丶梧桐枝', server: '江山如画' },
    { rank: 4, guild: '月行', server: '紫禁之巅' },
    { rank: 5, guild: '绝顶', server: '满堂花醉' },
    { rank: 6, guild: '万星凌霄', server: '一蓑烟雨' },
    { rank: 7, guild: '雾潋宝可梦', server: '满堂花醉' },
    { rank: 8, guild: '云梦远', server: '浮生若梦' },
  ],
  diBang: [
    { rank: 1, guild: '芳华', server: '东京梦华' },
    { rank: 2, guild: '夜澜尽雪', server: '瑶光听雪' },
    { rank: 3, guild: '宽窄', server: '姑苏绮罗+魔都风云' },
    { rank: 4, guild: '望安', server: '烟雨江南' },
    { rank: 5, guild: '彩虹', server: '烟雨江南' },
    { rank: 6, guild: '风禾尽起', server: '君心如月+千里蝉娟+问鼎江湖' },
    { rank: 7, guild: '知澜意', server: '西子湖畔' },
    { rank: 8, guild: '星澜', server: '游园惊梦+佳期如梦+日月同辉' },
  ],
  xuanBang: [
    { rank: 1, guild: '寂空', server: '挑灯看剑' },
    { rank: 2, guild: '秋水揽星河', server: '一蓑烟雨' },
    { rank: 3, guild: '月映青岚', server: '沧海月明' },
    { rank: 4, guild: '虹桥插兜佬', server: '千古风流+武林天骄+神龙九现' },
    { rank: 5, guild: '凌霜', server: '剑胆琴心+群龙之首+九州风雷' },
    { rank: 6, guild: '战神殿', server: '千古风流+武林天骄+神龙九现' },
    { rank: 7, guild: '陷入热恋', server: '缘定三生' },
    { rank: 8, guild: '长乐未央', server: '惊鸿照影' },
    { rank: 9, guild: '观澜', server: '绝代风华' },
    { rank: 10, guild: '七海星澜', server: '东京梦华' },
    { rank: 11, guild: '望月醉浮生', server: '九天揽月' },
    { rank: 12, guild: '有鸡', server: '金风玉露+江湖一梦+扶摇万里' },
    { rank: 13, guild: '元气丶相恋沧海', server: '沧海月明' },
    { rank: 14, guild: '不可一世', server: '武林萌主' },
    { rank: 15, guild: '忆墨', server: '金风玉露+江湖一梦+扶摇万里' },
    { rank: 16, guild: '故人归', server: '玲珑相思' },
  ],
  huangBang: [
    { rank: 1, guild: '璃月', server: '刀剑如梦+两广豪杰+铁马秋风' },
    { rank: 2, guild: '盛夏', server: '仲夏绮梦' },
    { rank: 3, guild: '极夜', server: '烟雨江南' },
    { rank: 4, guild: '天命风流', server: '玲珑相思' },
    { rank: 5, guild: '夜雨', server: '金风玉露+江湖一梦+扶摇万里' },
    { rank: 6, guild: '云烟', server: '瑶光听雪' },
    { rank: 7, guild: '镇关', server: '西子湖畔' },
    { rank: 8, guild: '聆霄', server: '沧海月明' },
    { rank: 9, guild: '空语流光', server: '天下无双' },
    { rank: 10, guild: '四时令', server: '明月天涯' },
    { rank: 11, guild: '君临', server: '烟雨江南' },
    { rank: 12, guild: '时赋秋雪', server: '浮生若梦' },
    { rank: 13, guild: '温弦东隅', server: '姑苏绮罗+魔都风云' },
    { rank: 14, guild: '烬海', server: '瑶光听雪' },
    { rank: 15, guild: '辉夜', server: '云川雪青' },
    { rank: 16, guild: '金曜', server: '雪泥鸿爪+碧海问舟+燕字归时' },
    { rank: 17, guild: '飘渺', server: '踏月留香' },
    { rank: 18, guild: '拂晓', server: '翩若惊鸿' },
    { rank: 19, guild: '九星', server: '瑶光听雪' },
    { rank: 20, guild: '般若浮生', server: '九天揽月' },
    { rank: 21, guild: '梦境', server: '紫禁之巅' },
    { rank: 22, guild: '暮雪', server: '东京梦华' },
    { rank: 23, guild: '醉云音', server: '明月天涯' },
    { rank: 24, guild: '墨染留香', server: '沧海月明' },
    { rank: 25, guild: '千凌雪', server: '江山如画' },
    { rank: 26, guild: '好甜丶凤凰羽', server: '江山如画' },
    { rank: 27, guild: '登临意', server: '游园惊梦+佳期如梦+日月同辉' },
    { rank: 28, guild: '如梦令', server: '踏月留香' },
    { rank: 29, guild: '念几千秋', server: '武林萌主' },
    { rank: 30, guild: '雾潋', server: '满堂花醉' },
    { rank: 31, guild: '中不中', server: '剑胆琴心+群龙之首+九州风雷' },
    { rank: 32, guild: '君莫笑', server: '瑶光听雪' },
  ],
};

// 万刃争锋数据（第一届）
const wanrenData1 = {
  逐月: [
    { rank: 1, guild: '鸣海', server: '沧海月明' },
    { rank: 2, guild: '三潭映月', server: '玲珑相思' },
    { rank: 3, guild: '夜尽天明', server: '瑶光听雪' },
    { rank: 4, guild: '云川|紫禁', server: '紫禁之巅' },
  ],
  御云: [
    { rank: 1, guild: '花港观鱼', server: '玲珑相思' },
    { rank: 2, guild: '云玩家', server: '' },
    { rank: 3, guild: '剑影荡九霄', server: '' },
    { rank: 4, guild: '宽窄', server: '姑苏绮罗' },
  ],
  飞阳: [
    { rank: 1, guild: '极夜丶梧桐枝', server: '江山如画' },
    { rank: 2, guild: '元気', server: '沧海月明' },
    { rank: 3, guild: '四时令', server: '明月天涯' },
    { rank: 4, guild: '断情', server: '瑶光听雪' },
  ],
  扶光: [
    { rank: 1, guild: '星落流尘', server: '烟雨江南' },
    { rank: 2, guild: '墨影|疏星晚月', server: '江山如画' },
    { rank: 3, guild: '长乐未央', server: '惊鸿照影' },
    { rank: 4, guild: '七月流火', server: '姑苏绮罗' },
  ],
};

// 万刃争锋数据（第二届）
const wanrenData2 = {
  逐月: [
    { rank: 1, guild: '元气', server: '沧海月明' },
    { rank: 2, guild: '云梦远', server: '浮生若梦' },
    { rank: 3, guild: '一个新帮', server: '西子湖畔' },
    { rank: 4, guild: '折花', server: '东京梦华' },
    { rank: 5, guild: '空语大宝贝', server: '天下无双' },
    { rank: 6, guild: '福临天阙', server: '烟雨江南' },
    { rank: 7, guild: '知澜意', server: '西子湖畔' },
    { rank: 8, guild: '请君三尺剑', server: '九天揽月' },
  ],
  御云: [
    { rank: 1, guild: '花港观鱼', server: '玲珑相思' },
    { rank: 2, guild: '杏林无花', server: '九天揽月' },
    { rank: 3, guild: '好甜', server: '西子湖畔' },
    { rank: 4, guild: '四时令', server: '明月天涯' },
    { rank: 5, guild: '夜阑听雨', server: '缘定三生' },
    { rank: 6, guild: '彩虹', server: '烟雨江南' },
    { rank: 7, guild: '辉夜长明', server: '云川雪青' },
    { rank: 8, guild: '三鸟集团', server: '扶摇万里' },
  ],
  飞阳: [
    { rank: 1, guild: '雪述山河', server: '满堂花醉' },
    { rank: 2, guild: '云川|紫禁', server: '紫禁之巅' },
    { rank: 3, guild: '合欢宗|', server: '一蓑烟雨' },
    { rank: 4, guild: '山珈剑', server: '沧海月明' },
    { rank: 5, guild: '风禾尽起', server: '千里婵娟' },
    { rank: 6, guild: '战神殿', server: '武林天骄' },
    { rank: 7, guild: '赤华', server: '翩若惊鸿' },
    { rank: 8, guild: '观澜', server: '绝代风华' },
  ],
  扶光: [
    { rank: 1, guild: '星火长明', server: '缘定三生' },
    { rank: 2, guild: '极夜丶梧桐枝', server: '江山如画' },
    { rank: 3, guild: '绝顶', server: '满堂花醉' },
    { rank: 4, guild: '白宫', server: '白夜拂雪' },
    { rank: 5, guild: '寂空', server: '挑灯看剑' },
    { rank: 6, guild: '揽星', server: '西子湖畔' },
    { rank: 7, guild: '宽窄', server: '姑苏绮罗' },
    { rank: 8, guild: '风华暮酒', server: '千里婵娟' },
  ],
};

// 荣誉殿堂类型定义
type HonorTabType = 'jianying' | 'panzhi';

export default function GuildRankings() {
  const [activeTab, setActiveTab] = useState('gods');
  const [expandedGods, setExpandedGods] = useState<string[]>(['tianBang', 'diBang', 'xuanBang', 'huangBang']);
  const [expandedWanren, setExpandedWanren] = useState<string[]>(['wanren2']);
  const [honorTab, setHonorTab] = useState<HonorTabType>('jianying');
  const [expandedSections, setExpandedSections] = useState<string[]>(['jianying-s1', 'panzhi-3']);

  const toggleGodsSection = (section: string) => {
    setExpandedGods(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleWanrenSection = (season: string) => {
    setExpandedWanren(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const toggleHonorSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // 帮会查询状态（同时查询甲一帮会数据库和赛事数据库）
  const [queryGuild1, setQueryGuild1] = useState('');
  const [queryGuild1Server, setQueryGuild1Server] = useState('');
  const [searchResult, setSearchResult] = useState<{
    results: Array<{
      type: string;
      displayText: string;
      guildData?: Record<string, unknown>;
      eventData?: Record<string, unknown>;
    }>;
  } | null>(null);
  const [queryError, setQueryError] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  // 查询帮会（同时查询甲一帮会数据库和赛事数据库）
  const handleQueryGuild = async () => {
    if (!queryGuild1.trim()) {
      setQueryError('请输入帮会名称');
      return;
    }

    setIsQuerying(true);
    setQueryError('');
    setSearchResult(null);

    try {
      const response = await fetch('/api/guilds/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild_name: queryGuild1,
          server: queryGuild1Server
        })
      });

      const data = await response.json();

      if (data.success) {
        setSearchResult(data.data);
      } else {
        setQueryError(data.error || '查询失败');
      }
    } catch (err) {
      console.error('Search error:', err);
      setQueryError('网络错误，请稍后重试');
    } finally {
      setIsQuerying(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-[var(--theme-primary)] bg-[var(--theme-primary-light)]';
    if (rank === 2) return 'text-[#c0c0c0] bg-[#f5f5f5]';
    if (rank === 3) return 'text-[#cd7f32] bg-[#fff8e6]';
    return 'text-[#666666] bg-[#f5f5f5]';
  };

  // 格式化帮会名称显示
  const formatGuildName = (guild: string, server: string) => {
    if (!server || server === '未知' || server.includes('未知')) {
      return guild;
    }
    return `${guild}（${server}）`;
  };

  // 荣誉殿堂辅助函数
  const getTeamRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]';
    if (rank === 2) return 'bg-[#f5f5f5] text-[#c0c0c0]';
    if (rank === 3) return 'bg-[#fff8e6] text-[#cd7f32]';
    return 'bg-[#fafafa] text-[#666666]';
  };

  return (
    <section id="rankings" className="py-12 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">帮会榜单</h2>
          <p className="text-[var(--muted-foreground)] text-sm">诸神榜单 · 历届赛事荣誉</p>
        </div>

        {/* 顶部帮会查询框（同时查询甲一帮会数据库和赛事数据库） */}
        <div className="mb-6 bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="输入帮会名称查询"
              value={queryGuild1}
              onChange={(e) => setQueryGuild1(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQueryGuild()}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--theme-primary)] text-base"
            />
            <button
              onClick={handleQueryGuild}
              disabled={isQuerying || !queryGuild1.trim()}
              className="min-h-[44px] px-6 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base"
            >
              {isQuerying ? '查询中...' : '查询'}
            </button>
          </div>
          {/* 顶部查询结果 */}
          {queryError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {queryError}
            </div>
          )}
          {searchResult && (
            <div className="mt-3 space-y-2">
              {searchResult.results.map((item: {type: string; displayText: string; guildData?: Record<string, unknown>; eventData?: Record<string, unknown>}, index: number) => (
                <div 
                  key={`${item.type}-${index}`}
                  className="p-4 rounded-xl border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5"
                >
                  <div className="flex items-center gap-2">
                    {item.type === 'jia1' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--theme-primary)] text-white">
                        甲1
                      </span>
                    )}
                    {item.type === 'event' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[#d4af37] text-white">
                        赛事
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--foreground)] text-base font-medium mt-1">
                    {item.displayText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-white text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--theme-primary)]/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'gods' && (
          <div className="space-y-4">
            {/* 诸神榜第八期标题 */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-[#1a1a1a]">诸神榜 · 第八期</h3>
              <p className="text-[#999999] text-xs mt-1">数据基于2026年4月赛事综合评定</p>
            </div>

            {/* 天榜 */}
            <div className="bg-white rounded-xl border border-[#d4af37]/50 overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#fff8e6] to-white"
                onClick={() => toggleGodsSection('tianBang')}
              >
                <div className="flex items-center space-x-3">
                  <Crown className="w-6 h-6 text-[#d4af37]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">天榜</span>
                  <span className="text-[#999999] text-xs">TOP 8</span>
                </div>
                {expandedGods.includes('tianBang') ? (
                  <ChevronUp className="w-5 h-5 text-[#d4af37]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedGods.includes('tianBang') && (
                <div className="p-4 bg-[#fafafa]">
                  <div className="space-y-2">
                    {godsRanking.tianBang.map(item => (
                      <div key={item.rank} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#e5e5e5]">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getRankColor(item.rank)}`}>
                            {getRankIcon(item.rank)}
                          </span>
                          <span className="font-medium text-[#1a1a1a]">{formatGuildName(item.guild, item.server)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 地榜 */}
            <div className="bg-white rounded-xl border border-[#c0c0c0]/50 overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#f5f5f5] to-white"
                onClick={() => toggleGodsSection('diBang')}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-[#c0c0c0]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">地榜</span>
                  <span className="text-[#999999] text-xs">TOP 8</span>
                </div>
                {expandedGods.includes('diBang') ? (
                  <ChevronUp className="w-5 h-5 text-[#c0c0c0]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedGods.includes('diBang') && (
                <div className="p-4 bg-[#fafafa]">
                  <div className="space-y-2">
                    {godsRanking.diBang.map(item => (
                      <div key={item.rank} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#e5e5e5]">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getRankColor(item.rank)}`}>
                            {getRankIcon(item.rank)}
                          </span>
                          <span className="font-medium text-[#1a1a1a]">{formatGuildName(item.guild, item.server)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 玄榜 */}
            <div className="bg-white rounded-xl border border-[#666666]/30 overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#fafafa] to-white"
                onClick={() => toggleGodsSection('xuanBang')}
              >
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-[#666666]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">玄榜</span>
                  <span className="text-[#999999] text-xs">TOP 16</span>
                </div>
                {expandedGods.includes('xuanBang') ? (
                  <ChevronUp className="w-5 h-5 text-[#666666]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedGods.includes('xuanBang') && (
                <div className="p-4 bg-[#fafafa]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {godsRanking.xuanBang.map(item => (
                      <div key={item.rank} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#e5e5e5]">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getRankColor(item.rank)}`}>
                            {getRankIcon(item.rank)}
                          </span>
                          <span className="font-medium text-[#1a1a1a]">{formatGuildName(item.guild, item.server)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 黄榜 */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#fafafa] to-white"
                onClick={() => toggleGodsSection('huangBang')}
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-[#999999]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">黄榜</span>
                  <span className="text-[#999999] text-xs">TOP 32</span>
                </div>
                {expandedGods.includes('huangBang') ? (
                  <ChevronUp className="w-5 h-5 text-[#999999]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedGods.includes('huangBang') && (
                <div className="p-4 bg-[#fafafa]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {godsRanking.huangBang.map(item => (
                      <div key={item.rank} className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e5e5e5]">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${getRankColor(item.rank)}`}>
                            {getRankIcon(item.rank)}
                          </span>
                          <span className="text-sm text-[#1a1a1a]">{formatGuildName(item.guild, item.server)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wanren' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-[#1a1a1a]">万刃争锋</h3>
              <p className="text-[#999999] text-xs mt-1">跨服俱乐部联赛 · 4大赛区</p>
            </div>

            {/* 第一届 */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#fafafa] to-white"
                onClick={() => toggleWanrenSection('wanren1')}
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-[#d4af37]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">第1届</span>
                </div>
                {expandedWanren.includes('wanren1') ? (
                  <ChevronUp className="w-5 h-5 text-[#999999]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedWanren.includes('wanren1') && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fafafa]">
                  {Object.entries(wanrenData1).map(([area, teams]) => (
                    <div key={area} className="border border-[#e5e5e5] rounded-lg p-3 bg-white">
                      <h4 className="text-[#d4af37] font-medium mb-2">{area}赛区</h4>
                      <div className="space-y-2">
                        {teams.map(team => (
                          <div key={team.rank} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${getRankColor(team.rank)}`}>
                                {getRankIcon(team.rank)}
                              </span>
                              <span className="text-sm text-[#1a1a1a]">{formatGuildName(team.guild, team.server)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 第二届 */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#fff8e6] to-white"
                onClick={() => toggleWanrenSection('wanren2')}
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-[#d4af37]" />
                  <span className="text-lg font-bold text-[#1a1a1a]">第2届</span>
                </div>
                {expandedWanren.includes('wanren2') ? (
                  <ChevronUp className="w-5 h-5 text-[#999999]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#999999]" />
                )}
              </button>
              {expandedWanren.includes('wanren2') && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fafafa]">
                  {Object.entries(wanrenData2).map(([area, teams]) => (
                    <div key={area} className="border border-[#e5e5e5] rounded-lg p-3 bg-white">
                      <h4 className="text-[#d4af37] font-medium mb-2">{area}赛区</h4>
                      <div className="space-y-2">
                        {teams.map(team => (
                          <div key={team.rank} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${getRankColor(team.rank)}`}>
                                {getRankIcon(team.rank)}
                              </span>
                              <span className="text-sm text-[#1a1a1a]">{formatGuildName(team.guild, team.server)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'honor' && (
          <>
            {/* 荣誉殿堂子 Tab */}
            <div className="flex gap-2 justify-center mb-6">
              <button
                onClick={() => setHonorTab('jianying')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                  honorTab === 'jianying'
                    ? 'bg-[var(--theme-primary)] text-white'
                    : 'bg-white text-[var(--muted-foreground)] border border-[var(--border)]'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="font-medium">剑影杯</span>
              </button>
              <button
                onClick={() => setHonorTab('panzhi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                  honorTab === 'panzhi'
                    ? 'bg-[var(--theme-primary)] text-white'
                    : 'bg-white text-[var(--muted-foreground)] border border-[var(--border)]'
                }`}
              >
                <Medal className="w-4 h-4" />
                <span className="font-medium">盼之杯</span>
              </button>
            </div>

            {/* 剑影杯内容 */}
            {honorTab === 'jianying' && (
              <div className="space-y-3">
                {/* 剑影杯 S1 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('jianying-s1')}
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-[var(--theme-primary)]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">剑影杯 S1</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2024.12</span>
                      </div>
                    </div>
                    {expandedSections.includes('jianying-s1') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('jianying-s1') && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* 赛区冠军 */}
                      <div className="p-3 bg-[var(--muted)] rounded-lg">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 font-medium">赛区冠军</div>
                        <div className="flex items-center gap-3 py-2">
                          <span className="text-sm text-[var(--muted-foreground)] w-12 flex items-center gap-1">
                            <Sun className="w-3 h-3" />
                          </span>
                          <span className="text-[var(--foreground)]">{jianyingS1.champion.曜日.guild}</span>
                          <span className="text-[var(--muted-foreground)] text-sm">— {jianyingS1.champion.曜日.server}</span>
                        </div>
                        <div className="flex items-center gap-3 py-2">
                          <span className="text-sm text-[var(--muted-foreground)] w-12 flex items-center gap-1">
                            <Moon className="w-3 h-3" />
                          </span>
                          <span className="text-[var(--foreground)]">{jianyingS1.champion.月诸.guild}</span>
                          <span className="text-[var(--muted-foreground)] text-sm">— {jianyingS1.champion.月诸.server}</span>
                        </div>
                      </div>
                      {/* 月诸赛区八强 */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Moon className="w-4 h-4 text-[#a8c8e8]" />
                          <span className="text-sm font-medium text-[var(--muted-foreground)]">月诸赛区八强</span>
                        </div>
                        <div className="space-y-1">
                          {jianyingS1.top8.月诸.map(team => (
                            <div key={team.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getTeamRankStyle(team.rank)}`}>
                                {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                              </span>
                              <div className="flex-1">
                                <span className="text-[var(--foreground)] font-medium">{team.guild}</span>
                                {team.server && <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* 曜日赛区八强 */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-[#f4d03f]" />
                          <span className="text-sm font-medium text-[var(--muted-foreground)]">曜日赛区八强</span>
                        </div>
                        <div className="space-y-1">
                          {jianyingS1.top8.曜日.map(team => (
                            <div key={team.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getTeamRankStyle(team.rank)}`}>
                                {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                              </span>
                              <div className="flex-1">
                                <span className="text-[var(--foreground)] font-medium">{team.guild}</span>
                                {team.server && <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 剑影杯 星辉邀请赛 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('jianying-star')}
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[var(--theme-primary)]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">星辉邀请赛</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2025.3</span>
                      </div>
                    </div>
                    {expandedSections.includes('jianying-star') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('jianying-star') && (
                    <div className="px-4 pb-4 space-y-1">
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--theme-primary-light)]">
                        <span className="text-xl">🏆</span>
                        <div>
                          <span className="text-[var(--foreground)] font-semibold">{jianyingStar.champion.guild}</span>
                          <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {jianyingStar.champion.server}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                        <span className="text-xl">🥈</span>
                        <div>
                          <span className="text-[var(--foreground)]">{jianyingStar.runnerUp.guild}</span>
                          <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {jianyingStar.runnerUp.server}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 px-3">四强</div>
                        {jianyingStar.semiFinalists.map((team, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)]">
                            <span className="text-[var(--muted-foreground)] text-sm w-6">{idx + 1}.</span>
                            <div>
                              <span className="text-[var(--muted-foreground)]">{team.guild}</span>
                              <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 剑影杯 S2 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('jianying-s2')}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[var(--theme-primary)]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">剑影杯 S2</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2025.5</span>
                      </div>
                    </div>
                    {expandedSections.includes('jianying-s2') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('jianying-s2') && (
                    <div className="px-4 pb-4 space-y-1">
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--theme-primary-light)]">
                        <span className="text-xl">🏆</span>
                        <div>
                          <span className="text-[var(--foreground)] font-semibold">{jianyingS2.champion.guild}</span>
                          <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {jianyingS2.champion.server}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                        <span className="text-xl">🥈</span>
                        <div>
                          <span className="text-[var(--foreground)]">{jianyingS2.runnerUp.guild}</span>
                          <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {jianyingS2.runnerUp.server}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 px-3">四强</div>
                        {jianyingS2.semiFinalists.map((team, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)]">
                            <span className="text-[var(--muted-foreground)] text-sm w-6">{idx + 1}.</span>
                            <div>
                              <span className="text-[var(--muted-foreground)]">{team.guild}</span>
                              <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 剑影杯 S3 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('jianying-s3')}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[var(--theme-primary)]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">剑影杯 S3</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2025.10</span>
                      </div>
                    </div>
                    {expandedSections.includes('jianying-s3') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('jianying-s3') && (
                    <div className="px-4 pb-4 space-y-1">
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--theme-primary-light)]">
                        <span className="text-xl">🏆</span>
                        <span className="text-[var(--foreground)] font-semibold">{jianyingS3.champion.guild}</span>
                      </div>
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                        <span className="text-xl">🥈</span>
                        <div>
                          <span className="text-[var(--foreground)]">{jianyingS3.runnerUp.guild}</span>
                          {jianyingS3.runnerUp.server && (
                            <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {jianyingS3.runnerUp.server}</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 px-3">四强</div>
                        {jianyingS3.semiFinalists.map((team, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)]">
                            <span className="text-[var(--muted-foreground)] text-sm w-6">{idx + 1}.</span>
                            <span className="text-[var(--muted-foreground)]">{team.guild}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 盼之杯内容 */}
            {honorTab === 'panzhi' && (
              <div className="space-y-3">
                {/* 第三届盼之杯 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('panzhi-3')}
                  >
                    <div className="flex items-center gap-3">
                      <Medal className="w-5 h-5 text-[#a855f7]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">第三届盼之杯</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2025.10</span>
                      </div>
                    </div>
                    {expandedSections.includes('panzhi-3') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('panzhi-3') && (
                    <div className="px-4 pb-4 space-y-1">
                      {panzhiCup3.map(team => (
                        <div key={team.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getTeamRankStyle(team.rank)}`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                          </span>
                          <div className="flex-1">
                            <span className="text-[var(--foreground)] font-medium">{team.guild}</span>
                            {team.server && <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 第二届盼之杯 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('panzhi-2')}
                  >
                    <div className="flex items-center gap-3">
                      <Medal className="w-5 h-5 text-[#a855f7]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">第二届盼之杯</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2025.5</span>
                      </div>
                    </div>
                    {expandedSections.includes('panzhi-2') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('panzhi-2') && (
                    <div className="px-4 pb-4 space-y-1">
                      {panzhiCup2.map(team => (
                        <div key={team.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getTeamRankStyle(team.rank)}`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                          </span>
                          <div className="flex-1">
                            <span className="text-[var(--foreground)] font-medium">{team.guild}</span>
                            {team.server && <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 第一届盼之杯 */}
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)] transition-colors"
                    onClick={() => toggleHonorSection('panzhi-1')}
                  >
                    <div className="flex items-center gap-3">
                      <Medal className="w-5 h-5 text-[#a855f7]" />
                      <div className="text-left">
                        <span className="text-base font-bold text-[var(--foreground)]">第一届盼之杯</span>
                        <span className="ml-2 text-[var(--muted-foreground)] text-sm">2024</span>
                      </div>
                    </div>
                    {expandedSections.includes('panzhi-1') ? (
                      <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                    )}
                  </button>
                  {expandedSections.includes('panzhi-1') && (
                    <div className="px-4 pb-4 space-y-1">
                      {panzhiCup1.map(team => (
                        <div key={team.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--muted)] transition-colors">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getTeamRankStyle(team.rank)}`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                          </span>
                          <div className="flex-1">
                            <span className="text-[var(--foreground)] font-medium">{team.guild}</span>
                            {team.server && <span className="ml-2 text-[var(--muted-foreground)] text-sm">— {team.server}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
          <p className="text-[var(--muted-foreground)] text-xs text-center">
            本榜单基于赛事成绩、圈内口碑、战力综合评定，非官方排名，仅供约战参考
          </p>
        </div>
      </div>
    </section>
  );
}
