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

// 初始化数据库表
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    
    // 检查 data 表是否存在
    const { error: checkError } = await supabase
      .from('data')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Data table check error:', checkError);
      return NextResponse.json({
        success: false,
        error: '数据表未配置或无权限访问',
        details: checkError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功'
    });
  } catch (err) {
    console.error('Init database error:', err);
    return NextResponse.json({
      success: false,
      error: '初始化失败',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 检查数据库状态
export async function GET() {
  try {
    const supabase = getServerSupabase();
    
    // 测试查询
    const { data, error } = await supabase
      .from('data')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database check error:', error);
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '数据库连接正常',
      tableExists: true
    });
  } catch (err) {
    console.error('Database check error:', err);
    return NextResponse.json({
      success: false,
      error: '检查失败',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
