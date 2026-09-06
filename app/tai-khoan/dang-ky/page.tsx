'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, Eye, EyeOff, User, Phone, ArrowRight, Leaf,
  ShieldCheck, Sparkles, CheckCircle2,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { error('Mật khẩu xác nhận không khớp!'); return; }
    if (password.length < 6) { error('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (!agree) { error('Vui lòng đồng ý với điều khoản sử dụng.'); return; }
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (authError) {
          error(authError.message || 'Không thể tạo tài khoản.');
        } else {
          success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản 🌱');
          router.push('/tai-khoan/dang-nhap');
        }
      } catch {
        error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else {
      // Demo mode — store each account by email key in localStorage
      setTimeout(() => {
        const accounts: Record<string, any> = JSON.parse(
          localStorage.getItem('registered_accounts') || '{}'
        );
        if (accounts[email.toLowerCase()]) {
          error('Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.');
          setIsLoading(false);
          return;
        }
        accounts[email.toLowerCase()] = { email, fullName, phone, password, createdAt: new Date().toISOString() };
        localStorage.setItem('registered_accounts', JSON.stringify(accounts));
        const sessionUser = { email, name: fullName, phone };
        sessionStorage.setItem('mock_user', JSON.stringify(sessionUser));
        localStorage.setItem('customer_user', JSON.stringify(sessionUser));
        success('Đăng ký thành công! Chào mừng thành viên mới 🌱');
        router.push('/tai-khoan');
      }, 600);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/tai-khoan` } });
      return;
    }
    const googleUser = { email: 'user.google@gmail.com', name: 'Khách Hàng Google', phone: '' };
    sessionStorage.setItem('mock_user', JSON.stringify(googleUser));
    localStorage.setItem('customer_user', JSON.stringify(googleUser));
    success('Đăng nhập Google thành công!');
    router.push('/tai-khoan');
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F2] via-white to-[#FDF8EE] flex items-center justify-center p-4 py-12">
      <div className="fixed top-0 left-0 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-[480px]">

        {/* Brand header */}
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

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(6,59,32,0.1)] border border-[#E3ECE6] overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-r from-[#07552D] to-[#0A8A45] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#F5B82E]" />
              <div>
                <h2 className="text-[17px] font-extrabold font-serif">Đăng Ký Thành Viên</h2>
                <p className="text-[11px] text-emerald-200 mt-0.5">Nhận ưu đãi, tích điểm &amp; quản lý đơn hàng</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-7 space-y-5">

            {/* Google */}
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
                Đăng ký nhanh với Google
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E3ECE6]" />
              <span className="text-[11.5px] text-[#A0AFA5] font-medium px-1">hoặc điền thông tin đăng ký</span>
              <div className="flex-1 h-px bg-[#E3ECE6]" />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#374C3E] block">Họ và tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                  />
                </div>
              </div>

              {/* Email + Phone row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#374C3E] block">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A0AFA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-[13px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#374C3E] block">Số điện thoại <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A0AFA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="0934811307"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-[13px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#374C3E] block">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-[13.5px] border-2 border-[#E3ECE6] rounded-xl bg-[#F6FAF7] focus:bg-white focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)] outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5]"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AFA5] hover:text-[#374C3E] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${strength >= i ? strengthColor[strength] : 'bg-[#E3ECE6]'}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-semibold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#374C3E] block">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0AFA5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-[13.5px] border-2 rounded-xl bg-[#F6FAF7] focus:bg-white outline-none transition-all text-[#17231C] placeholder:text-[#B0BEB5] ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                        : 'border-[#E3ECE6] focus:border-[#16A765] focus:shadow-[0_0_0_3px_rgba(22,167,101,0.1)]'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AFA5] hover:text-[#374C3E] transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-9 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-red-500 font-medium">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Agree */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`relative w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all ${agree ? 'border-[#07552D] bg-[#07552D]' : 'border-[#D6EDDB] bg-white group-hover:border-[#A8CDB0]'}`}>
                  {agree && <CheckCircle2 className="w-4 h-4 text-white absolute top-0 left-0" />}
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                </div>
                <span className="text-[12px] text-[#718078] leading-relaxed">
                  Tôi đồng ý với{' '}
                  <span className="text-[#08763B] font-semibold hover:underline cursor-pointer">Điều khoản sử dụng</span>
                  {' '}và{' '}
                  <span className="text-[#08763B] font-semibold hover:underline cursor-pointer">Chính sách bảo mật</span>
                  {' '}của Hạt Giống Nhà Vườn.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#07552D] hover:bg-[#08763B] disabled:opacity-60 text-white text-[14px] font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  <>
                    Tạo Tài Khoản Miễn Phí <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#EBF2EC] text-center">
              <p className="text-[12.5px] text-[#718078]">
                Đã có tài khoản?{' '}
                <Link href="/tai-khoan/dang-nhap" className="font-bold text-[#08763B] hover:text-[#063B20] hover:underline transition-colors">
                  Đăng nhập ngay
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
