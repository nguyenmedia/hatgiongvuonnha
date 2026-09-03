import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, ArrowRight, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { INITIAL_POSTS } from '@/lib/constants';

export default function BlogListPage() {
  return (
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900">Cẩm nang làm vườn</span>
        </nav>

        {/* Page Header Banner */}
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-900 text-white p-8 sm:p-12 rounded-3xl mb-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-forest-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              🌱 Kiến Thức & Kinh Nghiệm Nhà Vườn
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif mt-3">
              Cẩm Nang Trồng Hoa & Rau Sạch
            </h1>
            <p className="text-xs sm:text-sm text-forest-100/90 mt-2 leading-relaxed">
              Tổng hợp kỹ thuật ươm mầm, mẹo chăm sóc hoa ban công, cách bón phân hữu cơ và xử lý sâu bệnh từ các kỹ sư nông nghiệp giàu kinh nghiệm.
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {INITIAL_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col group"
            >
              <div className="aspect-[16/10] relative overflow-hidden bg-forest-50">
                <img
                  src={post.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-forest-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-forest-600" />
                      {post.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-forest-600" />
                      {post.views} lượt xem
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-forest-700 transition leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-bold text-forest-700 group-hover:text-forest-900 inline-flex items-center gap-1"
                  >
                    <span>Đọc toàn bộ bài viết</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
