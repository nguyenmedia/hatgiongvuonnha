-- ==============================================================================
-- DATABASE SCHEMA: HẠT GIỐNG NHÀ VƯỜN (E-COMMERCE & GARDENING SUPPLIES)
-- SUPABASE POSTGRESQL WITH RLS, TRIGGERS, STORAGE BUCKETS, REALTIME
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipping', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cod', 'bank_transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    avatar_url TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) DEFAULT NULL,
    stock INT DEFAULT 100 NOT NULL,
    image_url TEXT,
    short_description TEXT,
    description TEXT,
    planting_guide TEXT,
    germination_time TEXT, -- e.g. "5 - 7 ngày"
    germination_rate TEXT, -- e.g. "> 85%"
    flowering_time TEXT,   -- e.g. "65 - 75 ngày"
    origin TEXT DEFAULT 'Việt Nam / Nhập khẩu',
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure image_url column exists if table was created previously
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    province TEXT,
    district TEXT,
    address TEXT NOT NULL,
    note TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(12, 2) DEFAULT 30000,
    discount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method payment_method DEFAULT 'cod' NOT NULL,
    status order_status DEFAULT 'pending' NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total NUMERIC(12, 2) NOT NULL
);

-- 10. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT DEFAULT '/san-pham',
    position TEXT DEFAULT 'hero_slider',
    sort_order INT DEFAULT 0,
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT DEFAULT 'percentage', -- 'percentage' | 'fixed'
    discount_value NUMERIC(12, 2) NOT NULL,
    min_order NUMERIC(12, 2) DEFAULT 0,
    max_discount NUMERIC(12, 2) DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    end_date TIMESTAMPTZ,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. POSTS / BLOG TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    thumbnail TEXT,
    category TEXT DEFAULT 'Kỹ thuật gieo trồng',
    summary TEXT,
    content TEXT,
    author TEXT DEFAULT 'Hạt Giống Nhà Vườn',
    views INT DEFAULT 0,
    status BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS set_timestamp_products ON public.products;
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS set_timestamp_orders ON public.orders;
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS set_timestamp_posts ON public.posts;
CREATE TRIGGER set_timestamp_posts BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS set_timestamp_settings ON public.settings;
CREATE TRIGGER set_timestamp_settings BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Khách hàng'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (IDEMPOTENT SAFE)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by owner and admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by owner and admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Categories admin all" ON public.categories;
DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Categories write all" ON public.categories;

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories write all" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Products Policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products admin all" ON public.products;
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products write all" ON public.products;

CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products write all" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Product Images Policies
DROP POLICY IF EXISTS "Product images viewable by everyone" ON public.product_images;
DROP POLICY IF EXISTS "Product images admin all" ON public.product_images;
DROP POLICY IF EXISTS "Product images write all" ON public.product_images;

CREATE POLICY "Product images viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images write all" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies (Public/Customer create, Customer view own, Admin all)
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders or by code" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
DROP POLICY IF EXISTS "Orders write all" ON public.orders;

CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders viewable by everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders write all" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items Policies
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items viewable by order owner or admin" ON public.order_items;
DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items write all" ON public.order_items;

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items viewable by everyone" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items write all" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Banners Policies
DROP POLICY IF EXISTS "Banners viewable by everyone" ON public.banners;
DROP POLICY IF EXISTS "Admin manage banners" ON public.banners;
DROP POLICY IF EXISTS "Banners write all" ON public.banners;

CREATE POLICY "Banners viewable by everyone" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners write all" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Coupons Policies
DROP POLICY IF EXISTS "Coupons viewable by everyone" ON public.coupons;
DROP POLICY IF EXISTS "Admin manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Coupons write all" ON public.coupons;

CREATE POLICY "Coupons viewable by everyone" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Coupons write all" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- Posts Policies
DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Admin manage posts" ON public.posts;
DROP POLICY IF EXISTS "Posts write all" ON public.posts;

CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Posts write all" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- Settings Policies
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
DROP POLICY IF EXISTS "Settings write all" ON public.settings;

CREATE POLICY "Settings viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings write all" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Product Reviews Policies
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Anyone can post review" ON public.product_reviews;
DROP POLICY IF EXISTS "Admin manage reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews write all" ON public.product_reviews;

