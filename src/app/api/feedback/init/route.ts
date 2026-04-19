import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 获取服务端 Supabase 客户端
function getServerSupabase() {
  const url = process.env.COZE_SUPABASE_URL;
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, serviceKey);
}

// 初始化 suggestions 表
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    
    // 检查 suggestions 表是否存在
    const { error: checkError } = await supabase
      .from('suggestions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Suggestions table check error:', checkError);
      return NextResponse.json({
        success: false,
        error: 'suggestions 表未配置或无权限访问',
        details: checkError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'suggestions 表初始化成功'
    });
  } catch (err) {
    console.error('Init suggestions table error:', err);
    return NextResponse.json({
      success: false,
      error: '初始化失败',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
