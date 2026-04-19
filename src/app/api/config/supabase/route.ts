import { NextResponse } from 'next/server';

// 获取 Supabase 配置
export async function GET() {
  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    return NextResponse.json({
      configured: false,
      url: null,
      anonKey: null,
    });
  }
  
  return NextResponse.json({
    configured: true,
    url,
    anonKey,
  });
}
