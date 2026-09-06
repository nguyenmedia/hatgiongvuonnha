'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight, Leaf, ShieldCheck, Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          error('Email hoặc mật khẩu không chính xác.');
        } else {
          success('Đăng nhập thành công! Chào mừng bạn trở lại 🌱');
          router.push('/tai-khoan');
        }
      } catch {
        error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else {
      // Demo mode — each email = unique account stored in localStorage
      setTimeout(() => {
        const accounts: Record<string, any> = JSON.parse(
          localStorage.getItem('registered_accounts') || '{}'
        );
        const acc = accounts[email.toLowerCase()];
        if (!acc) {
          error('Tài khoản không tồn tại. Vui lòng đăng ký trước.');
          setIsLoading(false);
          return;
        }
        if (acc.password !== password) {
          error('Mật khẩu không đúng.');
          setIsLoading(false);
          return;
        }
        const sessionUser = { email: acc.email, name: acc.fullName, phone: acc.phone };
        sessionStorage.setItem('mock_user', JSON.stringify(sessionUser));
        localStorage.setItem('customer_user', JSON.stringify(sessionUser));
        success('Đăng nhập thành công! Chào mừng bạn trở lại 🌱');
        router.push('/tai-khoan');
      }, 500);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/tai-khoan` } });
      return;
    }
    const googleUser = { email: 'user.google@gmail.com', name: 'Khách Hàng Google', phone: '', provider: 'google' };
    sessionStorage.setItem('mock_user', JSON.stringify(googleUser));
    localStorage.setItem('customer_user', JSON.stringify(googleUser));
    success('Đăng nhập Google thành công!');
    router.push('/tai-khoan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F2] via-white to-[#FDF8EE] flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-[440px]">

        {/* Header brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#07552D] to-[#16A765] shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold text-[#063B20] font-serif tracking-tight">
                HẠT GIỐNG <span className="text-[#16A765]">NHÀ VƯỜN</span>
              </h1>
              <p className="text-[11px] text-[#718078] font-medium">Organic &amp; Garden Seeds</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(6,59,32,0.1)] border border-[#E3ECE6] overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-r from-[#07552D] to-[#0A8A45] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#F5B82E]" />
              <div>
                <h2 className="text-[17px] font-extrabold font-serif">Đăng Nhập Tài Khoản</h2>
                <p className="text-[11px] text-emerald-200 mt-0.5">Quản lý đơn hàng và ưu đãi thành viên</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-7 space-y-5">

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border-2 border-[#E3ECE6] bg-white hover:bg-[#F6FAF7] hover:border-[#A8CDB0] transition-all duration-200 group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-[13.5px] font-semibold text-slate-700 group-hover:text-[#07552D] transition-colors">
                Tiếp tục với Google
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E3ECE6]" />
              <span className="text-[11.5px] text-[#A0AFA5] font-medium px-1">hoặc đăng nhập bằng email</span>
              <div className="flex-1 h-px bg-[#E3ECE6]" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#374C3E] block">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-[#374C3E]">Mật khẩu</label>
                  <button type="button" className="text-[11.5px] text-[#08763B] font-semibold hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AFA5] hover:text-[#374C3E] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#07552D] hover:bg-[#08763B] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  <>
                    Đăng Nhập <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-[#EBF2EC] text-center">
              <p className="text-[12.5px] text-[#718078]">
                Chưa có tài khoản?{' '}
                <Link href="/tai-khoan/dang-ky" className="font-bold text-[#08763B] hover:text-[#063B20] hover:underline transition-colors">
                  Đăng ký ngay miễn phí
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 mt-6 text-[11px] text-[#718078]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#16A765]" />Bảo mật SSL</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />Ưu đãi thành viên</span>
          <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-[#16A765]" />100% Organic</span>
        </div>

      </div>
    </div>
  );
}
