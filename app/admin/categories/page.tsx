'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Sparkles, X } from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { Category } from '@/types/database.types';
import { useToast } from '@/components/providers/ToastProvider';

export default function AdminCategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🌸');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      slug: slugify(name),
      icon: icon || '🌱',
      description: desc.trim(),
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80',
      sort_order: categories.length + 1,
      status: true,
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCat]);
    success(`Đã tạo danh mục "${name}" thành công!`);
    setShowModal(false);
    setName('');
    setDesc('');
    setImageUrl('');
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${catName}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      success(`Đã xóa danh mục "${catName}"`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Danh Mục Hạt Giống 📂
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân loại hạt giống hoa, rau củ quả và vật tư nhà vườn
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3.5">
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80'}
                alt={cat.name}
                className="w-16 h-16 rounded-2xl object-cover border bg-slate-50 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-lg">{cat.icon}</div>
                <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{cat.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{cat.description}</p>
                <div className="text-[10px] text-forest-700 font-mono mt-1">/{cat.slug}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                Hiển thị
              </span>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold p-1"
                title="Xóa danh mục"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">Thêm Danh Mục Mới</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên danh mục</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hạt Giống Thảo Mộc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Icon đại diện (Emoji)</label>
                <input
                  type="text"
                  placeholder="🌿, 🌺, 🌾..."
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Hình ảnh</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Mô tả danh mục..."
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
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
