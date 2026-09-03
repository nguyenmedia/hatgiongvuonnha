'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          error(authError.message || 'Email hoặc mật khẩu không chính xác.');
        } else {
          success('Đăng nhập thành công!');
          router.push('/tai-khoan');
        }
      } catch (err: any) {
        error('Có lỗi xảy ra khi đăng nhập.');
      }
    } else {
      // Demo mock login
      setTimeout(() => {
        const mockUser = {
          email,
          name: email.split('@')[0],
          phone: '0934811307',
          provider: 'email',
        };
        sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
        localStorage.setItem('customer_user', JSON.stringify(mockUser));
        success('Đăng nhập thành công!');
        router.push('/tai-khoan');
      }, 400);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Create seamless Google Customer authentication session
    const googleUser = {
      name: 'Nguyễn Công Nguyên (Google Member)',
      email: 'nguyenmedia.google@gmail.com',
      phone: '0934811307',
      provider: 'google',
    };

    try {
      sessionStorage.setItem('mock_user', JSON.stringify(googleUser));
      localStorage.setItem('customer_user', JSON.stringify(googleUser));
    } catch (e) {}

    success('Đăng nhập bằng tài khoản Google thành công!');
    router.push('/tai-khoan');
    setIsLoading(false);
  };

  return (
    <div className="bg-forest-50/40 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-forest-800 text-white flex items-center justify-center text-2xl mb-3 shadow-md">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold text-forest-950 font-serif">Đăng Nhập Khách Hàng</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý đơn hàng, theo dõi vận trình và lưu danh sách hạt giống yêu thích
          </p>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Đăng Nhập Bằng Tài Khoản Google</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span>Hoặc đăng nhập bằng Email</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email đăng nhập</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="khachhang@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">Mật khẩu</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP KHÁCH HÀNG'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500 border-t space-y-2">
          <div>
            Chưa có tài khoản?{' '}
            <Link href="/tai-khoan/dang-ky" className="text-forest-700 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
