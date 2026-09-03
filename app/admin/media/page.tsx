'use client';

import React, { useState } from 'react';
import { 
  Upload, Image as ImageIcon, Copy, Trash2, 
  ExternalLink, Check, Sparkles, Folder 
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminMediaPage() {
  const { success, error, info } = useToast();
  const [activeBucket, setActiveBucket] = useState<'products' | 'categories' | 'banners' | 'blog' | 'avatars'>('products');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sample initial media
  const [mediaList, setMediaList] = useState([
    {
      name: 'huong-duong-lun-f1.jpg',
      url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80',
      bucket: 'products',
      size: '240 KB',
      createdAt: '2 ngày trước'
    },
    {
      name: 'da-yen-thao-ru.jpg',
      url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
      bucket: 'products',
      size: '310 KB',
      createdAt: '3 ngày trước'
    },
    {
      name: 'hero-banner-hoa.jpg',
      url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1600&q=85',
      bucket: 'banners',
      size: '520 KB',
      createdAt: '1 tuần trước'
    },
    {
      name: 'blog-ngam-u-hat.jpg',
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
      bucket: 'blog',
      size: '180 KB',
      createdAt: '5 ngày trước'
    }
  ]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    success('Đã sao chép đường dẫn ảnh vào Clipboard!');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from(activeBucket)
          .upload(filePath, file);

        if (uploadErr) {
          error(uploadErr.message || 'Lỗi khi upload lên Supabase Storage.');
        } else {
          const { data } = supabase.storage.from(activeBucket).getPublicUrl(filePath);
          setMediaList((prev) => [
            {
              name: file.name,
              url: data.publicUrl,
              bucket: activeBucket,
              size: `${Math.round(file.size / 1024)} KB`,
              createdAt: 'Vừa xong',
            },
            ...prev,
          ]);
          success(`Upload ảnh lên bucket "${activeBucket}" thành công!`);
        }
      } catch (err) {
        error('Có lỗi xảy ra khi upload.');
      }
    } else {
      const tempUrl = URL.createObjectURL(file);
      setMediaList((prev) => [
        {
          name: file.name,
          url: tempUrl,
          bucket: activeBucket,
          size: `${Math.round(file.size / 1024)} KB`,
          createdAt: 'Vừa xong',
        },
        ...prev,
      ]);
      success('Đã thêm ảnh vào bộ nhớ tạm thời!');
    }

    setIsUploading(false);
  };

  const handleDelete = (url: string) => {
    if (confirm('Bạn có chắc muốn xóa tệp ảnh này khỏi kho lưu trữ?')) {
      setMediaList((prev) => prev.filter((m) => m.url !== url));
      info('Đã xóa tệp ảnh khỏi danh sách');
    }
  };

  const filteredMedia = mediaList.filter((m) => m.bucket === activeBucket);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Kho Ảnh Supabase Storage 🖼️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các bucket: products, categories, banners, blog, avatars
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Đang tải lên...' : `Tải ảnh lên [${activeBucket}]`}</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {/* Bucket Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-3 sm:gap-6 overflow-x-auto pb-px">
        {[
          { id: 'products', label: '🌱 Sản phẩm (products)' },
          { id: 'categories', label: '📂 Danh mục (categories)' },
          { id: 'banners', label: '🖼️ Banners (banners)' },
          { id: 'blog', label: '📝 Cẩm nang (blog)' },
          { id: 'avatars', label: '👤 Người dùng (avatars)' },
        ].map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBucket(b.id as any)}
            className={`pb-3 text-xs font-bold transition shrink-0 ${
              activeBucket === b.id
                ? 'text-forest-800 border-b-2 border-forest-800'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Bucket "{activeBucket}" chưa có ảnh nào</h3>
          <p className="text-xs text-slate-500 mt-1">Bấm nút "Tải ảnh lên" ở trên để upload tệp mới vào Supabase Storage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-3 space-y-2">
                <div className="text-xs font-bold text-slate-900 truncate" title={m.name}>
                  {m.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.size}</span>
                  <span>{m.createdAt}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopy(m.url)}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-forest-100 text-forest-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    {copiedUrl === m.url ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(m.url)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
