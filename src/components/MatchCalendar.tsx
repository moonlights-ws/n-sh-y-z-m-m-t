'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import MatchHistory from './MatchHistory';

// 历史战绩数据结构
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

export default function MatchCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 加载历史战绩数据
  useEffect(() => {
    const saved = localStorage.getItem('matchRecords');
    if (saved) {
      setMatches(JSON.parse(saved));
    }
  }, []);

  // 获取当前月份的对战记录
  const monthMatches = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return matches.filter(match => {
      if (!match.date) return false;
      const matchDate = new Date(match.date);
      return matchDate.getFullYear() === year && matchDate.getMonth() === month;
    });
  }, [matches, currentDate]);

  // 获取有对战的日期集合
  const matchDates = useMemo(() => {
    const dates = new Set<string>();
    monthMatches.forEach(match => {
      if (match.date) {
        const date = new Date(match.date);
        dates.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      }
    });
    return dates;
  }, [monthMatches]);

  // 生成日历数据
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取月份第一天是星期几（0=周日，1=周一...6=周六）
    let startDayOfWeek = firstDay.getDay();
    // 转换为周一到周日的排列（0=周一...6=周日）
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const days: Array<{ date: number | null; isToday: boolean; hasMatch: boolean }> = [];
    
    // 填充空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isToday: false, hasMatch: false });
    }
    
    // 填充日期
    const today = new Date();
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const isToday = today.getFullYear() === year && 
                      today.getMonth() === month && 
                      today.getDate() === d;
      const hasMatch = matchDates.has(`${year}-${month}-${d}`);
      days.push({ date: d, isToday, hasMatch });
    }
    
    return days;
  }, [currentDate, matchDates]);

  // 月份切换
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesCn = ['一月', '二月', '三月', '四月', '五月', '六月',
                        '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <section id="calendar" className="py-12 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">约战日历</h2>
          <p className="text-[var(--theme-text-muted)] text-sm">记录每一场对决</p>
        </div>

        {/* Calendar Card */}
        <div 
          className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Calendar Header */}
          <div className="p-6 border-b border-[var(--theme-accent)] bg-gradient-to-r from-[var(--theme-bg-page)] to-[var(--theme-bg-card)]">
            <div className="flex items-center justify-between">
              {/* 左侧月份 */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-serif text-[#8B4513] italic tracking-wide">
                  {monthNames[currentDate.getMonth()]}
                </span>
                <span className="text-2xl text-[#8B4513] font-serif">
                  {monthNamesCn[currentDate.getMonth()]}
                </span>
              </div>
              
              {/* 右侧年份 */}
              <span className="text-4xl font-bold text-[#8B4513]/60 tracking-widest">
                {currentDate.getFullYear()}
              </span>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[var(--theme-text-muted)]" />
                <span className="text-[var(--theme-text-secondary)] text-sm">
                  本月共 <span className="text-[#8B4513] font-bold">{monthMatches.length}</span> 场对战
                </span>
              </div>
              <span className="text-[var(--theme-text-muted)] text-xs">
                {isExpanded ? '点击收起' : '点击展开详情'}
              </span>
            </div>
          </div>

          {/* Week Header */}
          <div className="grid grid-cols-7 bg-[#fafafa] border-b border-[#e5e5e5]">
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={`py-2 text-center text-sm font-serif ${
                  index === 6 ? 'text-[#8B4513]' : 'text-[var(--theme-text-secondary)]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 p-4">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className="aspect-square flex items-center justify-center"
              >
                {day.date ? (
                  <div 
                    className={`relative w-8 h-8 flex items-center justify-center ${
                      day.isToday ? 'ring-2 ring-[#8B4513]/30' : ''
                    }`}
                  >
                    <span 
                      className={`text-base font-serif ${
                        day.isToday 
                          ? 'text-[#8B4513] font-bold' 
                          : 'text-[var(--theme-text-primary)]'
                      }`}
                    >
                      {day.date}
                    </span>
                    {day.hasMatch && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full border-2 border-[#8B4513]/40"></div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#fafafa] border-t border-[#e5e5e5]">
            <button
              onClick={(e) => { e.stopPropagation(); prevMonth(); }}
              className="p-2 rounded-full hover:bg-[#e5e5e5] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--theme-text-secondary)]" />
            </button>
            <span className="text-sm text-[var(--theme-text-secondary)]">
              {currentDate.getFullYear()} 年 {monthNamesCn[currentDate.getMonth()]}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); nextMonth(); }}
              className="p-2 rounded-full hover:bg-[#e5e5e5] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[var(--theme-text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Expanded Match List */}
        <div className={`mt-4 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-2">
            {monthMatches.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-[#e5e5e5]">
                <CalendarIcon className="w-10 h-10 text-[#e5e5e5] mx-auto mb-2" />
                <p className="text-[var(--theme-text-muted)]">本月暂无对战记录</p>
              </div>
            ) : (
              monthMatches
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(match => (
                  <div 
                    key={match.id}
                    className={`bg-white rounded-lg border-l-4 p-3 ${
                      match.result === '胜利'
                        ? 'border-l-[#22c55e]'
                        : 'border-l-[#ef4444]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--theme-text-secondary)]">
                          {match.date ? new Date(match.date).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                        <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                          {match.myGuild} VS {match.opponentGuild}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          match.result === '胜利'
                            ? 'bg-[#22c55e]/10 text-[#22c55e]'
                            : 'bg-[#ef4444]/10 text-[#ef4444]'
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>
                    {match.strength && (
                      <div className="mt-1 text-xs text-[var(--theme-text-muted)]">
                        强度: {match.strength}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
