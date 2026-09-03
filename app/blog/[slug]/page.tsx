import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Eye, User, ChevronRight, ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import { INITIAL_POSTS } from '@/lib/constants';

interface Props {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return INITIAL_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostDetail({ params }: Props) {
  const post = INITIAL_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const otherPosts = INITIAL_POSTS.filter((p) => p.id !== post.id);

  return (
    <div className="bg-forest-50/30 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-forest-700 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/blog" className="hover:text-forest-700 transition">Cẩm nang làm vườn</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-forest-900 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-950 font-serif leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                <User className="w-4 h-4 text-forest-600" />
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-forest-600" />
                {post.views} lượt xem
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {post.thumbnail && (
            <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-forest-50 border">
              <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Summary Callout */}
          {post.summary && (
            <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-200 text-xs sm:text-sm text-forest-900 italic font-medium leading-relaxed">
              "{post.summary}"
            </div>
          )}

          {/* Content Body */}
          <div
            className="prose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Bottom Share & Navigation */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách cẩm nang</span>
            </Link>

            <Link
              href="/san-pham"
              className="px-5 py-2 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition shadow-sm"
            >
              Mua hạt giống gieo ngay →
            </Link>
          </div>
        </article>

        {/* Other articles */}
        {otherPosts.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold text-forest-950 font-serif">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherPosts.map((op) => (
                <Link
                  key={op.id}
                  href={`/blog/${op.slug}`}
                  className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-forest-50">
                    <img src={op.thumbnail || ''} alt={op.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-forest-700 truncate">
                      {op.title}
                    </h3>
                    <span className="text-[11px] text-forest-600 font-semibold mt-1 inline-block">Đọc bài →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
