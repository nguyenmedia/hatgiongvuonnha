-- ==============================================================================
-- SEED DATA: HẠT GIỐNG NHÀ VƯỜN
-- ==============================================================================

-- 1. CATEGORIES SEED
INSERT INTO public.categories (id, name, slug, description, image_url, icon, sort_order, status)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Hạt Giống Hoa', 'hat-giong-hoa', 'Các loại hạt giống hoa nhiều màu sắc, tỷ lệ nảy mầm > 85%, dễ chăm sóc.', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80', '🌸', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Hạt Giống Rau Củ', 'hat-giong-rau-cu', 'Hạt giống rau sạch, rau ăn lá, củ quả năng suất cao cho vườn nhà.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', '🥬', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Hạt Giống Cây Cảnh & Bonsai', 'hat-giong-cay-canh', 'Cây cảnh mini, sen đá, xương rồng, phong thủy trang trí ban công & bàn làm việc.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80', '🌵', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Hạt Giống Cây Ăn Quả', 'hat-giong-cay-an-qua', 'Dâu tây, dưa lưới, cà chua bi lùn sai trĩu quả thích hợp trồng chậu.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', '🍅', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Hạt Giống Nhập Khẩu', 'hat-giong-nhap-khau', 'Hạt giống hoa và cây trồng nhập khẩu từ Nga, Nhật Bản, Hà Lan chất lượng cao.', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80', '✈️', 5, true),
    ('c6666666-6666-6666-6666-666666666666', 'Dụng Cụ Làm Vườn', 'dung-cu-lam-vuon', 'Kéo cắt cành tỉa hoa, bình xịt tưới nước, bộ cuốc xẻng mini gia đình.', 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=800&q=80', '🪴', 6, true),
    ('c7777777-7777-7777-7777-777777777777', 'Đất Trồng & Vật Tư', 'dat-trong-vat-tu', 'Đất sạch Tribat hữu cơ, giá thể xơ dừa, phân trùn quế, khay ươm hạt giống.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', '🌱', 7, true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- 2. PRODUCTS SEED
INSERT INTO public.products (
    id, name, slug, category_id, price, sale_price, stock, 
    short_description, description, planting_guide, 
    germination_time, germination_rate, flowering_time, origin, 
    is_featured, is_best_seller, rating, review_count, status
)
VALUES
    (
        'p1111111-1111-1111-1111-111111111111',
        'Hạt Giống Hoa Hướng Dương Lùn F1',
        'hat-giong-hoa-huong-duong-lun-f1',
        'c1111111-1111-1111-1111-111111111111',
        35000, 25000, 250,
        'Cây lùn 35-40cm, bông hoa to rực rỡ, thích hợp trồng chậu để bàn hoặc ban công nhiều nắng.',
        '<p>Hoa Hướng Dương Lùn F1 là giống hoa dễ trồng, phát triển cực nhanh và cho hoa chỉ sau khoảng 50 - 60 ngày. Cây có chiều cao khiêm tốn từ 30-40cm, thân cứng cáp, hoa to đường kính 12-15cm với cánh hoa màu vàng óng ả nhụy nâu sẫm.</p>',
        'Bước 1: Ngâm hạt trong nước ấm 2 sôi 3 lạnh khoảng 4-6 tiếng.\nBước 2: Gieo hạt sâu 1-1.5cm vào đất ẩm tơi xốp, giữ ẩm hàng ngày.\nBước 3: Đặt khay ươm nơi thoáng mát, tránh ánh nắng gắt trực tiếp.\nBước 4: Sau 3-5 ngày hạt nảy mầm, mang ra đón nắng sớm dần dần.',
        '3 - 5 ngày', '> 90%', '50 - 60 ngày', 'Nhật Bản F1',
        true, true, 4.9, 142, true
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        'Hạt Giống Hoa Dạ Yến Thảo Rủ Mix Màu',
        'hat-giong-hoa-da-yen-thao-ru-mix-mau',
        'c1111111-1111-1111-1111-111111111111',
        40000, 30000, 180,
        'Cây hoa rủ sum suê đủ sắc màu rực rỡ tím, đỏ, hồng, trắng, tạo điểm nhấn tuyệt đẹp cho ban công.',
        '<p>Dạ Yến Thảo Rủ là loại hoa ban công được yêu thích nhất bởi khả năng ra hoa liên tục quanh năm, cành nhánh mềm mại buông rủ dài 30-40cm phủ kín chậu treo.</p>',
        'Bước 1: Hạt rất nhỏ nên không cần ngâm, rắc trực tiếp lên mặt đất ẩm xốp mịn.\nBước 2: Dùng bình phun sương phun nhẹ, bọc màng thực phẩm giữ ẩm 3-5 ngày.\nBước 3: Khi cây mọc 3-4 lá thật thì sang chậu lớn, bấm ngọn kích thích phân nhánh.',
        '4 - 7 ngày', '> 85%', '60 - 70 ngày', 'Hà Lan',
        true, true, 4.8, 98, true
    ),
    (
        'p3333333-3333-3333-3333-333333333333',
        'Hạt Giống Hoa Hồng Leo Pháp Đỏ Nhập Khẩu',
        'hat-giong-hoa-hong-leo-phap-do',
        'c1111111-1111-1111-1111-111111111111',
        55000, 45000, 120,
        'Hoa hồng leo cánh kép dày, hương thơm nồng nàn quý phái, thích hợp leo cổng vòm và giàn rào.',
        '<p>Hoa Hồng Leo Pháp mang vẻ đẹp lãng mạn sang trọng. Giống hoa kháng sâu bệnh tốt, cành vươn khỏe khoắn, hoa nở thành từng chùm lớn từ 5-10 bông rực rỡ.</p>',
        'Bước 1: Ngâm hạt vào nước ấm 30°C trong 24h, sau đó ủ khăn ẩm trong ngăn mát tủ lạnh 15-20 ngày.\nBước 2: Gieo vào giá thể đất sạch tribat, giữ ẩm đều.\nBước 3: Cây con phát triển cần làm giàn leo vững chắc và bón phân hữu cơ định kỳ.',
        '15 - 25 ngày', '> 80%', '90 - 120 ngày', 'Pháp',
        true, false, 4.7, 76, true
    ),
    (
        'p4444444-4444-4444-4444-444444444444',
        'Hạt Giống Cà Chua Bi Lùn Siêu Trái F1',
        'hat-giong-ca-chua-bi-lun-sieu-trai-f1',
        'c4444444-4444-4444-4444-444444444444',
        35000, 28000, 200,
        'Cây lùn 40cm, trái tròn mọng nước ngọt đậm, đậu hàng trăm quả chi chít trên một bụi cây.',
        '<p>Cà chua bi lùn F1 cực kỳ dễ trồng trong chậu nhỏ hoặc thùng xốp trên sân thượng. Trái chín đỏ mọng, vị ngọt thanh giòn, giàu vitamin C và chất chống oxy hóa.</p>',
        'Bước 1: Ngâm hạt trong nước ấm 3-4 giờ, gieo vào viên nén xơ dừa hoặc đất xốp.\nBước 2: Tưới nước 2 lần/ngày sáng sớm và chiều mát.\nBước 3: Sau 20 ngày cấy ra chậu lớn, cắm cọc đỡ nhánh khi cây trĩu quả.',
        '5 - 7 ngày', '> 92%', '65 - 75 ngày', 'Việt Nam',
        true, true, 4.9, 185, true
    ),
    (
        'p5555555-5555-5555-5555-555555555555',
        'Hạt Giống Dâu Tây Đỏ New Zealand F1',
        'hat-giong-dau-tay-do-new-zealand-f1',
        'c4444444-4444-4444-4444-444444444444',
        50000, 39000, 150,
        'Trái dâu to, thơm ngát, vị ngọt dịu, thích hợp trồng chậu treo cho quả quanh năm.',
        '<p>Dâu tây đỏ New Zealand thuần chủng cho quả to bóng đẹp, cây kháng bệnh tốt, thích nghi được với khí hậu ấm của mọi miền đất nước.</p>',
        'Bước 1: Để hạt vào ngăn mát tủ lạnh 1 tuần để kích hoạt mầm.\nBước 2: Gieo hạt lên bề mặt đất sạch tơi xốp, giữ ẩm bằng bình phun sương.\nBước 3: Khi cây có 4-5 lá con thì chuyển ra chậu thoáng nước.',
        '7 - 14 ngày', '> 85%', '80 - 90 ngày', 'New Zealand',
        true, false, 4.8, 64, true
    ),
    (
        'p6666666-6666-6666-6666-666666666666',
        'Hạt Giống Xà Lách Xoăn Grand Rapids Cao Cấp',
        'hat-giong-xa-lach-xoan-grand-rapids',
        'c2222222-2222-2222-2222-222222222222',
        25000, 18000, 300,
        'Lá giòn ngọt, tán xòe xanh non mướt mắt, thu hoạch nhanh chóng chỉ sau 30-35 ngày.',
        '<p>Xà lách xoăn là loại rau không thể thiếu trong các bữa ăn gia đình và món salad tươi ngon. Cây lớn nhanh, ít sâu bệnh, thu hoạch nhiều đợt bẻ lá ăn dần.</p>',
        'Bước 1: Ngâm nước ấm 1-2 tiếng hoặc gieo trực tiếp.\nBước 2: Gieo hạt đều tay với mật độ vừa phải, phủ lớp đất mỏng 0.5cm.\nBước 3: Tưới ẩm ngày 1-2 lần bằng bình xịt mịn.',
        '2 - 4 ngày', '> 95%', '30 - 35 ngày', 'Việt Nam',
        false, true, 4.9, 210, true
    ),
    (
        'p7777777-7777-7777-7777-777777777777',
        'Hạt Giống Cúc Bách Nhật Tím Mix Hồng',
        'hat-giong-cuc-bach-nhat-tim-mix-hong',
        'c1111111-1111-1111-1111-111111111111',
        30000, 22000, 160,
        'Bông tròn như quả cầu tím hồng tươi tắn, hoa bền màu 2-3 tháng không tàn, chịu nắng hạn cực tốt.',
        '<p>Cúc bách nhật còn gọi là hoa cúc nút áo. Hoa nở quanh năm, không kén đất, sống khỏe ngay cả trong điều kiện nắng nóng gay gắt mùa hè.</p>',
        'Bước 1: Gieo trực tiếp hạt vào đất ẩm thoát nước tốt.\nBước 2: Tưới nước vừa đủ không để ngập úng.\nBước 3: Khi cây cao 10cm bấm ngọn để bụi hoa xòe tròn nhiều hoa.',
        '4 - 6 ngày', '> 88%', '55 - 65 ngày', 'Đài Loan',
        false, false, 4.7, 52, true
    ),
    (
        'p8888888-8888-8888-8888-888888888888',
        'Bộ Dụng Cụ Làm Vườn Mini 3 Món Cán Gỗ',
        'bo-dung-cu-lam-vuon-mini-3-mon-can-go',
        'c6666666-6666-6666-6666-666666666666',
        65000, 49000, 100,
        'Gồm 1 xẻng lớn, 1 xẻng nhỏ và 1 cào đất cán gỗ sồi chống trượt, đầu thép sơn tĩnh điện không gỉ.',
        '<p>Bộ 3 dụng cụ làm vườn tiện lợi cho việc xới đất, trồng hoa chậu, cấy cây con và chăm sóc vườn ban công nhỏ gọn nhẹ nhàng.</p>',
        'Vệ sinh sạch đất sau khi sử dụng và bảo quản nơi khô ráo thoáng mát.',
        'Sử dụng ngay', '100%', 'Bền bỉ > 3 năm', 'Việt Nam',
        true, true, 5.0, 115, true
    ),
    (
        'p9999999-9999-9999-9999-999999999999',
        'Bình Xịt Tưới Cây Áp Suất Cầm Tay 2 Lít',
        'binh-xit-tuoi-cay-ap-suat-2-lit',
        'c6666666-6666-6666-6666-666666666666',
        75000, 59000, 85,
        'Đầu vòi đồng xoay chỉnh tia nước từ phun sương mịn đến phun xa, có khóa xịt tự động tiện lợi.',
        '<p>Bình xịt áp suất 2L bằng nhựa PP nguyên sinh cao cấp chịu lực tốt, giúp việc tưới ẩm hạt giống non và phun phân bón lá trở nên nhẹ nhàng.</p>',
        'Bơm khí 10-15 lần và ấn van xịt, điều chỉnh đầu vòi để chọn chế độ phun phù hợp.',
        'Sử dụng ngay', '100%', 'Bền bỉ', 'Việt Nam',
        false, false, 4.8, 43, true
    ),
    (
        'paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Đất Sạch Hữu Cơ Tribat Trồng Hoa & Cây Cảnh 10 Dm3',
        'dat-sach-huu-co-tribat-10dm3',
        'c7777777-7777-7777-7777-777777777777',
        45000, 35000, 150,
        'Đất hữu cơ vi sinh đã qua xử lý khử khuẩn, tơi xốp giàu dinh dưỡng, dùng trồng trực tiếp không cần trộn.',
        '<p>Đất sạch Tribat sản xuất từ mùn xơ dừa, vỏ đậu phộng và phân trùn quế hữu cơ, giúp rễ cây non phát triển nhanh và giữ ẩm tối ưu.</p>',
        'Đổ trực tiếp vào khay ươm hoặc chậu trồng, tưới ẩm vừa đủ rồi tiến hành gieo hạt hoặc trồng cây.',
        'Sử dụng ngay', '100%', 'Dinh dưỡng 6 tháng', 'Việt Nam',
        true, true, 4.9, 90, true
    )
ON CONFLICT (slug) DO UPDATE
SET price = EXCLUDED.price, sale_price = EXCLUDED.sale_price, stock = EXCLUDED.stock;

-- 3. PRODUCT IMAGES SEED
INSERT INTO public.product_images (product_id, image_url, sort_order)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80', 1),
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80', 2),
    ('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80', 1),
    ('p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80', 1),
    ('p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', 1),
    ('p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80', 1),
    ('p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80', 1),
    ('p7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80', 1),
    ('p8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=800&q=80', 1),
    ('p9999999-9999-9999-9999-999999999999', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80', 1),
    ('paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', 1);

-- 4. BANNERS SEED
INSERT INTO public.banners (id, title, subtitle, image_url, link, position, sort_order, status)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'HẠT GIỐNG HOA CHẤT LƯỢNG CAO', 'Gieo hạt hôm nay – Nở hoa ngày mai. Tỷ lệ nảy mầm đạt chuẩn > 85%', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1600&q=85', '/san-pham', 'hero_slider', 1, true),
    ('b2222222-2222-2222-2222-222222222222', 'KHU VƯỜN RAU SẠCH BAN CÔNG', 'Tự tay trồng rau organic an toàn sức khỏe cho cả gia đình bạn', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1600&q=85', '/danh-muc/hat-giong-rau-cu', 'hero_slider', 2, true);

-- 5. COUPONS SEED
INSERT INTO public.coupons (code, discount_type, discount_value, min_order, status)
VALUES
    ('NHAVUON10', 'percentage', 10, 150000, true),
    ('FREESHIP', 'fixed', 30000, 300000, true),
    ('CHAOHOMNAY', 'fixed', 20000, 100000, true);

-- 6. BLOG POSTS SEED
INSERT INTO public.posts (title, slug, thumbnail, category, summary, content, author)
VALUES
    (
        'Kỹ thuật ngâm ủ và gieo hạt giống hoa nảy mầm 100%',
        'ky-thuat-ngam-u-va-gieo-hat-giong-hoa',
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
        'Kỹ thuật gieo trồng',
        'Bí quyết chuẩn bị giá thể, nhiệt độ nước ngâm và cách giữ độ ẩm lý tưởng giúp hạt giống hoa nhanh chóng bung mầm khỏe khoắn.',
        '<p>Gieo hạt giống hoa không khó nếu bạn nắm vững quy luật nhiệt độ và độ ẩm. Dưới đây là quy trình 4 bước chuẩn nhà vườn...</p>',
        'Kỹ Sư Nhà Vườn'
    ),
    (
        'Top 5 loại hoa rực rỡ dễ trồng nhất cho ban công chung cư',
        'top-5-loai-hoa-ruc-ro-de-trong-nhat-ban-cong',
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
        'Mẹo làm vườn',
        'Gợi ý hoa hướng dương lùn, dạ yến thảo rủ, cúc bách nhật... nở hoa quanh năm dù diện tích ban công khiêm tốn.',
        '<p>Bạn có một ban công nhỏ và muốn phủ xanh không gian sống bằng những sắc hoa lung linh? Hãy tham khảo ngay 5 loài hoa này...</p>',
        'Hạt Giống Nhà Vườn'
    );
