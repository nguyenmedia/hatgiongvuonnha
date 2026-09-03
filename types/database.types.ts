export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank_transfer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon?: string | null;
  sort_order: number;
  status: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  short_description: string | null;
  description: string | null;
  planting_guide: string | null;
  germination_time: string | null;
  germination_rate: string | null;
  flowering_time: string | null;
  origin: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  rating: number;
  review_count: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
  images?: string[];
  image_url?: string | null;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  province?: string | null;
  district?: string | null;
  address: string;
  note?: string | null;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link?: string | null;
  position: string;
  sort_order: number;
  status: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number;
  max_discount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit: number;
  used_count: number;
  status: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  category: string;
  summary: string | null;
  content: string | null;
  author: string;
  views: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  hotline: string;
  zalo: string;
  facebook_url: string;
  facebook_name: string;
  address: string;
  email: string;
  working_hours: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
