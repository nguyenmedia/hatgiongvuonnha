'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCheck, ShieldCheck, UserX, Search, Filter, 
  Plus, RefreshCw, Download, Mail, Phone, Calendar, 
  ShoppingBag, DollarSign, MoreVertical, Edit3, Trash2, 
  Lock, Unlock, Eye, X, Check, CheckCircle2, AlertTriangle, 
  Globe, Sparkles, Shield, UserPlus, MapPin, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';
import { AdminUserData } from '@/app/api/admin/users/route';

// Seed demo users fallback if Supabase has 0 users initially
const DEMO_SEED_USERS: AdminUserData[] = [
  {
    id: 'usr-101',
    email: 'nguyen.van.an@gmail.com',
    full_name: 'Nguyễn Văn An',
    phone: '0905 123 456',
    role: 'admin',
    provider: 'email',
    email_confirmed: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    address: '58 Lý Chính Thắng, Phường 7, Quận 3, TP. Hồ Chí Minh',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    last_sign_in_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    orders_count: 5,
    total_spent: 890000,
    last_order_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'active',
  },
  {
    id: 'usr-102',
    email: 'le.thi.mai@gmail.com',
    full_name: 'Lê Thị Mai',
    phone: '0934 811 307',
    role: 'customer',
    provider: 'google',
    email_confirmed: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    address: '124 Phan Chu Trinh, Q. Hải Châu, Đà Nẵng',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    last_sign_in_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    orders_count: 3,
    total_spent: 450000,
    last_order_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: 'active',
  },
  {
    id: 'usr-103',
    email: 'tran.huu.nam@gmail.com',
    full_name: 'Trần Hữu Nam',
    phone: '0912 345 678',
    role: 'customer',
    provider: 'email',
    email_confirmed: true,
    address: '45 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    last_sign_in_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    orders_count: 8,
    total_spent: 1250000,
    last_order_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'active',
  },
  {
    id: 'usr-104',
    email: 'pham.quang.huy@yahoo.com',
    full_name: 'Phạm Quang Huy',
    phone: '0988 776 554',
    role: 'customer',
    provider: 'email',
    email_confirmed: false,
    address: '88 Nguyễn Huệ, TP. Quy Nhơn, Bình Định',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    last_sign_in_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    orders_count: 1,
    total_spent: 120000,
    last_order_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'active',
  },
  {
    id: 'usr-105',
    email: 'hoang.minh.khang@gmail.com',
    full_name: 'Hoàng Minh Khang',
    phone: '0971 223 344',
    role: 'customer',
    provider: 'google',
    email_confirmed: true,
    address: '12 Lê Lợi, TP. Huế, Thừa Thiên Huế',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    last_sign_in_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    orders_count: 0,
    total_spent: 0,
    status: 'active',
  }
];

