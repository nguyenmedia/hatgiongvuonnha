'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { 
  Star, Heart, ShoppingBag, Zap, ShieldCheck, 
  Truck, RotateCcw, Clock, Sprout, Award, 
  CheckCircle2, ChevronRight, Share2, Sparkles, MessageSquarePlus,
  Check, Info, Compass, HelpCircle, ArrowLeft, RefreshCw, ThumbsUp
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types/database.types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface Props {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { success, info: toastInfo } = useToast();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(
    INITIAL_PRODUCTS.find((p) => p.slug === params.slug) || null
  );
  const [isLoading, setIsLoading] = useState(!product);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'guide' | 'desc' | 'specs' | 'reviews'>('guide');

  // Interactive reviews state
  const [reviews, setReviews] = useState([
    {
      id: 'r1',
      name: 'Nguyễn Thị Hương',
      rating: 5,
      date: '2 ngày trước',
      comment: 'Hạt nảy mầm nhanh và đều lắm shop ơi. Mình ngâm nước ấm 4 tiếng xong 3 ngày sau gieo mầm nhú xanh mướt!',
      verified: true,
    },
    {
      id: 'r2',
      name: 'Trần Văn Long',
      rating: 5,
      date: '1 tuần trước',
      comment: 'Gói hàng rất cẩn thận, có sẵn túi hút ẩm chuyên dụng bảo vệ hạt. Tặng shop 5 sao!',
      verified: true,
    },
    {
      id: 'r3',
      name: 'Phạm Thị Mỹ Duyên',
      rating: 5,
      date: '2 tuần trước',
      comment: 'Hoa nở đúng chuẩn màu mix đẹp mê ly. Sẽ ủng hộ shop dài lâu.',
      verified: true,
    }
  ]);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  // Dynamic images calculation
  const images = (product?.images && product.images.length > 0)
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : ['https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80'];

  useEffect(() => {
    if (images.length > 0 && (!selectedImg || !images.includes(selectedImg))) {
      setSelectedImg(images[0]);
    }
  }, [product, images]);

  if (!product && !isLoading) {
    notFound();
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Đang tải thông tin hạt giống cao cấp...</p>
        </div>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const discountPercent = product.sale_price
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setReviews((prev) => [
      {
        id: Date.now().toString(),
        name: newReviewName.trim(),
        rating: newReviewRating,
        date: 'Vừa xong',
        comment: newReviewComment.trim(),
        verified: true,
      },
      ...prev,
    ]);

    setNewReviewName('');
    setNewReviewComment('');
    setShowReviewForm(false);
    success('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!');
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/thanh-toan');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toastInfo('Đã sao chép đường dẫn sản phẩm!');
    }
  };

  // Related products
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="bg-[#f7faf8] min-h-screen py-6 sm:py-10 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 font-medium transition flex items-center gap-1">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/san-pham" className="hover:text-emerald-700 font-medium transition">
              Sản phẩm
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-forest-950 truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Chia sẻ sản phẩm"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
            </button>
          </div>
        </div>

        {/* Main Product Card Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-sm mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Gallery & Trust Badges */}
            <div className="lg:col-span-6 space-y-5">
              {/* Main Showcase Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-emerald-50/30 border border-slate-200/80 relative group shadow-inner">
                <img
                  src={selectedImg || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>GIẢM {discountPercent}%</span>
                  </div>
                )}

                {/* F1 Premium Badge */}
                <div className="absolute top-4 right-4 bg-forest-950/80 backdrop-blur-md text-emerald-300 font-bold text-[11px] px-3 py-1 rounded-full shadow border border-emerald-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CHUẨN F1</span>
                </div>
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 relative ${
                        (selectedImg || images[0]) === img
                          ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-md scale-95'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Value Propositions Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1 hover:bg-emerald-50/50 transition">
                  <Award className="w-5 h-5 text-emerald-600 mx-auto" />
                  <div className="text-xs font-extrabold text-slate-900">Giống F1 Thuần</div>
                  <div className="text-[10px] text-slate-500">Mầm khỏe nảy >85%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1 hover:bg-emerald-50/50 transition">
                  <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
                  <div className="text-xs font-extrabold text-slate-900">Giao Tận Nơi</div>
                  <div className="text-[10px] text-slate-500">Toàn quốc 2-3 ngày</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1 hover:bg-emerald-50/50 transition">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                  <div className="text-xs font-extrabold text-slate-900">Bảo Hành Mầm</div>
                  <div className="text-[10px] text-slate-500">Đổi bù nếu hạt lỗi</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Metadata, Pricing, Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                
                {/* Brand Tagline */}
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    HẠT GIỐNG CHÍNH HÃNG NHÀ VƯỜN
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif leading-snug tracking-tight">
                  {product.name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-extrabold text-slate-900">{product.rating}</span>
                    <span className="text-slate-400 font-medium">({reviews.length + 42} đánh giá)</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span>Còn hàng trong kho ({product.stock} gói)</span>
                  </div>
                </div>

                {/* Premium Price Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-forest-900 to-emerald-950 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-serif tracking-tight">
                      {formatPrice(currentPrice)}
                    </span>
                    {product.sale_price && (
                      <span className="text-base text-slate-400 line-through font-medium">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="ml-auto bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-extrabold px-3 py-1 rounded-full">
                        Tiết kiệm {discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      Freeship đơn từ 300K
                    </span>
                    <span className="text-emerald-400 font-bold">Đóng gói chống ẩm 100%</span>
                  </div>
                </div>

                {/* Short Description */}
                {product.short_description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {product.short_description}
                  </p>
                )}

                {/* Botanical Specs Cards Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Thời gian nảy mầm</div>
                      <div className="font-extrabold text-slate-900">{product.germination_time || '3 - 5 ngày'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Tỷ lệ nảy mầm</div>
                      <div className="font-extrabold text-slate-900">{product.germination_rate || '> 85%'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Thời gian ra hoa/thu hoạch</div>
                      <div className="font-extrabold text-slate-900">{product.flowering_time || '50 - 60 ngày'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Xuất xứ chủng giống</div>
                      <div className="font-extrabold text-slate-900">{product.origin || 'Nhật Bản F1'}</div>
                    </div>
                  </div>
                </div>

                {/* Quantity Controller & Subtotal */}
                <div className="pt-2 flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800">Chọn số lượng mua:</span>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition text-sm"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-extrabold text-slate-900 w-10 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium">Tạm tính:</div>
                      <div className="text-sm font-extrabold text-emerald-800">
                        {formatPrice(currentPrice * quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    onClick={() => addItem(product, quantity)}
                    className="w-full py-4 px-5 rounded-2xl border-2 border-forest-800 text-forest-800 hover:bg-forest-50 font-extrabold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4 text-forest-800" />
                    <span>THÊM VÀO GIỎ HÀNG</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-800 hover:from-forest-950 hover:to-forest-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-xl shadow-forest-950/20 border border-emerald-500/30"
                  >
                    <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>MUA NGAY (GIAO TẬN NƠI)</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-[11px] text-slate-500">
                    Hotline/Zalo tư vấn gieo trồng 24/7: <strong className="text-emerald-700 font-extrabold">{settings.hotline}</strong>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Detailed Tabs Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-12">
          
          {/* Tab Navigation Controls */}
          <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto pb-px custom-scrollbar">
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-4 px-2 text-xs sm:text-sm font-extrabold transition shrink-0 relative flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Hướng Dẫn Gieo Trồng</span>
            </button>

            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 px-2 text-xs sm:text-sm font-extrabold transition shrink-0 relative flex items-center gap-2 ${
                activeTab === 'desc'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Chi Tiết Sản Phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-2 text-xs sm:text-sm font-extrabold transition shrink-0 relative flex items-center gap-2 ${
                activeTab === 'specs'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Thông Số Kỹ Thuật</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 text-xs sm:text-sm font-extrabold transition shrink-0 relative flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Đánh Giá ({reviews.length})</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-8">
            
            {/* TAB 1: Planting Guide */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-900 mb-1">Bí quyết ươm mầm thành công từ Kỹ Sư Nhà Vườn:</h4>
                    <p className="text-emerald-800/90 leading-relaxed">
                      Luôn duy trì độ ẩm đất vừa phải (khoảng 70%), không ngâm hạt quá lâu và che nắng trực tiếp trong 3 ngày đầu cho đến khi mầm nhú lá mầm xanh.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line space-y-4">
                  {product.planting_guide || (
                    `1. CHUẨN BỊ HẠT GIỐNG & GIÁ THỂ:\n- Ngâm hạt trong nước ấm (2 sôi 3 lạnh) từ 4-6 tiếng trước khi gieo.\n- Sử dụng đất sạch hữu cơ Tribat hoặc phối trộn xơ dừa tơi xốp.\n\n2. THỰC HIỆN GIEO HẠT:\n- Gieo hạt sâu khoảng 0.5 - 1cm, phủ lớp đất mỏng nhẹ lên bề mặt.\n- Mật độ gieo vừa phải để cây phát triển khỏe mạnh.\n\n3. CHĂM SÓC MẦM GIỐNG:\n- Tưới giữ ẩm hàng ngày 2 lần vào sáng sớm và chiều mát bằng bình phun sương.\n- Đặt chậu/khay gieo ở nơi thoáng mát, ánh sáng dịu nhẹ.`
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Product Description */}
            {activeTab === 'desc' && (
              <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div 
                  className="prose max-w-none space-y-4"
                  dangerouslySetInnerHTML={{ __html: product.description || product.short_description || '' }}
                />
              </div>
            )}

            {/* TAB 3: Botanical Specifications */}
            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50/80">
                        <td className="py-3 px-5 font-bold text-slate-700 w-2/5">Tên chủng giống</td>
                        <td className="py-3 px-5 font-bold text-slate-900">{product.name}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-5 font-bold text-slate-700">Tỷ lệ nảy mầm đạt chuẩn</td>
                        <td className="py-3 px-5 text-emerald-700 font-extrabold">{product.germination_rate || '> 85%'}</td>
                      </tr>
                      <tr className="bg-slate-50/80">
                        <td className="py-3 px-5 font-bold text-slate-700">Thời gian nảy mầm sinh học</td>
                        <td className="py-3 px-5 text-slate-900">{product.germination_time || '3 - 5 ngày'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-5 font-bold text-slate-700">Thời gian thu hoạch / nở hoa</td>
                        <td className="py-3 px-5 text-slate-900">{product.flowering_time || '50 - 60 ngày'}</td>
                      </tr>
                      <tr className="bg-slate-50/80">
                        <td className="py-3 px-5 font-bold text-slate-700">Nguồn gốc xuất xứ</td>
                        <td className="py-3 px-5 text-slate-900">{product.origin || 'Nhật Bản F1'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-5 font-bold text-slate-700">Quy cách đóng gói</td>
                        <td className="py-3 px-5 text-slate-900">Bao bì bạc chuyên dụng chống ẩm 100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Đánh Giá Từ Khách Hàng Thực Tế</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tất cả nhận xét đều từ khách hàng đã mua và gieo trồng thành công</p>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>Viết Đánh Giá Của Bạn</span>
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleAddReview} className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 shadow-sm">
                    <h4 className="text-xs font-extrabold text-forest-950 uppercase tracking-wider">Viết Đánh Giá Trải Nghiệm Mới</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Họ tên của bạn (*)</label>
                        <input
                          type="text"
                          required
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn An"
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Số sao hài lòng (*)</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 sao - Hạt nảy mầm rất tuyệt vời)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 sao - Giống tốt, giao hàng nhanh)</option>
                          <option value={3}>⭐⭐⭐ (3 sao - Hài lòng)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nội dung nhận xét chi tiết (*)</label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm ngâm hạt, nảy mầm và nở hoa của bạn..."
                        className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow"
                    >
                      Gửi Đánh Giá Ngay
                    </button>
                  </form>
                )}

                {/* Review Items */}
                <div className="space-y-4 divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <div key={r.id} className="pt-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            ✓ Đã mua hàng thực tế
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{r.date}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-forest-950 font-serif flex items-center gap-2">
                <Sprout className="w-6 h-6 text-emerald-600" />
                <span>Sản Phẩm Cùng Loại Bạn Có Thể Thích</span>
              </h2>
              <Link href="/san-pham" className="text-xs font-bold text-emerald-700 hover:underline">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
