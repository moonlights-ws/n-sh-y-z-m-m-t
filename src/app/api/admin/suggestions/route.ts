import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 管理员邮箱列表
const ADMIN_EMAILS = ['3185529795@qq.com'];

// 获取服务端 Supabase 客户端
function getServerSupabase() {
  const url = process.env.COZE_SUPABASE_URL;
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, serviceKey);
}

// 验证管理员权限
function verifyAdmin(request: NextRequest): boolean {
  // 从请求头获取邮箱
  const adminEmail = request.headers.get('x-admin-email');
  return Boolean(adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase()));
}

// 获取所有留言（管理员）
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    if (!verifyAdmin(request)) {
      return NextResponse.json({
        success: false,
        error: '无权限访问'
      }, { status: 403 });
    }
    
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch suggestions error:', error);
      return NextResponse.json({
        success: false,
        error: '获取留言失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
    
  } catch (err) {
    console.error('Admin suggestions error:', err);
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 });
  }
}

// 删除留言（管理员）
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    if (!verifyAdmin(request)) {
      return NextResponse.json({
        success: false,
        error: '无权限访问'
      }, { status: 403 });
    }
    
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少留言ID'
      }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) {
      console.error('Delete suggestion error:', error);
      return NextResponse.json({
        success: false,
        error: '删除失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
    
  } catch (err) {
    console.error('Admin delete error:', err);
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 });
  }
}

// 更新留言状态（标记已读/未读）（管理员）
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员权限
    if (!verifyAdmin(request)) {
      return NextResponse.json({
        success: false,
        error: '无权限访问'
      }, { status: 403 });
    }
    
    const supabase = getServerSupabase();
    const body = await request.json();
    const { id, is_read } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少留言ID'
      }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('suggestions')
      .update({ is_read })
      .eq('id', id);
    
    if (error) {
      console.error('Update suggestion error:', error);
      return NextResponse.json({
        success: false,
        error: '更新状态失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '更新成功'
    });
    
  } catch (err) {
    console.error('Admin update error:', err);
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 });
  }
}
