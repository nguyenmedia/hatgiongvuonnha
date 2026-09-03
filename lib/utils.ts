import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateOrderCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = 'HG';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function isProductInCategory(productCatId: string | null | undefined, cat: { id: string; slug: string; name: string }): boolean {
  if (!productCatId || !cat) return false;
  
  const pCat = productCatId.toString().toLowerCase().trim();
  const cId = cat.id.toString().toLowerCase().trim();
  const cSlug = cat.slug.toString().toLowerCase().trim();
  const cName = cat.name.toString().toLowerCase().trim();

  // 1. Direct match with id or slug
  if (pCat === cId || pCat === cSlug) return true;

  // 2. Prefix match (e.g. 'c1' matches 'c1111111-1111-1111-1111-111111111111')
  if (cId.startsWith(pCat) || pCat.startsWith(cId)) return true;

  // 3. Known mappings between short IDs ('c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7') and category slugs/names
  if ((pCat === 'c1' || pCat.includes('hoa')) && (cSlug.includes('hoa') || cName.includes('hoa'))) return true;
  if ((pCat === 'c2' || pCat.includes('rau')) && (cSlug.includes('rau') || cName.includes('rau'))) return true;
  if ((pCat === 'c3' || pCat.includes('canh') || pCat.includes('bonsai')) && (cSlug.includes('canh') || cName.includes('cảnh'))) return true;
  if ((pCat === 'c4' || pCat.includes('qua')) && (cSlug.includes('qua') || cName.includes('quả'))) return true;
  if ((pCat === 'c5' || pCat.includes('nhap-khau')) && (cSlug.includes('nhap-khau') || cName.includes('nhập khẩu'))) return true;
  if ((pCat === 'c6' || pCat.includes('dung-cu')) && (cSlug.includes('dung-cu') || cName.includes('dụng cụ'))) return true;
  if ((pCat === 'c7' || pCat.includes('vat-tu') || pCat.includes('dat-trong')) && (cSlug.includes('vat-tu') || cSlug.includes('dat-trong') || cName.includes('đất'))) return true;

  return false;
}

export function getOrderStatusLabel(status: string): { label: string; color: string; bg: string; badgeClass: string } {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'confirmed':
      return { label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'shipping':
      return { label: 'Đang giao hàng', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'completed':
      return { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'cancelled':
      return { label: 'Đã hủy', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', badgeClass: 'bg-gray-50 text-gray-700 border-gray-200' };
  }
}
