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

// 同时查询甲一帮会数据库和赛事数据库，返回所有记录
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    
    const { guild_name, server } = body;
    
    if (!guild_name || guild_name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '请输入帮会名称'
      }, { status: 400 });
    }
    
    const searchName = guild_name.trim();
    const results: Array<{type: string; displayText: string; guildData?: Record<string, unknown>; eventData?: Record<string, unknown>}> = [];
    
    // 1. 查询甲一帮会数据库
    let guildsData = null;
    if (!server || server.trim().length === 0) {
      const { data } = await supabase
        .from('guilds')
        .select('*')
        .eq('name', searchName)
        .eq('is_league_valid', 1)
        .maybeSingle();
      guildsData = data;
    } else {
      const { data } = await supabase
        .from('guilds')
        .select('*')
        .eq('name', searchName)
        .eq('server', server.trim())
        .eq('is_league_valid', 1)
        .maybeSingle();
      guildsData = data;
    }
    
    // 如果找到甲一帮会记录，添加到结果
    if (guildsData) {
      results.push({
        type: 'jia1',
        displayText: `${guildsData.name}（${guildsData.server}）- 甲1帮会`,
        guildData: guildsData
      });
    }
    
    // 2. 查询该帮会的所有赛事记录
    let eventsData: Record<string, unknown>[] = [];
    
    if (guildsData) {
      // 通过 guild_id 查询
      const { data: events } = await supabase
        .from('guild_events')
        .select('*')
        .eq('guild_id', guildsData.id)
        .order('create_time', { ascending: false });
      eventsData = events || [];
    } else {
      // 如果甲一数据库没有，直接在赛事表中按帮会名称搜索
      // 先找到所有匹配的帮会ID
      const { data: matchedGuilds } = await supabase
        .from('guilds')
        .select('id, name, server')
        .eq('name', searchName)
        .eq('is_league_valid', 1);
      
      if (matchedGuilds && matchedGuilds.length > 0) {
        const guildIds = matchedGuilds.map(g => g.id);
        const { data: events } = await supabase
          .from('guild_events')
          .select('*')
          .in('guild_id', guildIds)
          .order('create_time', { ascending: false });
        eventsData = events || [];
      } else {
        // 完全没有甲一记录，直接搜索赛事表中的帮会名
        const { data: directEvents } = await supabase
          .from('guild_events')
          .select('*')
          .ilike('event_name', `%${searchName}%`)
          .order('create_time', { ascending: false });
        eventsData = directEvents || [];
      }
    }
    
    // 添加所有赛事记录
    const addedEvents = new Set<string>();
    for (const event of eventsData) {
      const eventKey = `${event.event_name}-${event.event_season}-${event.rank}`;
      if (!addedEvents.has(eventKey)) {
        addedEvents.add(eventKey);
        
        // 获取关联的帮会信息
        let eventGuildData = null;
        if (event.guild_id) {
          const { data: guildInfo } = await supabase
            .from('guilds')
            .select('*')
            .eq('id', event.guild_id)
            .maybeSingle();
          eventGuildData = guildInfo;
        }
        
        const serverName = eventGuildData?.server || event.event_season || '';
        results.push({
          type: 'event',
          displayText: `${searchName}（${serverName}）- ${event.event_name} ${event.event_season} ${event.rank}`,
          guildData: eventGuildData,
          eventData: event
        });
      }
    }
    
    // 3. 如果没有任何结果
    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `未找到帮会「${searchName}」的相关记录`
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        results
      }
    });
    
  } catch (err) {
    console.error('Search guild error:', err);
    return NextResponse.json({
      success: false,
      error: '查询失败，请稍后重试'
    }, { status: 500 });
  }
}
