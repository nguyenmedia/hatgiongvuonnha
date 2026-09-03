'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, X, Check } from 'lucide-react';
import { INITIAL_BANNERS } from '@/lib/constants';
import { Banner } from '@/types/database.types';
import { useToast } from '@/components/providers/ToastProvider';

export default function AdminBannersPage() {
  const { success, info } = useToast();
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('/san-pham');

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const newBanner: Banner = {
      id: 'b-' + Date.now(),
      title,
      subtitle,
      image_url: imageUrl,
      link,
      position: 'hero_slider',
      sort_order: banners.length + 1,
      status: true,
      created_at: new Date().toISOString(),
    };

    setBanners((prev) => [...prev, newBanner]);
    success('Đã thêm banner thành công!');
    setShowModal(false);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa banner này?')) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      info('Đã xóa banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Banner Trang Chủ 🖼️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị banner quảng bá hạt giống hoa và khuyến mãi đầu trang
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Banner Mới</span>
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            <div className="w-full md:w-64 h-32 rounded-2xl overflow-hidden bg-slate-100 border shrink-0">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-xs">
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                Vị trí: {b.position}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
              <p className="text-slate-500 line-clamp-2">{b.subtitle}</p>
              <div className="text-forest-700 font-mono text-[11px]">Đường dẫn: {b.link}</div>
            </div>

            <button
              onClick={() => handleDelete(b.id)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
              title="Xóa banner"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Add Banner */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">Thêm Banner Mới</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề chính banner</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 🌸 HẠT GIỐNG HOA CHẤT LƯỢNG CAO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phụ đề / Khẩu hiệu</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="GIEO HẠT HÔM NAY - NỞ HOA NGÀY MAI..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Hình ảnh</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn khi click</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-forest-800 text-white font-bold"
                >
                  Thêm banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
