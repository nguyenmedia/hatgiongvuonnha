'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Sparkles, X, Upload, RefreshCw, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { Category } from '@/types/database.types';
import { useToast } from '@/components/providers/ToastProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRealtime } from '@/components/providers/RealtimeProvider';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

export default function AdminCategoriesPage() {
  const { success, error, info } = useToast();
  const { lastUpdated } = useRealtime();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('🌸');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [status, setStatus] = useState<boolean>(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories from Supabase
  const loadCategories = async () => {
    setIsLoading(true);
    let supabaseCats: Category[] = [];
    let localSaved: Category[] = [];

    try {
      const stored = localStorage.getItem('custom_categories');
      if (stored) {
        localSaved = JSON.parse(stored);
      }
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          supabaseCats = data;
        } else if (fetchErr) {
          console.warn('[Supabase Categories fetch error]:', fetchErr.message);
        }
      } catch (err) {
        console.error('Error fetching categories from Supabase:', err);
      }
    }

    if (supabaseCats.length > 0) {
      setCategories(supabaseCats);
    } else if (localSaved.length > 0) {
      setCategories(localSaved);
    } else {
      setCategories(INITIAL_CATEGORIES);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [lastUpdated]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('🌱');
    setDesc('');
    setImageUrl('');
    setSortOrder(categories.length + 1);
    setStatus(true);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || '🌱');
    setDesc(cat.description || '');
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order || 1);
    setStatus(cat.status !== false);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    let finalUrl = '';

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('categories')
          .upload(filePath, file, { upsert: true });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('categories')
            .getPublicUrl(filePath);
          finalUrl = publicUrlData.publicUrl;
        } else {
          console.warn('[Supabase Category Image Upload Warning]:', uploadErr.message);
        }
      } catch (err) {
        console.error('Storage upload exception:', err);
      }
    }

    if (!finalUrl) {
      try {
        finalUrl = await fileToBase64(file);
      } catch (err) {
        console.error('Base64 conversion failed:', err);
      }
    }

    if (finalUrl) {
      setImageUrl(finalUrl);
      success('Tải hình ảnh danh mục lên thành công!');
    } else {
      error('Có lỗi xảy ra khi đọc file ảnh.');
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Vui lòng nhập tên danh mục.');
      return;
    }

    setIsSubmitting(true);
    const catSlug = slug.trim() || slugify(name);
    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80';

    if (editingCategory) {
      // UPDATE
      const updatedCatData = {
        name: name.trim(),
        slug: catSlug,
        icon: icon.trim() || '🌱',
        description: desc.trim(),
        image_url: finalImage,
        sort_order: Number(sortOrder),
        status: status,
      };

      if (isSupabaseConfigured) {
        try {
          const { error: updateErr } = await supabase
            .from('categories')
            .update(updatedCatData)
            .eq('id', editingCategory.id);

          if (updateErr) {
            console.error('[Supabase Category Update Error]:', updateErr);
            error('Không thể cập nhật danh mục trên Supabase: ' + updateErr.message);
          } else {
            success(`Đã cập nhật danh mục "${name}" thành công!`);
          }
        } catch (err) {
          error('Đã xảy ra lỗi khi lưu danh mục.');
        }
      } else {
        success(`Đã cập nhật danh mục "${name}"!`);
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updatedCatData } : c))
      );
    } else {
      // INSERT
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: name.trim(),
        slug: catSlug,
        icon: icon.trim() || '🌱',
        description: desc.trim(),
        image_url: finalImage,
        sort_order: Number(sortOrder),
        status: status,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        try {
          const dbCatPayload = {
            name: newCat.name,
            slug: newCat.slug,
            icon: newCat.icon,
            description: newCat.description,
            image_url: newCat.image_url,
            sort_order: newCat.sort_order,
            status: newCat.status,
          };

          const { data: insertedData, error: insertErr } = await supabase
            .from('categories')
            .insert(dbCatPayload)
            .select()
            .single();

          if (insertErr) {
            console.error('[Supabase Category Insert Error]:', insertErr);
            error('Không thể tạo danh mục trên Supabase: ' + insertErr.message);
          } else {
            if (insertedData) newCat.id = insertedData.id;
            success(`Đã tạo danh mục mới "${name}" thành công!`);
          }
        } catch (err) {
          error('Đã xảy ra lỗi khi tạo danh mục.');
        }
      } else {
        success(`Đã tạo danh mục "${name}" thành công!`);
      }

      setCategories((prev) => [...prev, newCat]);
    }

    // Save fallback to local storage
    try {
      const remaining = categories.filter((c) => !editingCategory || c.id !== editingCategory.id);
      const updatedList = editingCategory
        ? [...remaining, { ...editingCategory, name: name.trim(), slug: catSlug, icon, description: desc, image_url: finalImage, sort_order: Number(sortOrder), status }]
        : [...categories, { id: 'cat-' + Date.now(), name: name.trim(), slug: catSlug, icon, description: desc, image_url: finalImage, sort_order: Number(sortOrder), status, created_at: new Date().toISOString() }];
      localStorage.setItem('custom_categories', JSON.stringify(updatedList));
    } catch (e) {}

    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) {
      if (isSupabaseConfigured) {
        try {
          const { error: delErr } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

          if (delErr) {
            console.error('[Supabase Category Delete Error]:', delErr);
            error('Lỗi khi xóa trên Supabase: ' + delErr.message);
          } else {
            success(`Đã xóa danh mục "${catName}" thành công!`);
          }
        } catch (err) {
          error('Lỗi khi thực hiện xóa danh mục.');
        }
      } else {
        success(`Đã xóa danh mục "${catName}"`);
      }

      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      try {
        localStorage.setItem('custom_categories', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
            <span>Quản Lý Danh Mục Hạt Giống 📁</span>
            {isSupabaseConfigured && (
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Supabase Sync
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân loại hạt giống hoa, rau củ quả, cây cảnh và vật tư nhà vườn (Đồng bộ mọi giao diện)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-forest-700" />
          <span>Đang tải danh mục từ Supabase...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Chưa có danh mục nào</h3>
          <p className="text-xs text-slate-400 mt-1">Bấm nút bên trên để tạo danh mục đầu tiên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition relative group"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80'}
                  alt={cat.name}
                  className="w-16 h-16 rounded-2xl object-cover border bg-slate-50 shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-lg">{cat.icon || '🌱'}</div>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{cat.description || 'Chưa có mô tả'}</p>
                  <div className="text-[10px] text-forest-700 font-mono mt-1 font-bold">/{cat.slug}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  {cat.status !== false ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Hiển thị
                    </span>
                  ) : (
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[10px] border border-slate-200 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Đang ẩn
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Thứ tự: {cat.sort_order || 0}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-forest-700 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition"
                    title="Chỉnh sửa danh mục"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-forest-800" />
                <h3 className="text-sm font-extrabold text-slate-900 font-serif">
                  {editingCategory ? `Chỉnh Sửa Danh Mục: ${editingCategory.name}` : 'Thêm Danh Mục Mới 🌱'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên danh mục <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hạt Giống Thảo Mộc"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    placeholder="🌸, 🥬, 🌵..."
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn tĩnh (Slug URL)</label>
                <input
                  type="text"
                  required
                  placeholder="hat-giong-thao-moc"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-mono text-forest-800"
                />
              </div>

              {/* IMAGE UPLOAD & URL SECTION (SUPABASE STORAGE) */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <label className="font-bold text-slate-800 block">Hình Ảnh Danh Mục (Supabase Storage)</label>

                {imageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border bg-white mb-2 group">
                    <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition shadow"
                      title="Xóa ảnh"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:border-forest-600 transition">
                    <Upload className="w-5 h-5 text-forest-700 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {isUploading ? 'Đang tải lên Supabase Storage...' : 'Tải ảnh từ máy tính'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="mt-1 text-[10px] w-full"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Hoặc nhập URL ảnh trực tiếp</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn danh mục</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt loại hạt giống..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={status ? 'true' : 'false'}
                    onChange={(e) => setStatus(e.target.value === 'true')}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="true">🟢 Hiển thị</option>
                    <option value="false">🔴 Ẩn danh mục</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-forest-800 hover:from-emerald-700 hover:to-forest-900 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu Supabase...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
