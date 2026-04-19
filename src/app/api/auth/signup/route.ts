import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 获取服务端 Supabase 客户端
function getServerSupabase() {
  const url = process.env.COZE_SUPABASE_URL;
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Signup API - Supabase URL:', url ? 'configured' : 'missing');
  console.log('Signup API - Service Key:', serviceKey ? 'configured' : 'missing');
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(url, serviceKey);
}

// 注册
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }
    
    // 密码强度验证
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      );
    }
    
    const supabase = getServerSupabase();
    
    // 使用 admin API 创建用户，email_confirm: true 自动激活账号
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自动确认邮箱，用户注册后可直接登录
    });
    
    if (error) {
      // 提供更友好的中文错误消息
      let errorMessage = error.message;
      if (error.message.includes('already been registered')) {
        errorMessage = '该邮箱已被注册，请直接登录或使用其他邮箱';
      } else if (error.message.includes('invalid format')) {
        errorMessage = '邮箱格式无效';
      }
      console.log('Signup failed:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    console.log('Signup success for user:', data.user?.email);
    
    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