export default function AdminUsersPage() {
  const { success, error, info } = useToast();
  
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer' as 'admin' | 'customer',
    address: '',
    status: 'active' as 'active' | 'blocked' | 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real users from API
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      let fetchedUsers: AdminUserData[] = [];
      let live = false;

      if (data.success && data.users && data.users.length > 0) {
        fetchedUsers = data.users;
        live = data.isSupabaseLive;
      }

      // 2. Also merge users stored in localStorage from demo registrations
      try {
        const localAccsObj = JSON.parse(localStorage.getItem('registered_accounts') || '{}');
        const localAccs = Object.values(localAccsObj) as any[];

        localAccs.forEach((acc: any) => {
          const exists = fetchedUsers.some(u => u.email.toLowerCase() === acc.email?.toLowerCase());
          if (!exists && acc.email) {
            fetchedUsers.push({
              id: `local-${acc.email}`,
              email: acc.email,
              full_name: acc.fullName || acc.name || 'Thành viên Demo',
              phone: acc.phone || '',
              role: 'customer',
              provider: acc.provider === 'google' ? 'google' : 'email',
              email_confirmed: true,
              address: acc.address || '',
              created_at: acc.createdAt || new Date().toISOString(),
              orders_count: 0,
              total_spent: 0,
              status: 'active',
            });
          }
        });
      } catch (e) {}

      // 3. Fallback to seed demo users if total count is 0
      if (fetchedUsers.length === 0) {
        fetchedUsers = DEMO_SEED_USERS;
      }

      setUsers(fetchedUsers);
      setIsSupabaseLive(live);
    } catch (err) {
      console.error('[Fetch Users Error]:', err);
      setUsers(DEMO_SEED_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const matchSearch = 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchRole = roleFilter === 'all' || u.role === roleFilter;

      // Provider filter
      const matchProvider = providerFilter === 'all' || u.provider === providerFilter;

      // Status filter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchProvider && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'spent') return b.total_spent - a.total_spent;
      if (sortBy === 'orders') return b.orders_count - a.orders_count;
      return 0;
    });
  }, [users, searchTerm, roleFilter, providerFilter, statusFilter, sortBy]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const googleUsers = users.filter((u) => u.provider === 'google').length;
    const confirmedUsers = users.filter((u) => u.email_confirmed).length;
    const totalSpent = users.reduce((acc, u) => acc + (u.total_spent || 0), 0);
    const adminsCount = users.filter((u) => u.role === 'admin').length;
    return { totalUsers, googleUsers, confirmedUsers, totalSpent, adminsCount };
  }, [users]);

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          address: formData.address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Cập nhật người dùng thành công! ✨');
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  full_name: formData.full_name,
                  phone: formData.phone,
                  role: formData.role,
                  status: formData.status,
                  address: formData.address,
                }
              : u
          )
        );
        setIsEditOpen(false);
      } else {
        error(data.error || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (err) {
      error('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create User Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      error('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        success('Đã tạo tài khoản người dùng mới thành công! 🎉');
        setIsCreateOpen(false);
        setFormData({
          email: '',
          password: '',
          full_name: '',
          phone: '',
          role: 'customer',
          address: '',
          status: 'active',
        });
        fetchUsers();
      } else {
        error(data.error || 'Không thể tạo người dùng.');
      }
    } catch (err) {
      error('Lỗi kết nối server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        success('Đã xoá người dùng khỏi hệ thống!');
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
      } else {
        error(data.error || 'Không thể xoá người dùng.');
      }
    } catch (err) {
      error('Lỗi kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Block Status
  const handleToggleBlock = async (userToToggle: AdminUserData) => {
    const newStatus = userToToggle.status === 'blocked' ? 'active' : 'blocked';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToToggle.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        success(newStatus === 'blocked' ? 'Đã khoá tài khoản!' : 'Đã mở khoá tài khoản!');
        setUsers((prev) =>
          prev.map((u) => (u.id === userToToggle.id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      error('Không thể thay đổi trạng thái.');
    }
  };

  // Export Users CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      info('Không có dữ liệu để xuất CSV.');
      return;
    }
    const headers = ['ID', 'Họ tên', 'Email', 'SĐT', 'Vai trò', 'Hình thức', 'Trạng thái', 'Số đơn', 'Tổng chi tiêu (VNĐ)', 'Ngày tạo'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.full_name}"`,
      u.email,
      u.phone,
      u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng',
      u.provider,
      u.status === 'active' ? 'Hoạt động' : 'Bị khóa',
      u.orders_count,
      u.total_spent,
      formatDate(u.created_at),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_nguoi_dung_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã tải xuống danh sách CSV!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#042414] via-[#07552D] to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              {isSupabaseLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>DỮ LIỆU ĐĂNG KÝ THẬT SUPABASE AUTH</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>KẾT NỐI TẠM THỜI (HỖ TRỢ DEMO &amp; LOCAL)</span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              <span>Quản Lý Người Dùng &amp; Thành Viên 👥</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Quản lý danh sách tài khoản đã đăng ký từ Supabase, theo dõi tiến trình mua hàng, phân quyền Admin/Customer và quản lý trạng thái tài khoản.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm Mới</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition flex items-center gap-2 backdrop-blur-md"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => {
                setFormData({
                  email: '',
                  password: '',
                  full_name: '',
                  phone: '',
                  role: 'customer',
                  address: '',
                  status: 'active',
                });
                setIsCreateOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ THÊM NGƯỜI DÙNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng Thành Viên</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">{stats.adminsCount} Quản trị viên</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Đăng Nhập Google</p>
            <p className="text-2xl font-black text-slate-900">{stats.googleUsers}</p>
            <p className="text-[11px] text-blue-600 font-semibold">Tài khoản Google OAuth</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Đã Xác Minh</p>
            <p className="text-2xl font-black text-slate-900">{stats.confirmedUsers}</p>
            <p className="text-[11px] text-teal-600 font-semibold">Xác nhận Supabase Auth</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tổng Chi Tiêu Khách</p>
            <p className="text-xl font-black text-emerald-700">{formatPrice(stats.totalSpent)}</p>
            <p className="text-[11px] text-amber-600 font-semibold">Được tính từ đơn hàng</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Tên, Email, SĐT, User ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Tất cả Vai Trò</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>

            {/* Provider filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Tất cả Nguồn</option>
              <option value="google">Nguồn Google</option>
              <option value="email">Nguồn Email / Mật Khẩu</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Tất cả Trạng Thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Đã bị khóa</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="newest">📅 Mới nhất</option>
              <option value="oldest">📅 Cũ nhất</option>
              <option value="spent">💰 Chi tiêu cao nhất</option>
              <option value="orders">📦 Đơn hàng nhiều nhất</option>
              <option value="name">🔤 Tên A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700">
            Hiển thị <span className="text-emerald-700 font-extrabold">{filteredUsers.length}</span> người dùng
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Đang nạp dữ liệu người dùng từ Supabase...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Không tìm thấy người dùng nào phù hợp</p>
            <p className="text-xs text-slate-500">Thử thay đổi từ khoá tìm kiếm hoặc các bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Thành Viên</th>
                  <th className="py-3.5 px-4">Email / SĐT</th>
                  <th className="py-3.5 px-4 text-center">Nguồn Đăng Ký</th>
                  <th className="py-3.5 px-4 text-center">Vai Trò</th>
                  <th className="py-3.5 px-4 text-center">Đơn Hàng</th>
                  <th className="py-3.5 px-4 text-right">Tổng Chi Tiêu</th>
                  <th className="py-3.5 px-4 text-center">Ngày Tham Gia</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredUsers.map((u) => {
                  const initialLetter = u.full_name.charAt(0).toUpperCase() || 'U';

                  return (
                    <tr key={u.id} className="hover:bg-emerald-50/40 transition">
                      {/* Member column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.full_name}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-forest-800 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                              {initialLetter}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {u.role === 'admin' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  ADMIN
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">ID: {u.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      {/* Email / Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.email}</span>
                          </p>
                          {u.phone ? (
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{u.phone}</span>
                            </p>
                          ) : (
                            <p className="text-slate-400 text-[11px] italic">Chưa cập nhật SĐT</p>
                          )}
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-3.5 px-4 text-center">
                        {u.provider === 'google' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Google OAuth</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Email / MK</span>
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 text-center">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Quản trị</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-[11px]">
                            <Users className="w-3.5 h-3.5" />
                            <span>Khách hàng</span>
                          </span>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                          {u.orders_count} đơn
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-extrabold text-emerald-700">{formatPrice(u.total_spent)}</p>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {u.status === 'blocked' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                            <Lock className="w-3 h-3" />
                            <span>Đã bị khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View details button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsDetailOpen(true);
                            }}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setFormData({
                                email: u.email,
                                password: '',
                                full_name: u.full_name,
                                phone: u.phone,
                                role: u.role,
                                address: u.address || '',
                                status: u.status,
                              });
                              setIsEditOpen(true);
                            }}
                            title="Chỉnh sửa &amp; Phân quyền"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Block/Unblock toggle */}
                          <button
                            onClick={() => handleToggleBlock(u)}
                            title={u.status === 'blocked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            className={`p-1.5 rounded-lg transition ${
                              u.status === 'blocked'
                                ? 'bg-rose-100 hover:bg-emerald-100 text-rose-700 hover:text-emerald-700'
                                : 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            {u.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsDeleteConfirmOpen(true);
                            }}
                            title="Xoá người dùng"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------- DETAIL MODAL -------------------- */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-emerald-100 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-forest-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID Supabase: {selectedUser.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {selectedUser.provider === 'google' ? 'Google Login' : 'Email/Mật khẩu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-slate-400 font-bold">Email Đăng Ký</p>
                  <p className="font-bold text-slate-800">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Số Điện Thoại</p>
                  <p className="font-bold text-slate-800">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-bold">Địa Chỉ Giao Hàng</p>
                  <p className="font-semibold text-slate-700">{selectedUser.address || 'Chưa có thông tin địa chỉ'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Tổng Đơn Hàng</p>
                  <p className="text-lg font-black text-emerald-800">{selectedUser.orders_count}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 col-span-2">
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Tổng Giá Trị Đã Mua</p>
                  <p className="text-lg font-black text-amber-800">{formatPrice(selectedUser.total_spent)}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Ngày tạo tài khoản:</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedUser.created_at)}</span>
                </div>
                {selectedUser.last_sign_in_at && (
                  <div className="flex justify-between text-slate-600">
                    <span>Lần đăng nhập gần nhất:</span>
                    <span className="font-bold text-slate-800">{formatDate(selectedUser.last_sign_in_at)}</span>
                  </div>
                )}
                {selectedUser.last_order_date && (
                  <div className="flex justify-between text-slate-600">
                    <span>Đơn hàng gần nhất:</span>
                    <span className="font-bold text-emerald-700">{formatDate(selectedUser.last_order_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- EDIT USER MODAL -------------------- */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-slate-100 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <span>Chỉnh Sửa &amp; Phân Quyền</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">{selectedUser.email}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Số Điện Thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Địa Chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vai Trò Hệ Thống</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Trạng Thái Tài Khoản</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Bị khóa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>LƯU CẬP NHẬT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- CREATE USER MODAL -------------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-slate-100 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Thêm Người Dùng Mới</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tài khoản sẽ được tạo trực tiếp trên Supabase Auth hệ thống.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email (*) </label>
                <input
                  type="email"
                  required
                  placeholder="vi-du@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mật Khẩu (*) </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập ít nhất 6 ký tự"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Họ và Tên</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="0905..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Vai Trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>TẠO THÀNH VIÊN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- DELETE CONFIRM MODAL -------------------- */}
      {isDeleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Xoá Tài Khoản Người Dùng?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xoá tài khoản <span className="font-bold text-slate-800">{selectedUser.email}</span>? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>XOÁ NGAY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
