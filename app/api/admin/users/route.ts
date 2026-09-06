import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase/server';

export interface AdminUserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'customer';
  provider: 'email' | 'google' | 'demo';
  email_confirmed: boolean;
  avatar_url?: string;
  address?: string;
  created_at: string;
  last_sign_in_at?: string;
  orders_count: number;
  total_spent: number;
  last_order_date?: string;
  status: 'active' | 'blocked' | 'pending';
}

export async function GET() {
  try {
    let usersList: AdminUserData[] = [];
    let isSupabaseLive = false;

    if (isServerSupabaseConfigured) {
      try {
        // 1. Attempt to fetch Supabase Auth users via Admin API
        const { data: authData, error: authError } = await supabaseServer.auth.admin.listUsers();
        
        if (!authError && authData && authData.users) {
          isSupabaseLive = true;
          for (const u of authData.users) {
            const metadata = u.user_metadata || {};
            const provider = (u.app_metadata?.provider as any) || (u.app_metadata?.providers?.[0]) || 'email';

            usersList.push({
              id: u.id,
              email: u.email || '',
              full_name: metadata.full_name || metadata.name || u.email?.split('@')[0] || 'Người dùng Supabase',
              phone: metadata.phone || u.phone || '',
              role: metadata.role === 'admin' ? 'admin' : 'customer',
              provider: provider.includes('google') ? 'google' : 'email',
              email_confirmed: Boolean(u.email_confirmed_at),
              avatar_url: metadata.avatar_url || metadata.picture,
              address: metadata.address || '',
              created_at: u.created_at,
              last_sign_in_at: u.last_sign_in_at || u.created_at,
              orders_count: 0,
              total_spent: 0,
              status: u.banned_until ? 'blocked' : 'active',
            });
          }
        }
      } catch (err) {
        console.warn('[Admin Users API] auth.admin.listUsers warning:', err);
      }

      // 2. Fetch profiles table to supplement or create entries
      try {
        const { data: profiles, error: profileErr } = await supabaseServer
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!profileErr && profiles && profiles.length > 0) {
          isSupabaseLive = true;
          for (const p of profiles) {
            const existingIdx = usersList.findIndex(
              (u) => u.id === p.id || (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase())
            );

            if (existingIdx >= 0) {
              usersList[existingIdx] = {
                ...usersList[existingIdx],
                full_name: p.full_name || usersList[existingIdx].full_name,
                phone: p.phone || usersList[existingIdx].phone,
                role: p.role || usersList[existingIdx].role,
                address: p.address || usersList[existingIdx].address,
                avatar_url: p.avatar_url || usersList[existingIdx].avatar_url,
              };
            } else {
              usersList.push({
                id: p.id,
                email: p.email || '',
                full_name: p.full_name || 'Khách hàng',
                phone: p.phone || '',
                role: p.role === 'admin' ? 'admin' : 'customer',
                provider: 'email',
                email_confirmed: true,
                avatar_url: p.avatar_url,
                address: p.address,
                created_at: p.created_at || new Date().toISOString(),
                orders_count: 0,
                total_spent: 0,
                status: 'active',
              });
            }
          }
        }
      } catch (pErr) {
        console.warn('[Admin Users API] profiles table fetch warning:', pErr);
      }

      // 3. Aggregate Orders stats per user
      try {
        const { data: orders, error: ordersErr } = await supabaseServer
          .from('orders')
          .select('id, customer_name, email, phone, total, created_at, status');

        if (!ordersErr && orders && orders.length > 0) {
          orders.forEach((ord) => {
            if (ord.status === 'cancelled') return;
            const ordEmail = ord.email ? ord.email.toLowerCase().trim() : '';
            const ordPhone = ord.phone ? ord.phone.replace(/\s+/g, '') : '';

            // Find matching user by email or phone
            const userMatch = usersList.find((u) => {
              const uEmail = u.email ? u.email.toLowerCase().trim() : '';
              const uPhone = u.phone ? u.phone.replace(/\s+/g, '') : '';
              return (uEmail && ordEmail && uEmail === ordEmail) || (uPhone && ordPhone && uPhone === ordPhone);
            });

            if (userMatch) {
              userMatch.orders_count += 1;
              userMatch.total_spent += Number(ord.total) || 0;
              if (!userMatch.last_order_date || new Date(ord.created_at) > new Date(userMatch.last_order_date)) {
                userMatch.last_order_date = ord.created_at;
              }
            }
          });
        }
      } catch (oErr) {
        console.warn('[Admin Users API] orders aggregate warning:', oErr);
      }
    }

    return NextResponse.json({
      success: true,
      users: usersList,
      isSupabaseLive,
    });
  } catch (error: any) {
    console.error('[Admin Users API Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone, role, address } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
    }

    if (isServerSupabaseConfigured) {
      // 1. Create in Supabase Auth via Admin
      try {
        const { data: newUser, error: authErr } = await supabaseServer.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, phone, role: role || 'customer', address },
        });

        if (authErr) {
          return NextResponse.json({ success: false, error: authErr.message }, { status: 400 });
        }

        // 2. Also insert into public.profiles if table exists
        if (newUser && newUser.user) {
          try {
            await supabaseServer.from('profiles').upsert({
              id: newUser.user.id,
              email,
              full_name: full_name || email.split('@')[0],
              phone: phone || null,
              role: role || 'customer',
              address: address || null,
              updated_at: new Date().toISOString(),
            });
          } catch (pErr) {
            console.warn('[Admin Users POST] Upsert profile warning:', pErr);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Tạo tài khoản người dùng thành công trên Supabase! 🌱',
          user: newUser?.user,
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu thông tin người dùng (chế độ demo)',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, full_name, phone, role, status, address } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    if (isServerSupabaseConfigured) {
      // 1. Update Auth Admin
      try {
        const updateData: any = { user_metadata: {} };
        if (full_name !== undefined) updateData.user_metadata.full_name = full_name;
        if (phone !== undefined) updateData.user_metadata.phone = phone;
        if (role !== undefined) updateData.user_metadata.role = role;
        if (address !== undefined) updateData.user_metadata.address = address;
        if (status === 'blocked') {
          updateData.ban_duration = '876000h'; // 100 years
        } else if (status === 'active') {
          updateData.ban_duration = 'none';
        }

        await supabaseServer.auth.admin.updateUserById(id, updateData);
      } catch (err) {
        console.warn('[Admin Users PATCH] auth update warning:', err);
      }

      // 2. Update profiles table
      try {
        const profileUpdate: any = { updated_at: new Date().toISOString() };
        if (full_name !== undefined) profileUpdate.full_name = full_name;
        if (phone !== undefined) profileUpdate.phone = phone;
        if (role !== undefined) profileUpdate.role = role;
        if (address !== undefined) profileUpdate.address = address;

        await supabaseServer.from('profiles').update(profileUpdate).eq('id', id);
      } catch (pErr) {
        console.warn('[Admin Users PATCH] profile update warning:', pErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID người dùng cần xoá' }, { status: 400 });
    }

    if (isServerSupabaseConfigured) {
      try {
        await supabaseServer.auth.admin.deleteUser(id);
      } catch (err) {
        console.warn('[Admin Users DELETE] auth delete warning:', err);
      }

      try {
        await supabaseServer.from('profiles').delete().eq('id', id);
      } catch (pErr) {
        console.warn('[Admin Users DELETE] profiles delete warning:', pErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xoá tài khoản người dùng thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
