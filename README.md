# 🌱 HẠT GIỐNG NHÀ VƯỜN - E-Commerce & Gardening Platform

> Website Thương mại điện tử chuyên nghiệp cung cấp **Hạt giống hoa F1, Hạt giống rau sạch, Cây cảnh, Cây ăn quả, Dụng cụ & Đất trồng hữu cơ**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 🛍️ Khách Hàng (Customer Frontend)
- **Giao diện chuẩn Organic & Botanical:** Thiết kế hiện đại, sang trọng, màu xanh lá thiên nhiên, responsive 100% trên điện thoại, máy tính bảng và máy tính.
- **Trang chủ sống động:** Hero Banner chuẩn khẩu hiệu `🌸 HẠT GIỐNG HOA CHẤT LƯỢNG - 🌱 GIEO HẠT HÔM NAY – NỞ HOA NGÀY MAI`, Danh mục Card tròn, Sản phẩm bán chạy, Hạt giống hoa rực rỡ, Cẩm nang gieo trồng và Đánh giá khách hàng.
- **Tìm kiếm thông minh & Bộ lọc nâng cao:** Live search gợi ý tức thì, lọc theo danh mục, khoảng giá, sắp xếp theo giá và độ phổ biến.
- **Trang chi tiết sản phẩm toàn diện:** Gallery đa ảnh, bảng thông số kỹ thuật (Thời gian nảy mầm, Tỷ lệ nảy mầm, Thời gian ra hoa, Xuất xứ), Tab hướng dẫn gieo trồng chi tiết từng bước, Đánh giá sao tương tác.
- **Giỏ hàng & Thanh toán:** Lưu giỏ hàng mượt mà, hỗ trợ mã ưu đãi giảm giá (`NHAVUON10`, `FREESHIP`, `CHAOHOMNAY`), chọn phương thức thanh toán **COD** hoặc **Chuyển khoản Ngân hàng VietQR tự động**.
- **Thông báo đặt hàng thành công:** Hiệu ứng pháo hoa Confetti, hiển thị mã đơn `#HG...` và tóm tắt giao hàng.
- **Tra cứu đơn hàng trực tuyến:** Cho phép khách hàng tra cứu tiến độ vận chuyển đơn hàng bằng Mã đơn hoặc Số điện thoại.
- **Nút liên hệ nổi cố định:** Gọi Hotline, Chat Zalo (`0934 811 307`), Chat Facebook Fanpage (`July Media`), nút Admin nhanh và cuộn lên đầu trang.

### 🛡️ Quản Trị Viên (Admin Dashboard - `/admin`)
- **Dashboard Tổng quan:** Thống kê doanh thu, đơn hàng, khách hàng, số lượng sản phẩm; Biểu đồ doanh thu trực quan; Danh sách đơn hàng mới nhất.
- **Quản lý Sản phẩm:** Thêm / Sửa / Xóa sản phẩm, chuyển trạng thái ẩn/hiện, quản lý giá và tồn kho.
- **Upload ảnh Supabase Storage:** Hỗ trợ upload ảnh trực tiếp lên Storage Buckets (`products`, `categories`, `banners`, `blog`, `avatars`) và lấy Public URL tức thì.
- **Quản lý Đơn hàng:** Xem chi tiết đơn hàng, cập nhật trạng thái đơn thời gian thực (`pending` → `confirmed` → `shipping` → `completed` → `cancelled`).
- **Quản lý Danh mục & Banners:** Tạo danh mục mới kèm emoji/icon, chỉnh sửa banner slider.
- **Quản lý Mã giảm giá (Coupons) & Blog:** Thêm mã giảm giá chiết khấu % hoặc số tiền cố định, quản lý bài viết chia sẻ kinh nghiệm.
- **Cài đặt Website:** Cập nhật thông tin Hotline, Zalo, Facebook, địa chỉ 58 Lý Chính Thắng, và tài khoản ngân hàng MB Bank.

---

## 🤖 TÍCH HỢP TELEGRAM BOT (Server-Side Backend)

Khi có khách hàng đặt hàng thành công trên website, hệ thống sẽ tự động gửi thông báo chi tiết qua Telegram Bot:

```text
🔔 ĐƠN HÀNG MỚI TỪ HẠT GIỐNG NHÀ VƯỜN
━━━━━━━━━━━━━━━━━━━━━
🆔 Mã đơn hàng: #HG123456
👤 Khách hàng: Nguyễn Văn An
📞 Số điện thoại: 0934 811 307
📍 Địa chỉ: 58 Lý Chính Thắng, TP. Quảng Ngãi
━━━━━━━━━━━━━━━━━━━━━
🛒 SẢN PHẨM:
🌱 Hạt Giống Hoa Hướng Dương Lùn F1
   Số lượng: 2 | Giá: 50.000 ₫
━━━━━━━━━━━━━━━━━━━━━
🚚 Phí vận chuyển: Miễn phí
💰 TỔNG THANH TOÁN: 50.000 ₫
💳 Phương thức: Thanh toán khi nhận hàng (COD)
━━━━━━━━━━━━━━━━━━━━━
📝 Ghi chú: Giao giờ hành chính
```

> **Bảo mật:** Token Telegram được gọi hoàn toàn từ Server API Route (`/api/orders`), tuyệt đối không để lộ Token ra Client/Frontend. Nếu Telegram gặp sự cố mạng, đơn hàng vẫn được lưu vào Database an toàn 100%.

---

## 🗄️ CẤU TRÚC SUPABASE DATABASE TRUNG TÂM

Supabase URL: `https://dweqoipzzvrsuavczdcq.supabase.co`

### Kiến trúc Đồng bộ nhiều Website
```text
  WEBSITE 1 (Website chính)    │
  WEBSITE 2 (Landing page)     ├───► SUPABASE CENTRAL DATABASE & REALTIME
  WEBSITE 3 (Website mobile)   │
```

Tất cả các phiên bản website đều kết nối về Supabase trung tâm. Khi thêm sản phẩm hoặc cập nhật giá, tất cả các website sẽ nhận dữ liệu đồng bộ tức thì qua Supabase Realtime Channels.

### Hướng dẫn Chạy SQL Schema
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard/project/dweqoipzzvrsuavczdcq).
2. Vào mục **SQL Editor**.
3. Mở file [supabase/schema.sql](file:///e:/hoa/supabase/schema.sql) và bấm **Run**.
4. Mở tiếp file [supabase/seed.sql](file:///e:/hoa/supabase/seed.sql) và bấm **Run** để nạp dữ liệu mẫu ban đầu.

---

## ⚙️ CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env.local`)

Tạo file `.env.local` tại thư mục gốc với các thông số:

```env
# Supabase Central Database
NEXT_PUBLIC_SUPABASE_URL=https://dweqoipzzvrsuavczdcq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Bot Notification (Backend Server Only)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 HƯỚNG DẪN CHẠY VÀ PHÁT TRIỂN LOCAL

```bash
# 1. Cài đặt các thư viện dependencies
npm install

# 2. Khởi chạy dev server
npm run dev

# 3. Truy cập website:
# Frontend: http://localhost:3000
# Admin Dashboard: http://localhost:3000/admin
```

---

## 📞 THÔNG TIN LIÊN HỆ CỦA SHOP
- **Cửa hàng:** Hạt Giống Nhà Vườn
- **Địa chỉ:** 58 Lý Chính Thắng, Thành phố Quảng Ngãi
- **Hotline / Zalo:** 0934 811 307
- **Facebook:** [July Media](https://www.facebook.com/julymedia1.2)