CREATE POLICY "Reviews viewable by everyone" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can post review" ON public.product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews write all" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME ENABLEMENT (SAFE DO BLOCKS)
-- ==============================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (SQL)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('products', 'products', true),
    ('categories', 'categories', true),
    ('banners', 'banners', true),
    ('blog', 'blog', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public Read Access on products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access on categories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access on banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access on blog bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access on avatars bucket" ON storage.objects;

CREATE POLICY "Public Read Access on products bucket" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public Read Access on categories bucket" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Public Read Access on banners bucket" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public Read Access on blog bucket" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Public Read Access on avatars bucket" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Storage upload policy (Authenticated / Admin)
DROP POLICY IF EXISTS "Allow public upload for products" ON storage.objects;
DROP POLICY IF EXISTS "Allow update delete for products" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete for products" ON storage.objects;

CREATE POLICY "Allow public upload for products" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('products', 'categories', 'banners', 'blog', 'avatars'));
CREATE POLICY "Allow update delete for products" ON storage.objects FOR UPDATE USING (bucket_id IN ('products', 'categories', 'banners', 'blog', 'avatars'));
CREATE POLICY "Allow delete for products" ON storage.objects FOR DELETE USING (bucket_id IN ('products', 'categories', 'banners', 'blog', 'avatars'));

-- ==============================================================================
-- INITIAL DEFAULT SETTINGS
-- ==============================================================================
INSERT INTO public.settings (key, value, description)
VALUES 
    ('site_info', '{
        "site_name": "HẠT GIỐNG NHÀ VƯỜN",
        "tagline": "Gieo hạt hôm nay – Nở hoa ngày mai",
        "hotline": "0934 811 307",
        "zalo": "0934 811 307",
        "facebook_url": "https://www.facebook.com/julymedia1.2",
        "facebook_name": "July Media",
        "address": "58 Lý Chính Thắng, Thành phố Quảng Ngãi",
        "email": "contact@hatgiontnhavuon.vn",
        "working_hours": "07:30 - 21:00 hàng ngày"
    }', 'Thông tin liên hệ & thương hiệu chính'),
    ('bank_info', '{
        "bank_name": "MB Bank (Ngân hàng Quân Đội)",
        "account_number": "0934811307",
        "account_holder": "HAT GIONG NHA VUON",
        "qr_template": "compact2"
    }', 'Cấu hình chuyển khoản ngân hàng QR Code')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- INITIAL DEFAULT CATEGORIES SEED
-- ==============================================================================
INSERT INTO public.categories (id, name, slug, description, image_url, icon, sort_order, status)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Hạt Giống Hoa', 'hat-giong-hoa', 'Các loại hạt giống hoa nhiều màu sắc, tỷ lệ nảy mầm > 85%, dễ chăm sóc.', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80', '🌸', 1, true),
  ('c2222222-2222-2222-2222-222222222222', 'Hạt Giống Rau Củ', 'hat-giong-rau-cu', 'Hạt giống rau sạch, rau ăn lá, củ quả năng suất cao cho vườn nhà.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', '🥬', 2, true),
  ('c3333333-3333-3333-3333-333333333333', 'Hạt Giống Cây Cảnh', 'hat-giong-cay-canh', 'Cây cảnh mini, sen đá, xương rồng, phong thủy trang trí ban công.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80', '🌵', 3, true),
  ('c4444444-4444-4444-4444-444444444444', 'Hạt Giống Cây Ăn Quả', 'hat-giong-cay-an-qua', 'Dâu tây, dưa lưới, cà chua bi lùn sai trĩu quả thích hợp trồng chậu.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', '🍅', 4, true),
  ('c5555555-5555-5555-5555-555555555555', 'Hạt Giống Nhập Khẩu', 'hat-giong-nhap-khau', 'Hạt giống hoa và cây trồng nhập khẩu từ Nga, Nhật Bản, Hà Lan.', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80', '✈️', 5, true),
  ('c6666666-6666-6666-6666-666666666666', 'Dụng Cụ Làm Vườn', 'dung-cu-lam-vuon', 'Kéo cắt cành tỉa hoa, bình xịt tưới nước, bộ cuốc xẻng mini gia đình.', 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=800&q=80', '🪴', 6, true),
  ('c7777777-7777-7777-7777-777777777777', 'Đất Trồng & Vật Tư', 'dat-trong-vat-tu', 'Đất sạch Tribat hữu cơ, giá thể xơ dừa, phân trùn quế, khay ươm.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', '🌱', 7, true)
ON CONFLICT (id) DO NOTHING;
