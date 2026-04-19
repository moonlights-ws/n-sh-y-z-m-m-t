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

// 提交留言建议 - POST /api/feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    
    const { content, userId } = body;
    
    // 验证内容 - 不能为空
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '留言内容不能为空'
      }, { status: 400 });
    }
    
    const trimmedContent = content.trim();
    
    // 验证字数 - 最少5字
    if (trimmedContent.length < 5) {
      return NextResponse.json({
        success: false,
        error: '至少需要5个字符'
      }, { status: 400 });
    }
    
    // 验证字数 - 最多500字
    if (trimmedContent.length > 500) {
      return NextResponse.json({
        success: false,
        error: '不能超过500字'
      }, { status: 400 });
    }
    
    // 插入到 public.suggestions 表
    // user_id: 登录用户有值，游客模式下留空（null）
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        content: trimmedContent,
        user_id: userId || null,
        // created_at 由数据库自动填充
      })
      .select('id, created_at')
      .single();
    
    if (error) {
      console.error('Insert suggestion error:', error);
      
      // 根据错误类型返回友好提示
      let errorMessage = '网络错误，请重试';
      
      if (error.code === '23505') {
        errorMessage = '请勿重复提交';
      } else if (error.code === '42501') {
        errorMessage = '权限不足，请联系管理员';
      } else if (error.code === '42P01') {
        errorMessage = '数据表不存在，请联系管理员';
      } else if (error.message?.includes('connection') || error.message?.includes('timeout')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 500 });
    }
    
    // 成功响应
    return NextResponse.json({
      success: true,
      message: '留言提交成功！',
      data: {
        id: data.id,
        created_at: data.created_at
      }
    });
    
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({
      success: false,
      error: '网络错误，请重试'
    }, { status: 500 });
  }
}

// 获取用户留言记录 - GET /api/feedback?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID参数'
      }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('suggestions')
      .select('id, content, created_at, reply')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Get suggestions error:', error);
      return NextResponse.json({
        success: false,
        error: '获取留言记录失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
    
  } catch (err) {
    console.error('Feedback GET error:', err);
    return NextResponse.json({
      success: false,
      error: '获取留言记录失败'
    }, { status: 500 });
  }
}
