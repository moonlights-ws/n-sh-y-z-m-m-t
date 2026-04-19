import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 获取服务端 Supabase 客户端（使用 Service Role Key）
function getServerSupabase() {
  const url = process.env.COZE_SUPABASE_URL;
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, serviceKey);
}

// 强度评级接口 - POST /api/guilds/query-strength
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    
    const { guild1_name, guild1_server, guild2_name, guild2_server } = body;
    
    // 至少需要一个帮会名称
    if (!guild1_name || guild1_name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '请输入至少一个帮会名称'
      }, { status: 400 });
    }
    
    // 查询帮会信息
    const queryGuild = async (name: string, _server?: string) => {
      const { data } = await supabase
        .from('guilds')
        .select('*')
        .eq('name', name.trim())
        .eq('is_league_valid', 1)
        .maybeSingle();
      
      return data;
    };
    
    const guild1 = await queryGuild(guild1_name, guild1_server);
    
    // 如果输入了两个帮会，查询第二个
    let guild2 = null;
    if (guild2_name && guild2_name.trim().length > 0) {
      guild2 = await queryGuild(guild2_name, guild2_server);
    }
    
    // 处理第一个帮会
    if (!guild1) {
      return NextResponse.json({
        success: false,
        error: `帮会「${guild1_name}」不在查询范围内（仅支持甲一帮会及各赛事32强帮会）`
      }, { status: 400 });
    }
    
    // 查询第一个帮会的赛事记录
    const { data: events1 } = await supabase
      .from('guild_events')
      .select('*')
      .eq('guild_id', guild1.id)
      .order('create_time', { ascending: false });
    
    // 计算帮会1的强度
    const guild1Analysis = analyzeGuild(guild1, events1 || []);
    
    // 如果有第二个帮会，也计算其强度
    let guild2Analysis = null;
    if (guild2) {
      const { data: events2 } = await supabase
        .from('guild_events')
        .select('*')
        .eq('guild_id', guild2.id)
        .order('create_time', { ascending: false });
      
      guild2Analysis = analyzeGuild(guild2, events2 || []);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        guild1: {
          ...guild1,
          analysis: guild1Analysis
        },
        guild2: guild2 ? {
          ...guild2,
          analysis: guild2Analysis
        } : null
      }
    });
    
  } catch (err) {
    console.error('Query strength error:', err);
    return NextResponse.json({
      success: false,
      error: '查询失败，请稍后重试'
    }, { status: 500 });
  }
}

// 分析帮会强度
function analyzeGuild(guild: Record<string, unknown>, events: Record<string, unknown>[]) {
  // 检查是否是甲一
  const isJia1 = guild.league_rank === '甲1';
  
  // 检查诸神榜梯度
  const hasT0 = events.some(e => e.tier === 'T0');
  const hasT05 = events.some(e => e.tier === 'T0.5');
  const hasT1 = events.some(e => e.tier === 'T1');
  const hasXuanBang = events.some(e => e.tier === '玄榜');
  
  // 检查其他赛事32强
  const hasWanren = events.some(e => 
    (e.event_name === '万仞争锋' || e.event_name === '盼之杯' || e.event_name === '剑影杯') 
    && e.is_qualified === 1
  );
  
  // 计算强度分数和评级
  let score = 0;
  let level = '';
  let description = '';
  
  if (hasT0 || hasT05) {
    if (isJia1) {
      score = Math.floor(Math.random() * 6) + 95; // 95-100
      level = '顶尖';
      description = '诸神榜顶级梯队+甲一联赛冠军，实力顶尖';
    } else {
      score = 88 + Math.floor(Math.random() * 7); // 88-94
      level = '高端';
      description = '诸神榜顶级梯队，实力强劲';
    }
  } else if (hasT1) {
    if (isJia1) {
      score = 90 + Math.floor(Math.random() * 5); // 90-94
      level = '高端';
      description = '诸神榜T1梯队+甲一联赛，实力优秀';
    } else {
      score = 82 + Math.floor(Math.random() * 6); // 82-87
      level = '中高端';
      description = '诸神榜T1梯队，实力不容小觑';
    }
  } else if (hasXuanBang) {
    if (isJia1) {
      score = 85 + Math.floor(Math.random() * 5); // 85-89
      level = '中高端';
      description = '诸神榜玄榜+甲一联赛，实力可观';
    } else {
      score = 78 + Math.floor(Math.random() * 7); // 78-84
      level = '中端';
      description = '诸神榜玄榜队伍';
    }
  } else if (hasWanren) {
    if (isJia1) {
      score = 80 + Math.floor(Math.random() * 5); // 80-84
      level = '中端';
      description = '万刃争锋/盼之杯/剑影杯32强+甲一联赛';
    } else {
      score = 72 + Math.floor(Math.random() * 8); // 72-79
      level = '中低端';
      description = '万刃争锋/盼之杯/剑影杯32强队伍';
    }
  } else if (isJia1) {
    score = 75 + Math.floor(Math.random() * 5); // 75-79
    level = '普通甲1';
    description = '甲一联赛队伍，暂无赛事32强记录';
  } else {
    score = 60 + Math.floor(Math.random() * 14); // 60-73
    level = '普通';
    description = '暂无赛事32强记录';
  }
  
  // 获取赛事记录摘要
  const eventSummary = events.slice(0, 5).map(e => ({
    event_name: e.event_name,
    event_season: e.event_season,
    rank: e.rank,
    tier: e.tier
  }));
  
  return {
    score,
    level,
    description,
    eventSummary,
    isJia1
  };
}
