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

// 提交帮会联赛数据 - POST /api/guilds/submit
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    
    const { name, server, division, group_name, league_rank, league_screenshot_url } = body;
    
    // 验证必填字段
    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '帮会名称不能为空'
      }, { status: 400 });
    }
    
    if (!league_screenshot_url || league_screenshot_url.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '联赛排名截图不能为空'
      }, { status: 400 });
    }
    
    const trimmedName = name.trim();
    
    // 检查帮会是否已存在
    const { data: existingGuild } = await supabase
      .from('guilds')
      .select('id, name, is_league_valid')
      .eq('name', trimmedName)
      .maybeSingle();
    
    if (existingGuild) {
      // 如果已存在但未审核，可以更新
      if (existingGuild.is_league_valid === 0) {
        const { data, error } = await supabase
          .from('guilds')
          .update({
            server: server || null,
            division: division || null,
            group_name: group_name || null,
            league_rank: league_rank || null,
            league_screenshot_url: league_screenshot_url,
            update_time: new Date().toISOString()
          })
          .eq('id', existingGuild.id)
          .select()
          .single();
        
        if (error) {
          console.error('Update guild error:', error);
          return NextResponse.json({
            success: false,
            error: '更新失败，请稍后重试'
          }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: '数据已更新，等待管理员审核',
          data: { id: data.id }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: '该帮会信息已审核通过，无需重复提交'
        }, { status: 400 });
      }
    }
    
    // 插入新记录，is_league_valid 默认为 0（未审核）
    const { data, error } = await supabase
      .from('guilds')
      .insert({
        name: trimmedName,
        server: server || null,
        division: division || null,
        group_name: group_name || null,
        league_rank: league_rank || null,
        league_screenshot_url: league_screenshot_url,
        is_league_valid: 0
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Insert guild error:', error);
      return NextResponse.json({
        success: false,
        error: '提交失败，请稍后重试'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '提交成功，等待管理员审核',
      data: { id: data.id }
    });
    
  } catch (err) {
    console.error('Guild submit error:', err);
    return NextResponse.json({
      success: false,
      error: '提交失败，请稍后重试'
    }, { status: 500 });
  }
}

// 获取帮会列表 - GET /api/guilds/submit
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const validOnly = searchParams.get('valid') === '1';
    
    let query = supabase
      .from('guilds')
      .select('*')
      .order('create_time', { ascending: false });
    
    if (validOnly) {
      query = query.eq('is_league_valid', 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get guilds error:', error);
      return NextResponse.json({
        success: false,
        error: '获取数据失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
    
  } catch (err) {
    console.error('Guilds GET error:', err);
    return NextResponse.json({
      success: false,
      error: '获取数据失败'
    }, { status: 500 });
  }
}
