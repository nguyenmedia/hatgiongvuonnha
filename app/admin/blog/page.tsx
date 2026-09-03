'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye } from 'lucide-react';
import { INITIAL_POSTS } from '@/lib/constants';
import { Post } from '@/types/database.types';
import { useToast } from '@/components/providers/ToastProvider';

export default function AdminBlogPage() {
  const { success } = useToast();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa bài viết "${title}"?`)) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      success(`Đã xóa bài viết "${title}"`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            Quản Lý Bài Viết Cẩm Nang Làm Vườn 📝
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chia sẻ kinh nghiệm ươm hạt, chăm sóc hoa và bí quyết nhà vườn
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Ảnh & Tiêu Đề Bài Viết</th>
                <th className="py-3.5 px-6">Chuyên Mục</th>
                <th className="py-3.5 px-6">Tác Giả</th>
                <th className="py-3.5 px-6">Lượt Xem</th>
                <th className="py-3.5 px-6">Trạng Thái</th>
                <th className="py-3.5 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'}
                        alt={p.title}
                        className="w-14 h-10 rounded-lg object-cover border shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                        <div className="text-[11px] text-slate-400">Slug: {p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-emerald-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">{p.author}</td>
                  <td className="py-3.5 px-6 font-bold">{p.views}</td>
                  <td className="py-3.5 px-6">
                    <span className="text-emerald-700 font-bold">● Đã xuất bản</span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-500 hover:text-forest-800 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
