'use client';

import { useState } from 'react';
import { Trophy, Medal, Star, ChevronDown, ChevronUp, Crown, Sun, Moon } from 'lucide-react';
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

type TabType = 'jianying' | 'panzhi';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  accentColor,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-sm">
      <button
        className="w-full p-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: accentColor }}>{icon}</div>
          <div className="text-left">
            <span className="text-base font-bold text-[#1a1a1a]">{title}</span>
            {subtitle && <span className="ml-2 text-[#999999] text-sm">{subtitle}</span>}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#999999]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#999999]" />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

interface TeamRowProps {
  team: HonorTeam;
  showRank?: boolean;
}

function TeamRow({ team, showRank = true }: TeamRowProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-[#fff8e6] text-[#d4af37]';
    if (rank === 2) return 'bg-[#f5f5f5] text-[#c0c0c0]';
    if (rank === 3) return 'bg-[#fff8e6] text-[#cd7f32]';
    return 'bg-[#fafafa] text-[#666666]';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fafafa] transition-colors">
      {showRank && (
        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${getRankStyle(team.rank)}`}>
          {getRankEmoji(team.rank)}
        </span>
      )}
      <div className="flex-1">
        <span className="text-[#1a1a1a] font-medium">{team.guild}</span>
        {team.server && (
          <span className="ml-2 text-[#999999] text-sm">— {team.server}</span>
        )}
      </div>
    </div>
  );
}

interface ChampionDisplayProps {
  label: string;
  guild: string;
  server?: string;
  accentColor: string;
}

function ChampionDisplay({ label, guild, server, accentColor }: ChampionDisplayProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-[#999999] w-12">{label}</span>
      <div className="flex-1">
        <span className="text-[#1a1a1a] font-semibold">{guild}</span>
        {server && <span className="ml-2 text-[#999999] text-sm">— {server}</span>}
      </div>
    </div>
  );
}

export default function HonorBoard() {
  const [activeTab, setActiveTab] = useState<TabType>('jianying');

  return (
    <section id="honor" className="py-12 bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">荣誉殿堂</h2>
          <p className="text-[#999999] text-sm">剑影杯 · 盼之杯历届榜单</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveTab('jianying')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
              activeTab === 'jianying'
                ? 'bg-[#d4af37] text-white'
                : 'bg-white text-[#666666] border border-[#e5e5e5] hover:border-[#d4af37]/50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="font-medium">剑影杯</span>
          </button>
          <button
            onClick={() => setActiveTab('panzhi')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
              activeTab === 'panzhi'
                ? 'bg-[#d4af37] text-white'
                : 'bg-white text-[#666666] border border-[#e5e5e5] hover:border-[#d4af37]/50'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span className="font-medium">盼之杯</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'jianying' && (
          <div className="space-y-3">
            {/* 剑影杯 S1 */}
            <CollapsibleSection
              title="剑影杯 S1"
              subtitle="2024.12"
              icon={<Crown className="w-5 h-5" />}
              accentColor="#d4af37"
              defaultExpanded
            >
              {/* 赛区冠军 */}
              <div className="mb-4 p-3 bg-[#fafafa] rounded-lg">
                <div className="text-xs text-[#999999] mb-2 font-medium">赛区冠军</div>
                <ChampionDisplay
                  label="曜日"
                  guild={jianyingS1.champion.曜日.guild}
                  server={jianyingS1.champion.曜日.server}
                  accentColor="#f4d03f"
                />
                <ChampionDisplay
                  label="月诸"
                  guild={jianyingS1.champion.月诸.guild}
                  server={jianyingS1.champion.月诸.server}
                  accentColor="#a8c8e8"
                />
              </div>

              {/* 月诸赛区八强 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-[#a8c8e8]" />
                  <span className="text-sm font-medium text-[#666666]">月诸赛区八强</span>
                </div>
                <div className="space-y-1">
                  {jianyingS1.top8.月诸.map(team => (
                    <TeamRow key={team.rank} team={team} />
                  ))}
                </div>
              </div>

              {/* 曜日赛区八强 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-[#f4d03f]" />
                  <span className="text-sm font-medium text-[#666666]">曜日赛区八强</span>
                </div>
                <div className="space-y-1">
                  {jianyingS1.top8.曜日.map(team => (
                    <TeamRow key={team.rank} team={team} />
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* 剑影杯 星辉邀请赛 */}
            <CollapsibleSection
              title="剑影杯 星辉邀请赛"
              subtitle="2025.3"
              icon={<Star className="w-5 h-5" />}
              accentColor="#d4af37"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#fff8e6]">
                  <span className="text-xl">🏆</span>
                  <div>
                    <span className="text-[#1a1a1a] font-semibold">{jianyingStar.champion.guild}</span>
                    {jianyingStar.champion.server && (
                      <span className="ml-2 text-[#999999] text-sm">— {jianyingStar.champion.server}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                  <span className="text-xl">🥈</span>
                  <div>
                    <span className="text-[#1a1a1a]">{jianyingStar.runnerUp.guild}</span>
                    {jianyingStar.runnerUp.server && (
                      <span className="ml-2 text-[#999999] text-sm">— {jianyingStar.runnerUp.server}</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-[#999999] mb-2 px-3">四强</div>
                  {jianyingStar.semiFinalists.map((team, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fafafa]">
                      <span className="text-[#999999] text-sm">{idx + 1}.</span>
                      <div>
                        <span className="text-[#666666]">{team.guild}</span>
                        {team.server && <span className="ml-2 text-[#999999] text-sm">— {team.server}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* 剑影杯 S2 */}
            <CollapsibleSection
              title="剑影杯 S2"
              subtitle="2025.5"
              icon={<Trophy className="w-5 h-5" />}
              accentColor="#d4af37"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#fff8e6]">
                  <span className="text-xl">🏆</span>
                  <div>
                    <span className="text-[#1a1a1a] font-semibold">{jianyingS2.champion.guild}</span>
                    <span className="ml-2 text-[#999999] text-sm">— {jianyingS2.champion.server}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                  <span className="text-xl">🥈</span>
                  <div>
                    <span className="text-[#1a1a1a]">{jianyingS2.runnerUp.guild}</span>
                    <span className="ml-2 text-[#999999] text-sm">— {jianyingS2.runnerUp.server}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-[#999999] mb-2 px-3">四强</div>
                  {jianyingS2.semiFinalists.map((team, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fafafa]">
                      <span className="text-[#999999] text-sm">{idx + 1}.</span>
                      <div>
                        <span className="text-[#666666]">{team.guild}</span>
                        <span className="ml-2 text-[#999999] text-sm">— {team.server}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* 剑影杯 S3 */}
            <CollapsibleSection
              title="剑影杯 S3"
              subtitle="2025.10"
              icon={<Trophy className="w-5 h-5" />}
              accentColor="#d4af37"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#fff8e6]">
                  <span className="text-xl">🏆</span>
                  <span className="text-[#1a1a1a] font-semibold">{jianyingS3.champion.guild}</span>
                </div>
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5f5f5]">
                  <span className="text-xl">🥈</span>
                  <div>
                    <span className="text-[#1a1a1a]">{jianyingS3.runnerUp.guild}</span>
                    {jianyingS3.runnerUp.server && (
                      <span className="ml-2 text-[#999999] text-sm">— {jianyingS3.runnerUp.server}</span>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-[#999999] mb-2 px-3">四强</div>
                  {jianyingS3.semiFinalists.map((team, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fafafa]">
                      <span className="text-[#999999] text-sm">{idx + 1}.</span>
                      <span className="text-[#666666]">{team.guild}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'panzhi' && (
          <div className="space-y-3">
            {/* 第三届盼之杯 */}
            <CollapsibleSection
              title="第三届盼之杯"
              subtitle="2025.10"
              icon={<Medal className="w-5 h-5" />}
              accentColor="#a855f7"
              defaultExpanded
            >
              <div className="space-y-1">
                {panzhiCup3.map(team => (
                  <TeamRow key={team.rank} team={team} />
                ))}
              </div>
            </CollapsibleSection>

            {/* 第二届盼之杯 */}
            <CollapsibleSection
              title="第二届盼之杯"
              subtitle="2025.5"
              icon={<Medal className="w-5 h-5" />}
              accentColor="#a855f7"
            >
              <div className="space-y-1">
                {panzhiCup2.map(team => (
                  <TeamRow key={team.rank} team={team} />
                ))}
              </div>
            </CollapsibleSection>

            {/* 第一届盼之杯 */}
            <CollapsibleSection
              title="第一届盼之杯"
              subtitle="2024"
              icon={<Medal className="w-5 h-5" />}
              accentColor="#a855f7"
            >
              <div className="space-y-1">
                {panzhiCup1.map(team => (
                  <TeamRow key={team.rank} team={team} />
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </section>
  );
}
