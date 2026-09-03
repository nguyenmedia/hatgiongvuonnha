'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Phone, MapPin, Facebook, MessageCircle, CreditCard } from 'lucide-react';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/providers/ToastProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const { success, error } = useToast();
  const { updateSettings } = useSettings();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      // 1. Read LocalStorage settings
      try {
        const savedLocal = localStorage.getItem('site_settings');
        if (savedLocal) {
          setSettings(JSON.parse(savedLocal));
        }
      } catch (e) {}

      // 2. Fetch from Supabase
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'site_info')
            .maybeSingle();

          if (data && data.value) {
            setSettings(data.value);
            localStorage.setItem('site_settings', JSON.stringify(data.value));
          }
        } catch (e) {}
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (isSupabaseConfigured) {
      try {
        let saveErr: any = null;

        // Check existing row
        const { data: existing } = await supabase
          .from('settings')
          .select('id')
          .eq('key', 'site_info')
          .maybeSingle();

        if (existing) {
          const { error: updateErr } = await supabase
            .from('settings')
            .update({
              value: settings,
              updated_at: new Date().toISOString(),
            })
            .eq('key', 'site_info');
          saveErr = updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('settings')
            .insert({
              key: 'site_info',
              value: settings,
              description: 'Cài đặt hệ thống Hạt Giống Nhà Vườn',
            });
          saveErr = insertErr;
        }

        if (saveErr) {
          console.warn('[Supabase Settings Save Warning]:', saveErr.message);
          // Try upsert fallback
          await supabase
            .from('settings')
            .upsert({
              key: 'site_info',
              value: settings,
            });
        }
      } catch (e) {
        console.error('Settings save exception:', e);
      }
    }

    // Always update global settings provider & local storage
    updateSettings(settings);

    success('Đã lưu và đồng bộ cài đặt website thành công!');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
          Cài Đặt Hệ Thống & Thông Tin Website ⚙️
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cấu hình hotline, số Zalo, Fanpage Facebook, địa chỉ cửa hàng và số tài khoản ngân hàng
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Section 1: Brand & Contact Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
            <Phone className="w-4 h-4 text-forest-700" />
            <span>Thông Tin Thương Hiệu & Liên Hệ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên thương hiệu website</label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Khẩu hiệu (Tagline)</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại Hotline</label>
              <input
                type="text"
                name="hotline"
                value={settings.hotline}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-forest-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại Zalo</label>
              <input
                type="text"
                name="zalo"
                value={settings.zalo}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đường dẫn Fanpage Facebook</label>
              <input
                type="url"
                name="facebook_url"
                value={settings.facebook_url}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 text-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên hiển thị Facebook</label>
              <input
                type="text"
                name="facebook_name"
                value={settings.facebook_name}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Địa chỉ cửa hàng / nhà vườn</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-xl bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email liên hệ</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời gian phục vụ</label>
              <input
                type="text"
                name="working_hours"
                value={settings.working_hours}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank QR Info */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-forest-700" />
            <span>Tài Khoản Ngân Hàng Thanh Toán VietQR</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ngân hàng thụ hưởng</label>
              <input
                type="text"
                name="bank_name"
                value={settings.bank_name}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Số tài khoản</label>
              <input
                type="text"
                name="account_number"
                value={settings.account_number}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-forest-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên chủ tài khoản</label>
              <input
                type="text"
                name="account_holder"
                value={settings.account_holder}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold uppercase"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'LƯU TẤT CẢ CÀI ĐẶT'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
