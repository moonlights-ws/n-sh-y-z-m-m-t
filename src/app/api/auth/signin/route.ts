import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 获取浏览器端 Supabase 客户端（用于登录）
function getBrowserSupabase() {
  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;
  
  console.log('Signin API - Supabase URL:', url ? 'configured' : 'missing');
  console.log('Signin API - Anon Key:', anonKey ? 'configured' : 'missing');
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

// 登录
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 邮箱格式基础验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式无效' },
        { status: 400 }
      );
    }
    
    const supabase = getBrowserSupabase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // 提供更友好的中文错误消息
      let errorMessage = error.message;
      if (error.message === 'Invalid login credentials') {
        errorMessage = '邮箱或密码错误，请检查后重试';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '邮箱尚未验证，请先查收验证邮件';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '邮箱格式无效';
      }
      console.log('Signin failed:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    console.log('Signin success for user:', data.user?.email);
    
    return NextResponse.json({
      success: true,
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    console.error('Signin error:', err);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
