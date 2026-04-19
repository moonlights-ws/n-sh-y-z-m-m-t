'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Target, Star, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

interface MatchRecord {
  id: string;
  date: string;
  mode: string;
  result: string;
  myClass: string;
  myGuild: string;
  opponentGuild: string;
  strength: string;
  defeat: string;
  humanDamage: string;
  towerDamage: string;
  removeArmor: string;
  heal: string;
  damage: string;
  resurrect: string;
  burnBone: string;
  death: string;
  replayUrl: string;
  review: string;
}

interface StatsData {
  totalMatches: number;
  wins: number;
  losses: number;
}

// 全局搜索匹配逻辑（与 MatchHistory 保持一致）
const matchesSearchQuery = (record: MatchRecord, searchQuery: string): boolean => {
  if (!searchQuery.trim()) return true;
  
  const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  
  return keywords.every(keyword => {
    // 1. 检查是否匹配帮会名称
    const myGuildMatch = record.myGuild?.toLowerCase().includes(keyword);
    const opponentMatch = record.opponentGuild?.toLowerCase().includes(keyword);
    if (myGuildMatch || opponentMatch) return true;
    
    // 2. 检查是否匹配结果
    const resultKeyword = keyword === '胜' || keyword === '胜利' || keyword === '赢'
      ? '胜利'
      : (keyword === '败' || keyword === '失败' || keyword === '输')
        ? '失败'
        : null;
    if (resultKeyword && record.result === resultKeyword) return true;
    
    // 3. 检查是否匹配日期
    if (record.date) {
      const dateStr = record.date;
      const dateStrLower = dateStr.toLowerCase();
      
      if (dateStrLower.includes(keyword)) return true;
      
      const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        if (year.includes(keyword)) return true;
        if (month === keyword || month.replace(/^0/, '') === keyword) return true;
        if (day === keyword || day.replace(/^0/, '') === keyword) return true;
        if (keyword.includes('/')) {
          const [m, d] = keyword.split('/');
          if ((month === m || month.replace(/^0/, '') === m) && (day === d || day.replace(/^0/, '') === d)) return true;
        }
        if (keyword.includes('-') && !keyword.startsWith('20')) {
          const [m, d] = keyword.split('-');
          if ((month === m || month.replace(/^0/, '') === m) && (day === d || day.replace(/^0/, '') === d)) return true;
        }
      }
    }
    
    return false;
  });
};

// 从历史战绩计算统计数据（支持搜索筛选）
const calculateStats = (records: MatchRecord[], searchQuery?: string): StatsData => {
  const filteredRecords = searchQuery
    ? records.filter(r => matchesSearchQuery(r, searchQuery))
    : records;
  
  const totalMatches = filteredRecords.length;
  const wins = filteredRecords.filter(r => r.result === '胜利').length;
  const losses = filteredRecords.filter(r => r.result === '失败').length;
  return { totalMatches, wins, losses };
};

// 生成近期战绩趋势数据
const generateRecentResults = (records: MatchRecord[], searchQuery?: string) => {
  const filteredRecords = searchQuery
    ? records.filter(r => matchesSearchQuery(r, searchQuery))
    : records;
  
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentRecords = sortedRecords.slice(0, 10);
  
  return recentRecords.map((record, index) => ({
    match: `${index + 1}`,
    value: record.result === '胜利' ? 1 : 0,
    result: record.result === '胜利' ? '胜' : '负',
  }));
};

export default function StatsOverview() {
  const { getCurrentUserId, user } = useAuth();
  const [stats, setStats] = useState<StatsData>({ totalMatches: 0, wins: 0, losses: 0 });
  const [recentResults, setRecentResults] = useState<{ match: string; value: number; result: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 加载统计数据
  const loadStats = (query?: string) => {
    const saved = localStorage.getItem('matchRecords');
    if (saved) {
      const records: MatchRecord[] = JSON.parse(saved);
      const calculatedStats = calculateStats(records, query);
      setStats(calculatedStats);
      setRecentResults(generateRecentResults(records, query));
    } else {
      setStats({ totalMatches: 0, wins: 0, losses: 0 });
      setRecentResults([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      loadStats();
    };
    init();
  }, [getCurrentUserId, user]);

  // 监听 localStorage 变化和筛选条件变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'matchRecords') {
        loadStats(searchQuery || undefined);
      }
    };

    const handleCustomUpdate = () => {
      loadStats(searchQuery || undefined);
    };

    const handleFilterChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isSearching: boolean; searchQuery: string }>;
      setSearchQuery(customEvent.detail.searchQuery);
      setIsSearching(customEvent.detail.isSearching);
      loadStats(customEvent.detail.searchQuery || undefined);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('matchRecordsUpdated', handleCustomUpdate);
    window.addEventListener('matchFilterChanged', handleFilterChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('matchRecordsUpdated', handleCustomUpdate);
      window.removeEventListener('matchFilterChanged', handleFilterChange);
    };
  }, [searchQuery]);

  const winRate = stats.totalMatches > 0 ? ((stats.wins / stats.totalMatches) * 100).toFixed(1) : '0.0';

  return (
    <section id="stats-overview" className="py-12 bg-[var(--theme-bg-page)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">战绩总览</h2>
            {isSearching && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-xs rounded-full">
                <Search className="w-3 h-3" />
                已筛选
              </span>
            )}
          </div>
          <p className="text-[var(--theme-text-muted)] text-sm">
            {isSearching ? `显示搜索「${searchQuery}」的结果` : '数据实时更新'}
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Matches */}
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-5 text-center card-hover">
            <Trophy className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--theme-text-primary)]">{stats.totalMatches}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">总对战场次</p>
          </div>

          {/* Wins */}
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--win)]/30 p-5 text-center card-hover">
            <TrendingUp className="w-6 h-6 text-[var(--win)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--win)]">{stats.wins}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">胜场数</p>
          </div>

          {/* Losses */}
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--lose)]/30 p-5 text-center card-hover">
            <Target className="w-6 h-6 text-[var(--lose)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--lose)]">{stats.losses}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">负场数</p>
          </div>

          {/* Win Rate */}
          <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-primary)]/30 p-5 text-center card-hover">
            <Star className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--theme-primary)]">{winRate}%</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">胜率</p>
          </div>
        </div>

        {/* Recent Results Chart */}
        <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--theme-text-primary)]">近期战绩趋势</h3>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded bg-[var(--win)]"></div>
                <span className="text-[var(--theme-text-muted)]">胜</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded bg-[var(--lose)]"></div>
                <span className="text-[var(--theme-text-muted)]">负</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded bg-[var(--theme-accent)]"></div>
                <span className="text-[var(--theme-text-muted)]">无</span>
              </div>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentResults}>
                <XAxis dataKey="match" stroke="var(--theme-text-muted)" fontSize={10} />
                <YAxis stroke="var(--theme-text-muted)" fontSize={10} domain={[-1, 1]} ticks={[-1, 0, 1]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-[var(--theme-text-primary)] text-[var(--theme-bg-page)] rounded px-2 py-1 text-xs">
                          {value === 1 ? '胜' : value === 0 ? '负' : '无数据'}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {recentResults.map((entry, index) => (
                    <rect
                      key={`cell-${index}`}
                      fill={entry.value === 1 ? 'var(--win)' : entry.value === 0 ? 'var(--lose)' : 'var(--theme-accent)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
