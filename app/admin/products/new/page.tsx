'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Upload, Sparkles, Plus, 
  Trash2, CheckCircle2, Image as ImageIcon,
  Bot, RefreshCw, Wand2, BookOpen, Layers
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Category } from '@/types/database.types';

function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export default function AddProductPage() {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    async function fetchCategories() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (data && data.length > 0) {
          setCategories(data);
          setFormData((prev) => ({
            ...prev,
            category_id: data[0].id,
          }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: INITIAL_CATEGORIES[0].id,
    price: 35000,
    sale_price: 25000,
    stock: 100,
    short_description: '',
    description: '',
    planting_guide: '1. Ngâm hạt trong nước ấm 4-6 tiếng.\n2. Gieo vào đất ẩm tơi xốp sâu 1cm.\n3. Tưới ẩm mỗi ngày bằng bình phun sương.',
    germination_time: '3 - 5 ngày',
    germination_rate: '> 85%',
    flowering_time: '50 - 60 ngày',
    origin: 'Nhật Bản F1',
    is_featured: true,
    is_best_seller: false,
    status: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'sales' | 'expert' | 'concise'>('sales');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: slugify(val),
    }));
  };

  // AI Description Generator Helper
  const generateAIDescription = (type: 'all' | 'short' | 'full' | 'guide', toneOverride?: 'sales' | 'expert' | 'concise') => {
    const tone = toneOverride || selectedTone;
    if (!formData.name.trim()) {
      error('Vui lòng nhập Tên sản phẩm hạt giống trước khi sử dụng AI!');
      return;
    }

    setIsGeneratingAI(true);
    info(`✨ AI Quản Trị đang soạn mô tả (${tone === 'sales' ? 'Hấp Dẫn' : tone === 'expert' ? 'Kỹ Thuật' : 'Ngắn Gọn'})...`);

    setTimeout(() => {
      const productName = formData.name.trim();
      const categoryObj = categories.find(c => c.id === formData.category_id);
      const categoryName = categoryObj ? categoryObj.name : 'Hạt Giống';
      const origin = formData.origin || 'Nhật Bản F1';

      let generatedShort = '';
      let generatedFull = '';
      let generatedGuide = '';

      if (tone === 'sales') {
        generatedShort = `Giống ${productName} chuẩn ${origin}, tỷ lệ nảy mầm cao > 85%. Cây khỏe, nở hoa rực rỡ mang đến không gian xanh tuyệt đẹp cho ban công & sân vườn.`;
        generatedFull = `🌟 ${productName.toUpperCase()} - CHỦNG GIỐNG F1 CAO CẤP\n\n${productName} là loại giống được nhập khẩu thuần chủng từ ${origin}, nổi tiếng với sức sống dẻo dai, phát triển nhanh và khả năng kháng bệnh xuất sắc trong điều kiện khí hậu nhiệt đới.\n\nĐẶC ĐIỂM NỔI BẬT:\n- Tỷ lệ nảy mầm đạt chuẩn trên 85%, nảy mầm cực nhanh sau 3-5 ngày gieo.\n- Thích hợp trồng trang trí ban công, sân thượng, chậu treo hoặc làm đẹp không gian sống.\n- Cây/Hoa phát triển cân đối, màu sắc tươi tắn, độ bền nở kéo dài nhiều tuần.\n\nSản phẩm được đóng gói nguyên bao bì chuyên dụng có chống ẩm, bảo quản mầm giống tối ưu.`;
        generatedGuide = `1. Ngâm hạt trong nước ấm (2 sôi 3 lạnh) từ 4-6 tiếng trước khi gieo.\n2. Chuẩn bị đất sạch Tribat hoặc xơ dừa tơi xốp giữ ẩm tốt.\n3. Gieo hạt sâu khoảng 0.5 - 1cm, phủ lớp đất mỏng nhẹ lên bề mặt.\n4. Tưới giữ ẩm hàng ngày bằng bình phun sương, đặt nơi có nắng dịu.`;
      } else if (tone === 'expert') {
        generatedShort = `Dòng giống ${productName} lai F1 thuần chủng ${origin}. Kháng nấm bệnh phytophthora, chu kỳ tăng trưởng ổn định, chịu nhiệt vượt trội.`;
        generatedFull = `🔬 BẢO CÁO THÔNG SỐ KỸ THUẬT BOTANICAL - ${productName.toUpperCase()}\n\n- Nguồn gốc gieo trồng: ${origin}\n- Tỷ lệ nảy mầm sinh học: > 85%\n- Thời gian sinh trưởng bung mầm: 3 - 5 ngày (Nhiệt độ tối ưu 22 - 28°C)\n- Độ pH đất phù hợp: 6.0 - 6.8 (Đất phù sa/thịt nhẹ thoát nước)\n\nĐẶC TÍNH SINH HỌC & NĂNG SUẤT:\nThân rễ chùm khỏe, khả năng phân nhánh cao, ít bị biến dạng mầm. Kháng bệnh nấm lá và chịu hạn khá. Thích hợp cho cả mô hình trồng chậu gia đình và nhà lưới chuyên nghiệp.`;
        generatedGuide = `1. Xử lý hạt: Ngâm nước ấm 40°C trong 4 tiếng để kích hoạt mầm.\n2. Chuẩn bị giá thể: Phối trộn 50% đất thịt + 30% xơ dừa + 20% phân trùn quế.\n3. Gieo hạt: Tra hạt mật độ 5-10cm/hạt, độ sâu tra 0.8cm.\n4. Chăm sóc: Duy trì độ ẩm đất 70-75%, bón thúc phân hữu cơ sau 15 ngày gieo.`;
      } else {
        generatedShort = `${productName} F1 - Nảy mầm nhanh >85%, cây khỏe dễ chăm, trồng chậu cực đẹp.`;
        generatedFull = `${productName} chất lượng cao F1. Cây dễ gieo trồng, ít sâu bệnh, hoa/trái đẹp, phù hợp phố và nông thôn. Đóng gói bảo quản kỹ càng.`;
        generatedGuide = `1. Ngâm hạt ấm 4h.\n2. Gieo đất ẩm sâu 1cm.\n3. Tưới phun sương 2 lần/ngày.`;
      }

      setFormData((prev) => ({
        ...prev,
        short_description: type === 'short' || type === 'all' ? generatedShort : prev.short_description,
        description: type === 'full' || type === 'all' ? generatedFull : prev.description,
        planting_guide: type === 'guide' || type === 'all' ? generatedGuide : prev.planting_guide,
        germination_time: '3 - 5 ngày',
        germination_rate: '> 85%',
        flowering_time: categoryName.includes('Hoa') ? '50 - 60 ngày' : '35 - 45 ngày',
      }));

      setIsGeneratingAI(false);
      success(`✨ AI đã tạo nội dung mô tả thành công cho "${productName}"!`);
    }, 1000);
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      info('Đã thêm ảnh vào danh sách ảnh sản phẩm!');
    }
  };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    let finalImageUrl = '';

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('products')
          .upload(filePath, file, { upsert: true });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          finalImageUrl = publicUrlData.publicUrl;
        } else {
          console.warn('[Supabase Storage upload warning]:', uploadErr.message);
        }
      } catch (err) {
        console.error('Storage upload exception:', err);
      }
    }

    if (!finalImageUrl) {
      try {
        finalImageUrl = await fileToBase64(file);
      } catch (err) {
        console.error('Base64 conversion failed:', err);
      }
    }

    if (finalImageUrl) {
      setImages((prev) => [finalImageUrl, ...prev.filter(img => img !== finalImageUrl)]);
      success('Tải ảnh sản phẩm lên thành công!');
    } else {
      error('Có lỗi xảy ra khi đọc file ảnh.');
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Vui lòng nhập tên sản phẩm.');
      return;
    }

    setIsSubmitting(true);

    const isMatchedCategory = categories.some((c) => c.id === formData.category_id);
    const safeCategoryId = isMatchedCategory && isValidUUID(formData.category_id)
      ? formData.category_id
      : (categories.find(c => isValidUUID(c.id))?.id || null);

    const newProduct = {
      name: formData.name,
      slug: formData.slug || slugify(formData.name),
      category_id: safeCategoryId,
      price: Number(formData.price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock: Number(formData.stock),
      image_url: images[0] || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80',
      short_description: formData.short_description,
      description: formData.description,
      planting_guide: formData.planting_guide,
      germination_time: formData.germination_time,
      germination_rate: formData.germination_rate,
      flowering_time: formData.flowering_time,
      origin: formData.origin,
      is_featured: formData.is_featured,
      is_best_seller: formData.is_best_seller,
      status: formData.status,
    };

    if (isSupabaseConfigured) {
      try {
        let { error: insertErr } = await supabase
          .from('products')
          .insert(newProduct);

        if (insertErr && (insertErr.code === '23503' || insertErr.message?.includes('foreign key'))) {
          console.warn('[FK violation fallback]: Retrying insert with category_id: null');
          const fallbackProduct = { ...newProduct, category_id: null };
          const { error: retryErr } = await supabase
            .from('products')
            .insert(fallbackProduct);
          insertErr = retryErr;
        }

        if (insertErr) {
          console.error('[Supabase Insert Error]:', insertErr);
          error('Lỗi khi lưu sản phẩm vào Supabase: ' + insertErr.message);
        } else {
          success('Đã thêm sản phẩm mới thành công vào Supabase!');
          router.push('/admin/products');
        }
      } catch (err) {
        error('Đã xảy ra lỗi khi tạo sản phẩm.');
      }
    } else {
      success('Thêm sản phẩm thành công! (Chế độ Mock Data)');
      router.push('/admin/products');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-forest-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách sản phẩm</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tích hợp AI Content Generator Pro</span>
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="mb-8 pb-4 border-b">
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
            <span>Thêm Sản Phẩm Hạt Giống Mới 🌱</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Điền thông tin hạt giống hoặc sử dụng Trợ Lý AI để tự động tạo mô tả chuẩn seo mua hàng
          </p>
        </div>

        {/* AI TOOLBAR BANNER */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white border border-emerald-700/60 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>TRỢ LÝ AI VIẾT MÔ TẢ TỰ ĐỘNG</span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Nhập Tên Sản Phẩm và bấm nút bên dưới để AI tự viết Mô tả ngắn, Mô tả chi tiết &amp; Hướng dẫn gieo trồng
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value as any)}
                className="text-xs p-2 rounded-xl bg-forest-900 text-emerald-200 border border-emerald-600/60 font-bold focus:outline-none"
              >
                <option value="sales">🔥 Giọng Hấp Dẫn Bán Hàng</option>
                <option value="expert">🔬 Giọng Chuyên Gia Kỹ Thuật</option>
                <option value="concise">⚡ Giọng Ngắn Gọn Súc Tích</option>
              </select>

              <button
                type="button"
                onClick={() => generateAIDescription('all')}
                disabled={isGeneratingAI}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-600 hover:to-forest-700 text-white rounded-xl font-extrabold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Soạn...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>AI VIẾT TẤT CẢ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b">
              1. Thông Tin Cơ Bản
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên sản phẩm hạt giống <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hạt Giống Hoa Cúc Huân Chương F1"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Đường dẫn tĩnh (Slug URL)
                </label>
                <input
                  type="text"
                  required
                  placeholder="hat-giong-hoa-cuc-huan-chuong"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Danh mục hạt giống <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || '🌱'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Giá gốc (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Giá khuyến mãi (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sale_price: Number(e.target.value) }))}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Số lượng tồn kho (gói)
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Xuất xứ hạt giống
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
                  placeholder="Ví dụ: Nhật Bản F1, Hà Lan, Việt Nam..."
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Mô tả ngắn gọn (hiển thị ngoài thẻ sản phẩm)
                </label>
                <button
                  type="button"
                  onClick={() => generateAIDescription('short')}
                  disabled={isGeneratingAI}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>AI Tạo Mô Tả Ngắn</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.short_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
                placeholder="Ví dụ: Cây lùn 35-40cm, bông to rực rỡ, thích hợp trồng chậu..."
                className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Mô tả chi tiết sản phẩm (Đặc tính, ứng dụng, bao bì)
                </label>
                <button
                  type="button"
                  onClick={() => generateAIDescription('full')}
                  disabled={isGeneratingAI}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Wand2 className="w-3 h-3 text-amber-500" />
                  <span>AI Viết Mô Tả Chi Tiết</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả chi tiết hoặc bấm AI Viết Mô Tả..."
                className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Planting Specs */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b">
              2. Thông Số Nảy Mầm &amp; Kỹ Thuật Gieo Trồng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Thời gian nảy mầm
                </label>
                <input
                  type="text"
                  value={formData.germination_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, germination_time: e.target.value }))}
                  placeholder="Ví dụ: 3 - 5 ngày"
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tỷ lệ nảy mầm
                </label>
                <input
                  type="text"
                  value={formData.germination_rate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, germination_rate: e.target.value }))}
                  placeholder="Ví dụ: > 90%"
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Thời gian ra hoa / thu hoạch
                </label>
                <input
                  type="text"
                  value={formData.flowering_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, flowering_time: e.target.value }))}
                  placeholder="Ví dụ: 50 - 60 ngày"
                  className="w-full text-xs p-3 border rounded-xl bg-slate-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Hướng dẫn gieo trồng từng bước
                </label>
                <button
                  type="button"
                  onClick={() => generateAIDescription('guide')}
                  disabled={isGeneratingAI}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  <span>AI Viết Hướng Dẫn</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={formData.planting_guide}
                onChange={(e) => setFormData((prev) => ({ ...prev, planting_guide: e.target.value }))}
                placeholder="Nhập các bước ngâm hạt, chuẩn bị đất, tưới ẩm..."
                className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          {/* Section 3: Supabase Image Upload */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b">
              3. Hình Ảnh Sản Phẩm (Supabase Storage)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-forest-600 transition bg-slate-50/50">
                <Upload className="w-8 h-8 text-forest-700 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  {isUploading ? 'Đang upload lên Supabase Storage...' : 'Chọn ảnh từ máy tính'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, WebP</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-3 text-xs"
                />
              </div>

              {/* URL Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Hoặc dán URL ảnh trực tiếp</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 text-xs p-2.5 border rounded-xl bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-2">Ảnh đã thêm ({images.length})</span>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl border overflow-hidden group">
                      <img src={img} alt={`preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t flex justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-forest-800 hover:from-emerald-700 hover:to-forest-900 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu vào Supabase...' : 'LƯU SẢN PHẨM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
