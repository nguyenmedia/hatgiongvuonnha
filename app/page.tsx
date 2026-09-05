'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ArrowRight, ShieldCheck, Flame, 
  ChevronRight, Star, Leaf, Award, Heart, CheckCircle2,
  Calendar, Eye, Search, Truck, Clock, RefreshCw, ThumbsUp,
  Percent, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_POSTS, DEFAULT_SETTINGS } from '@/lib/constants';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Category } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRealtime } from '@/components/providers/RealtimeProvider';

export default function HomePage() {
  const router = useRouter();
  const { lastUpdated } = useRealtime();
  const [activeTab, setActiveTab] = useState<'all' | 'hoa' | 'rau' | 'qua' | 'vat-tu'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    async function loadData() {
      let deletedIds: string[] = [];
      let localSavedCats: Category[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
        const storedCats = localStorage.getItem('custom_categories');
        if (storedCats) localSavedCats = JSON.parse(storedCats);
      } catch (e) {}

      let supabaseProds: Product[] = [];
      let supabaseCats: Category[] = [];

      if (isSupabaseConfigured) {
        try {
          const [prodRes, catRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').eq('status', true).order('sort_order', { ascending: true })
          ]);

          if (catRes.data && catRes.data.length > 0) supabaseCats = catRes.data;
          if (prodRes.data && prodRes.data.length > 0) supabaseProds = prodRes.data;
        } catch (err) {
          console.error('Error fetching home data:', err);
        }
      }

      // Sync Categories: Prioritize Supabase, then localStorage, merged with INITIAL_CATEGORIES
      const activeCustomCats = supabaseCats.length > 0 ? supabaseCats : localSavedCats;
      if (activeCustomCats.length > 0) {
        const customMap = new Map(activeCustomCats.map((c) => [c.id, c]));
        const customSlugMap = new Map(activeCustomCats.map((c) => [c.slug, c]));

        const mergedCats = [
          ...activeCustomCats,
          ...INITIAL_CATEGORIES.filter((c) => !customMap.has(c.id) && !customSlugMap.has(c.slug))
        ];
        setCategories(mergedCats);
      } else {
        setCategories(INITIAL_CATEGORIES);
      }

      const fetchedMap = new Map(supabaseProds.map((p) => [p.id, p]));
      const combined = [
        ...supabaseProds,
        ...INITIAL_PRODUCTS.filter((p) => !fetchedMap.has(p.id))
      ].filter((p) => !deletedIds.includes(p.id));

      setProducts(combined);
    }
    loadData();
  }, [lastUpdated]);

  // Countdown timer for Flash Sale (24h timer)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const bestSellers = products.filter((p) => p.is_best_seller);
  const flowerProducts = products.filter(
    (p) => p.category_id === 'c1111111-1111-1111-1111-111111111111' || p.category_id === 'c1'
  );

  const filteredProducts = activeTab === 'all'
    ? products
    : activeTab === 'hoa'
    ? products.filter((p) => p.category_id === 'c1111111-1111-1111-1111-111111111111' || p.category_id === 'c1')
    : activeTab === 'rau'
    ? products.filter((p) => p.category_id === 'c2222222-2222-2222-2222-222222222222' || p.category_id === 'c2')
    : activeTab === 'qua'
    ? products.filter((p) => p.category_id === 'c4444444-4444-4444-4444-444444444444' || p.category_id === 'c4')
    : products.filter((p) => 
        p.category_id === 'c7777777-7777-7777-7777-777777777777' || 
        p.category_id === 'c6666666-6666-6666-6666-666666666666' || 
        p.category_id === 'c7' || 
        p.category_id === 'c6'
      );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      
      {/* 1. HERO BANNER V3 - ULTRA-PRO BOTANICAL SHOWCASE */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-forest-900 via-forest-950 to-[#031c0e] text-white pt-12 pb-24 lg:pt-16 lg:pb-32">
        {/* Background Glowing Ambient Lighting */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Top Pill Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold backdrop-blur-md shadow-xl">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>🌱 THƯƠNG HIỆU HẠT GIỐNG NHÀ VƯỜN CHUẨN F1</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-[1.15] text-white">
                Gieo Hạt Hôm Nay <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-300">
                  Rực Rỡ Hoa Ngày Mai
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Chuyên cung cấp hơn <strong className="text-amber-300 font-bold">500+ loại hạt giống hoa</strong> nhập khẩu, rau củ organic sạch và vật tư làm vườn cao cấp. Cam kết tỷ lệ nảy mầm đạt chuẩn <strong className="text-emerald-300 font-bold">&gt; 85%</strong>.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto lg:mx-0 pt-1">
                <div className="relative flex items-center bg-forest-950/80 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-2 shadow-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/30 transition">
                  <Search className="w-5 h-5 text-emerald-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm hoa hướng dương, dạ yến thảo, cà chua bi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-emerald-200/50 text-xs sm:text-sm px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-600 hover:to-forest-700 text-white font-extrabold text-xs shrink-0 shadow-lg transition"
                  >
                    Tìm Hạt Giống
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/san-pham"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-forest-600 to-emerald-700 hover:from-emerald-600 hover:to-forest-800 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transform hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 tracking-wide"
                >
                  <span>MUA HẠT GIỐNG NGAY</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/danh-muc/hat-giong-hoa"
                  className="px-7 py-3.5 rounded-2xl bg-emerald-950/60 hover:bg-forest-900/80 text-emerald-200 border border-emerald-500/40 font-extrabold text-xs sm:text-sm backdrop-blur-md transition duration-200 flex items-center gap-2"
                >
                  <span>Hạt Giống Hoa F1</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </Link>
              </div>

              {/* Key Highlights Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="bg-forest-900/40 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-serif">500+</div>
                  <div className="text-[11px] text-emerald-200 font-medium">Hạt giống thuần F1</div>
                </div>
                <div className="bg-forest-900/40 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-serif">&gt; 85%</div>
                  <div className="text-[11px] text-emerald-200 font-medium">Tỷ lệ nảy mầm</div>
                </div>
                <div className="bg-forest-900/40 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-300 font-serif">100k+</div>
                  <div className="text-[11px] text-emerald-200 font-medium">Khách hàng tin chọn</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Dual Showcase */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              
              {/* Main HD Flower Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600/40 group bg-forest-950">
                <img
                  src="/images/hero_flower_garden.jpg"
                  alt="Vườn Hoa Hướng Dương & Dạ Yến Thảo"
                  className="w-full h-[380px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/20 to-transparent"></div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 bg-forest-950/90 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-bold text-xs shadow-xl border border-emerald-400/40 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Đánh giá 4.9/5★ (1,200+ khách mua)</span>
                </div>

                {/* Bottom Floating Glass Card */}
                <div className="absolute bottom-4 left-4 right-4 text-white p-4 rounded-2xl bg-forest-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-emerald-400" /> HOT Nhất Tháng
                      </div>
                      <div className="text-base font-bold font-serif text-white mt-0.5">
                        Hoa Hướng Dương Lùn F1
                      </div>
                      <div className="text-[11px] text-emerald-200">Bông to vàng rực • Ra hoa sau 50 ngày</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-base font-extrabold text-amber-400">25.000 ₫</div>
                      <Link
                        href="/san-pham/hat-giong-hoa-huong-duong-lun-f1"
                        className="text-[11px] px-3 py-1 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-600 hover:to-forest-700 text-white rounded-lg font-bold mt-1 inline-block shadow transition"
                      >
                        Mua ngay
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Overlap Sub-Card (Vegetable Seedlings) */}
              <div className="hidden sm:flex items-center gap-3 absolute -bottom-6 -left-6 bg-white text-gray-900 p-3 rounded-2xl shadow-2xl border-2 border-emerald-400 z-30 max-w-xs transform hover:scale-105 transition duration-300">
                <img
                  src="/images/hero_vegetable_garden.jpg"
                  alt="Cà chua bi lùn"
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 uppercase">
                    <TrendingUp className="w-3 h-3 text-emerald-600" /> Rau Organic
                  </div>
                  <div className="text-xs font-bold text-gray-900 line-clamp-1">Cà Chua Bi Lùn Siêu Trái</div>
                  <div className="text-xs font-extrabold text-forest-700 mt-0.5">28.000 ₫</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BAR (4 GLASSMorphism CARDS) */}
      <section className="-mt-8 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-forest-950/5 flex items-center gap-3.5 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0 border border-forest-100">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Giao Hàng Siêu Tốc</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Miễn phí ship đơn từ 300k</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-forest-950/5 flex items-center gap-3.5 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Hạt Giống Thuần F1</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Tỷ lệ mầm đạt &gt; 85%</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-forest-950/5 flex items-center gap-3.5 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Bảo Hành Nảy Mầm</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Đổi trả 1-1 nếu lỗi giống</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-forest-950/5 flex items-center gap-3.5 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Hỗ Trợ Kỹ Thuật</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Tư vấn gieo trồng 24/7</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES BENTO GRID */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-widest bg-forest-100/70 px-3.5 py-1 rounded-full border border-forest-200">
              Bộ Sưu Tập Sản Phẩm
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-forest-950 font-serif mt-3">
              Khu Vườn Nhà Bạn Cần Gì Hôm Nay? 🌱
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Khám phá các chủng loại hạt giống chất lượng cao và dụng cụ chuyên dùng cho vườn ban công & sân vườn
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="group p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-forest-500 hover:shadow-premium transition-all duration-300 text-center flex flex-col items-center justify-between"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-hover:scale-105 transition-transform duration-300 relative shadow-2xs">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xl mb-1">{cat.icon || '🌱'}</div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-forest-700 transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 hidden sm:block">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-forest-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  <span>Khám phá</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FLASH SALE HOT DEALS WITH COUNTDOWN */}
      <section className="py-14 bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
                <span>Ưu Đãi Giờ Vàng Đặt Hàng Hôm Nay</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                ⚡ Flash Sale Giảm Giá 20% - 30%
              </h2>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300">Kết thúc sau:</span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold">
                <span className="bg-amber-400 text-forest-950 px-2.5 py-1.5 rounded-lg shadow-sm">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-amber-400">:</span>
                <span className="bg-amber-400 text-forest-950 px-2.5 py-1.5 rounded-lg shadow-sm">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-amber-400">:</span>
                <span className="bg-amber-400 text-forest-950 px-2.5 py-1.5 rounded-lg shadow-sm">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. FLOWER COLLECTION BANNER HIGHLIGHT */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-900 text-white p-8 sm:p-12 mb-10 shadow-2xl relative overflow-hidden border border-forest-700">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1000&q=80"
                alt="Flower Garden Background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-forest-950/80 px-3.5 py-1 rounded-full border border-emerald-500/30">
                🌸 Thiên Đường Hoa Ban Công & Sân Vườn
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-serif mt-3 text-white">
                Bộ Sưu Tập Hạt Giống Hoa Kháng Bệnh Chuẩn F1
              </h2>
              <p className="text-xs sm:text-sm text-forest-100/90 mt-2 leading-relaxed">
                Tuyển chọn những giống hoa dễ gieo trồng, nở hoa quanh năm rực rỡ màu sắc: Hướng Dương Lùn, Dạ Yến Thảo Rủ, Hoa Hồng Leo Pháp, Cúc Bách Nhật...
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/danh-muc/hat-giong-hoa"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition"
                >
                  <span>Khám phá các giống hoa</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {flowerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 6. DYNAMIC PRODUCTS WITH TAB SWITCHER */}
      <section className="py-16 bg-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-forest-950 font-serif">
              Tất Cả Sản Phẩm Nhà Vườn
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Lựa chọn sản phẩm theo nhóm hạt giống phù hợp nhu cầu của bạn
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-forest-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'
                }`}
              >
                Tất cả ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('hoa')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'hoa'
                    ? 'bg-forest-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'
                }`}
              >
                🌸 Hạt giống hoa
              </button>
              <button
                onClick={() => setActiveTab('rau')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'rau'
                    ? 'bg-forest-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'
                }`}
              >
                🥬 Hạt giống rau
              </button>
              <button
                onClick={() => setActiveTab('qua')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'qua'
                    ? 'bg-forest-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'
                }`}
              >
                🍅 Cây ăn trái
              </button>
              <button
                onClick={() => setActiveTab('vat-tu')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'vat-tu'
                    ? 'bg-forest-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'
                }`}
              >
                🌱 Đất & Dụng cụ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xl transition transform hover:-translate-y-0.5"
            >
              <span>Xem Tất Cả Sản Phẩm ({products.length}+)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 7. BLOG & GARDENING GUIDES */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-forest-700 uppercase tracking-widest bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200">
                Kinh Nghiệm Nhà Vườn
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-forest-950 font-serif mt-2">
                Cẩm Nang Gieo Trồng & Chăm Sóc 🌱
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_POSTS.map((post) => (
              <article
                key={post.id}
                className="group rounded-3xl bg-slate-50 border border-slate-200/80 overflow-hidden hover:shadow-premium transition duration-300 flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                  <img
                    src={post.thumbnail || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-forest-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full border border-forest-700">
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
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-forest-700 transition leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/80">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-forest-700 group-hover:text-forest-900 inline-flex items-center gap-1"
                    >
                      <span>Đọc bài viết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS & HARVEST SHOWCASE */}
      <section className="py-16 bg-forest-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-forest-900 px-3.5 py-1 rounded-full border border-forest-800">
              Đánh Giá Thực Tế
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif mt-3 text-white">
              Hình Ảnh Vườn Hoa & Cây Trồng Từ Khách Hàng 🌸
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-forest-900/80 border border-forest-800 backdrop-blur-md">
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
                "Hạt giống hướng dương lùn nảy mầm siêu nhanh, sau 4 ngày là bung mầm gần như 100%. Giờ hoa nở vàng rực cả ban công nhà mình, đẹp mê ly!"
              </p>
              <div className="mt-5 pt-4 border-t border-forest-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  TH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Chị Thu Hằng</h4>
                  <p className="text-[11px] text-emerald-300">Quận 7, TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-forest-900/80 border border-forest-800 backdrop-blur-md">
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
                "Dạ yến thảo rủ đủ sắc màu, đóng gói hạt cẩn thận có túi chống ẩm và tờ hướng dẫn gieo hạt rất chi tiết. Shop tư vấn Zalo cực kỳ nhiệt tình!"
              </p>
              <div className="mt-5 pt-4 border-t border-forest-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  ML
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Anh Mai Linh</h4>
                  <p className="text-[11px] text-emerald-300">Đà Nẵng</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-forest-900/80 border border-forest-800 backdrop-blur-md">
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
                "Cà chua bi và rau xà lách lên xanh mướt. Nhà có con nhỏ nên tự trồng rau sạch ăn rất an tâm. Sẽ tiếp tục ủng hộ Hạt Giống Nhà Vườn dài dài!"
              </p>
              <div className="mt-5 pt-4 border-t border-forest-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  NV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bác Nguyễn Văn Hải</h4>
                  <p className="text-[11px] text-emerald-300">Hà Nội</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
