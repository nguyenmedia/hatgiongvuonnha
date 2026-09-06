import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, ArrowRight, Sparkles, ChevronRight, BookOpen, Home, Sprout } from 'lucide-react';
import { INITIAL_POSTS } from '@/lib/constants';

export default function BlogListPage() {
  return (
    <div className="bg-[#f8faf7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-extrabold text-forest-900">Cẩm nang gieo trồng nhà vườn</span>
        </nav>

        {/* Page Header Banner */}
        <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white p-8 sm:p-12 rounded-3xl mb-10 shadow-xl relative overflow-hidden border border-forest-800">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-black mb-3 border border-emerald-500/30 backdrop-blur-md">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kiến Thức Nông Nghiệp &amp; Kinh Nghiệm Gieo Trồng</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif mt-2 text-white">
              Cẩm Nang Trồng Hoa &amp; Rau Sạch 🌱
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed">
              Tổng hợp kỹ thuật ươm mầm, mẹo chăm sóc hoa ban công nở quanh năm, công thức trộn đất và xử lý sâu bệnh hữu cơ từ chuyên gia.
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {INITIAL_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-emerald-950/8 overflow-hidden shadow-2xs hover:shadow-hover transition-all duration-300 flex flex-col group hover:-translate-y-1.5"
            >
              <div className="aspect-[16/10] relative overflow-hidden bg-forest-50">
                <img
                  src={post.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-forest-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-400/30">
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-forest-700" />
                      {post.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <Eye className="w-3.5 h-3.5 text-forest-700" />
                      {post.views} lượt xem
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-forest-700 transition leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-black text-forest-800 group-hover:text-forest-950 inline-flex items-center gap-1.5 transition"
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

