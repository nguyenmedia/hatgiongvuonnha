import { Category, Product, Banner, SiteSettings, Post } from '@/types/database.types';

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'HẠT GIỐNG NHÀ VƯỜN',
  tagline: 'Gieo hạt hôm nay – Nở hoa ngày mai',
  hotline: '0934 811 307',
  zalo: '0934 811 307',
  facebook_url: 'https://www.facebook.com/julymedia1.2',
  facebook_name: 'July Media',
  address: '58 Lý Chính Thắng, Thành phố Quảng Ngãi',
  email: 'lienhe@hatgiontnhavuon.vn',
  working_hours: '07:30 - 21:00 (Tất cả các ngày trong tuần)',
  bank_name: 'MB Bank (Ngân hàng Quân Đội)',
  account_number: '0934811307',
  account_holder: 'HAT GIONG NHA VUON'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Hạt Giống Hoa',
    slug: 'hat-giong-hoa',
    description: 'Các loại hạt giống hoa nhiều màu sắc, tỷ lệ nảy mầm > 85%, dễ chăm sóc.',
    image_url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80',
    icon: '🌸',
    sort_order: 1,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Hạt Giống Rau Củ',
    slug: 'hat-giong-rau-cu',
    description: 'Hạt giống rau sạch, rau ăn lá, củ quả năng suất cao cho vườn nhà.',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80',
    icon: '🥬',
    sort_order: 2,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Hạt Giống Cây Cảnh',
    slug: 'hat-giong-cay-canh',
    description: 'Cây cảnh mini, sen đá, xương rồng, phong thủy trang trí ban công & bàn làm việc.',
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
    icon: '🌵',
    sort_order: 3,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Hạt Giống Cây Ăn Quả',
    slug: 'hat-giong-cay-an-qua',
    description: 'Dâu tây, dưa lưới, cà chua bi lùn sai trĩu quả thích hợp trồng chậu.',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    icon: '🍅',
    sort_order: 4,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Hạt Giống Nhập Khẩu',
    slug: 'hat-giong-nhap-khau',
    description: 'Hạt giống hoa và cây trồng nhập khẩu từ Nga, Nhật Bản, Hà Lan chất lượng cao.',
    image_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
    icon: '✈️',
    sort_order: 5,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Dụng Cụ Làm Vườn',
    slug: 'dung-cu-lam-vuon',
    description: 'Kéo cắt cành tỉa hoa, bình xịt tưới nước, bộ cuốc xẻng mini gia đình.',
    image_url: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=800&q=80',
    icon: '🪴',
    sort_order: 6,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    name: 'Đất Trồng & Vật Tư',
    slug: 'dat-trong-vat-tu',
    description: 'Đất sạch Tribat hữu cơ, giá thể xơ dừa, phân trùn quế, khay ươm hạt giống.',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    icon: '🌱',
    sort_order: 7,
    status: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Hạt Giống Hoa Hướng Dương Lùn F1',
    slug: 'hat-giong-hoa-huong-duong-lun-f1',
    category_id: 'c1',
    price: 35000,
    sale_price: 25000,
    stock: 250,
    short_description: 'Cây lùn 35-40cm, bông hoa to rực rỡ, thích hợp trồng chậu để bàn hoặc ban công nhiều nắng.',
    description: 'Hoa Hướng Dương Lùn F1 là giống hoa dễ trồng, phát triển cực nhanh và cho hoa chỉ sau khoảng 50 - 60 ngày. Cây có chiều cao khiêm tốn từ 30-40cm, thân cứng cáp, hoa to đường kính 12-15cm với cánh hoa màu vàng óng ả nhụy nâu sẫm.',
    planting_guide: '1. Ngâm hạt trong nước ấm 2 sôi 3 lạnh khoảng 4-6 tiếng.\n2. Gieo hạt sâu 1-1.5cm vào đất ẩm tơi xốp, giữ ẩm hàng ngày.\n3. Đặt khay ươm nơi thoáng mát, tránh ánh nắng gắt trực tiếp.\n4. Sau 3-5 ngày hạt nảy mầm, mang ra đón nắng sớm dần dần.',
    germination_time: '3 - 5 ngày',
    germination_rate: '> 90%',
    flowering_time: '50 - 60 ngày',
    origin: 'Nhật Bản F1',
    is_featured: true,
    is_best_seller: true,
    rating: 5.0,
    review_count: 142,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80',
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80'
    ]
  },
  {
    id: 'p2',
    name: 'Hạt Giống Hoa Dạ Yến Thảo Rủ Mix Màu',
    slug: 'hat-giong-hoa-da-yen-thao-ru-mix-mau',
    category_id: 'c1',
    price: 40000,
    sale_price: 30000,
    stock: 180,
    short_description: 'Cây hoa rủ sum suê đủ sắc màu rực rỡ tím, đỏ, hồng, trắng, tạo điểm nhấn tuyệt đẹp cho ban công.',
    description: 'Dạ Yến Thảo Rủ là loại hoa ban công được yêu thích nhất bởi khả năng ra hoa liên tục quanh năm, cành nhánh mềm mại buông rủ dài 30-40cm phủ kín chậu treo.',
    planting_guide: '1. Hạt rất nhỏ nên không cần ngâm, rắc trực tiếp lên mặt đất ẩm xốp mịn.\n2. Dùng bình phun sương phun nhẹ, bọc màng thực phẩm giữ ẩm 3-5 ngày.\n3. Khi cây mọc 3-4 lá thật thì sang chậu lớn, bấm ngọn kích thích phân nhánh.',
    germination_time: '4 - 7 ngày',
    germination_rate: '> 85%',
    flowering_time: '60 - 70 ngày',
    origin: 'Hà Lan',
    is_featured: true,
    is_best_seller: true,
    rating: 4.8,
    review_count: 98,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80'
    ]
  },
  {
    id: 'p3',
    name: 'Hạt Giống Hoa Hồng Leo Pháp Đỏ Nhập Khẩu',
    slug: 'hat-giong-hoa-hong-leo-phap-do',
    category_id: 'c1',
    price: 55000,
    sale_price: 45000,
    stock: 120,
    short_description: 'Hoa hồng leo cánh kép dày, hương thơm nồng nàn quý phái, thích hợp leo cổng vòm và giàn rào.',
    description: 'Hoa Hồng Leo Pháp mang vẻ đẹp lãng mạn sang trọng. Giống hoa kháng sâu bệnh tốt, cành vươn khỏe khoắn, hoa nở thành từng chùm lớn từ 5-10 bông rực rỡ.',
    planting_guide: '1. Ngâm hạt vào nước ấm 30°C trong 24h, sau đó ủ khăn ẩm trong ngăn mát tủ lạnh 15-20 ngày.\n2. Gieo vào giá thể đất sạch tribat, giữ ẩm đều.\n3. Cây con phát triển cần làm giàn leo vững chắc và bón phân hữu cơ định kỳ.',
    germination_time: '15 - 25 ngày',
    germination_rate: '> 80%',
    flowering_time: '90 - 120 ngày',
    origin: 'Pháp',
    is_featured: true,
    is_best_seller: false,
    rating: 4.9,
    review_count: 76,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80'
    ]
  },
  {
    id: 'p4',
    name: 'Hạt Giống Cà Chua Bi Lùn Siêu Trái F1',
    slug: 'hat-giong-ca-chua-bi-lun-sieu-trai-f1',
    category_id: 'c4',
    price: 35000,
    sale_price: 28000,
    stock: 200,
    short_description: 'Cây lùn 40cm, trái tròn mọng nước ngọt đậm, đậu hàng trăm quả chi chít trên một bụi cây.',
    description: 'Cà chua bi lùn F1 cực kỳ dễ trồng trong chậu nhỏ hoặc thùng xốp trên sân thượng. Trái chín đỏ mọng, vị ngọt thanh giòn, giàu vitamin C và chất chống oxy hóa.',
    planting_guide: '1. Ngâm hạt trong nước ấm 3-4 giờ, gieo vào viên nén xơ dừa hoặc đất xốp.\n2. Tưới nước 2 lần/ngày sáng sớm và chiều mát.\n3. Sau 20 ngày cấy ra chậu lớn, cắm cọc đỡ nhánh khi cây trĩu quả.',
    germination_time: '5 - 7 ngày',
    germination_rate: '> 92%',
    flowering_time: '65 - 75 ngày',
    origin: 'Việt Nam',
    is_featured: true,
    is_best_seller: true,
    rating: 4.9,
    review_count: 185,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'
    ]
  },
  {
    id: 'p5',
    name: 'Hạt Giống Dâu Tây Đỏ New Zealand F1',
    slug: 'hat-giong-dau-tay-do-new-zealand-f1',
    category_id: 'c4',
    price: 50000,
    sale_price: 39000,
    stock: 150,
    short_description: 'Trái dâu to, thơm ngát, vị ngọt dịu, thích hợp trồng chậu treo cho quả quanh năm.',
    description: 'Dâu tây đỏ New Zealand thuần chủng cho quả to bóng đẹp, cây kháng bệnh tốt, thích nghi được với khí hậu ấm của mọi miền đất nước.',
    planting_guide: '1. Để hạt vào ngăn mát tủ lạnh 1 tuần để kích hoạt mầm.\n2. Gieo hạt lên bề mặt đất sạch tơi xốp, giữ ẩm bằng bình phun sương.\n3. Khi cây có 4-5 lá con thì chuyển ra chậu thoáng nước.',
    germination_time: '7 - 14 ngày',
    germination_rate: '> 85%',
    flowering_time: '80 - 90 ngày',
    origin: 'New Zealand',
    is_featured: true,
    is_best_seller: false,
    rating: 4.8,
    review_count: 64,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80'
    ]
  },
  {
    id: 'p6',
    name: 'Hạt Giống Xà Lách Xoăn Grand Rapids Cao Cấp',
    slug: 'hat-giong-xa-lach-xoan-grand-rapids',
    category_id: 'c2',
    price: 25000,
    sale_price: 18000,
    stock: 300,
    short_description: 'Lá giòn ngọt, tán xòe xanh non mướt mắt, thu hoạch nhanh chóng chỉ sau 30-35 ngày.',
    description: 'Xà lách xoăn là loại rau không thể thiếu trong các bữa ăn gia đình và món salad tươi ngon. Cây lớn nhanh, ít sâu bệnh, thu hoạch nhiều đợt bẻ lá ăn dần.',
    planting_guide: '1. Ngâm nước ấm 1-2 tiếng hoặc gieo trực tiếp.\n2. Gieo hạt đều tay với mật độ vừa phải, phủ lớp đất mỏng 0.5cm.\n3. Tưới ẩm ngày 1-2 lần bằng bình xịt mịn.',
    germination_time: '2 - 4 ngày',
    germination_rate: '> 95%',
    flowering_time: '30 - 35 ngày',
    origin: 'Việt Nam',
    is_featured: false,
    is_best_seller: true,
    rating: 4.9,
    review_count: 210,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80'
    ]
  },
  {
    id: 'p7',
    name: 'Hạt Giống Cúc Bách Nhật Tím Mix Hồng',
    slug: 'hat-giong-cuc-bach-nhat-tim-mix-hong',
    category_id: 'c1',
    price: 30000,
    sale_price: 22000,
    stock: 160,
    short_description: 'Bông tròn như quả cầu tím hồng tươi tắn, hoa bền màu 2-3 tháng không tàn, chịu nắng hạn cực tốt.',
    description: 'Cúc bách nhật còn gọi là hoa cúc nút áo. Hoa nở quanh năm, không kén đất, sống khỏe ngay cả trong điều kiện nắng nóng gay gắt mùa hè.',
    planting_guide: '1. Gieo trực tiếp hạt vào đất ẩm thoát nước tốt.\n2. Tưới nước vừa đủ không để ngập úng.\n3. Khi cây cao 10cm bấm ngọn để bụi hoa xòe tròn nhiều hoa.',
    germination_time: '4 - 6 ngày',
    germination_rate: '> 88%',
    flowering_time: '55 - 65 ngày',
    origin: 'Đài Loan',
    is_featured: false,
    is_best_seller: false,
    rating: 4.7,
    review_count: 52,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&q=80'
    ]
  },
  {
    id: 'p8',
    name: 'Bộ Dụng Cụ Làm Vườn Mini 3 Món Cán Gỗ',
    slug: 'bo-dung-cu-lam-vuon-mini-3-mon-can-go',
    category_id: 'c6',
    price: 65000,
    sale_price: 49000,
    stock: 100,
    short_description: 'Gồm 1 xẻng lớn, 1 xẻng nhỏ và 1 cào đất cán gỗ sồi chống trượt, đầu thép sơn tĩnh điện không gỉ.',
    description: 'Bộ 3 dụng cụ làm vườn tiện lợi cho việc xới đất, trồng hoa chậu, cấy cây con và chăm sóc vườn ban công nhỏ gọn nhẹ nhàng.',
    planting_guide: 'Vệ sinh sạch đất sau khi sử dụng và bảo quản nơi khô ráo thoáng mát.',
    germination_time: 'Sử dụng ngay',
    germination_rate: '100%',
    flowering_time: 'Bền bỉ > 3 năm',
    origin: 'Việt Nam',
    is_featured: true,
    is_best_seller: true,
    rating: 5.0,
    review_count: 115,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=800&q=80'
    ]
  },
  {
    id: 'p9',
    name: 'Bình Xịt Tưới Cây Áp Suất Cầm Tay 2 Lít',
    slug: 'binh-xit-tuoi-cay-ap-suat-2-lit',
    category_id: 'c6',
    price: 75000,
    sale_price: 59000,
    stock: 85,
    short_description: 'Đầu vòi đồng xoay chỉnh tia nước từ phun sương mịn đến phun xa, có khóa xịt tự động tiện lợi.',
    description: 'Bình xịt áp suất 2L bằng nhựa PP nguyên sinh cao cấp chịu lực tốt, giúp việc tưới ẩm hạt giống non và phun phân bón lá trở nên nhẹ nhàng.',
    planting_guide: 'Bơm khí 10-15 lần và ấn van xịt, điều chỉnh đầu vòi để chọn chế độ phun phù hợp.',
    germination_time: 'Sử dụng ngay',
    germination_rate: '100%',
    flowering_time: 'Bền bỉ',
    origin: 'Việt Nam',
    is_featured: false,
    is_best_seller: false,
    rating: 4.8,
    review_count: 43,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80'
    ]
  },
  {
    id: 'p10',
    name: 'Đất Sạch Hữu Cơ Tribat Trồng Hoa & Cây Cảnh 10 Dm3',
    slug: 'dat-sach-huu-co-tribat-10dm3',
    category_id: 'c7',
    price: 45000,
    sale_price: 35000,
    stock: 150,
    short_description: 'Đất hữu cơ vi sinh đã qua xử lý khử khuẩn, tơi xốp giàu dinh dưỡng, dùng trồng trực tiếp không cần trộn.',
    description: 'Đất sạch Tribat sản xuất từ mùn xơ dừa, vỏ đậu phộng và phân trùn quế hữu cơ, giúp rễ cây non phát triển nhanh và giữ ẩm tối ưu.',
    planting_guide: 'Đổ trực tiếp vào khay ươm hoặc chậu trồng, tưới ẩm vừa đủ rồi tiến hành gieo hạt hoặc trồng cây.',
    germination_time: 'Sử dụng ngay',
    germination_rate: '100%',
    flowering_time: 'Dinh dưỡng 6 tháng',
    origin: 'Việt Nam',
    is_featured: true,
    is_best_seller: true,
    rating: 4.9,
    review_count: 90,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80'
    ]
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: '🌸 HẠT GIỐNG HOA CHẤT LƯỢNG CAO',
    subtitle: '🌱 GIEO HẠT HÔM NAY – NỞ HOA NGÀY MAI\nTỷ lệ nảy mầm đạt chuẩn > 85%, hoa đẹp rực rỡ quanh năm',
    image_url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1600&q=85',
    link: '/san-pham',
    position: 'hero_slider',
    sort_order: 1,
    status: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'b2',
    title: '🥬 VƯỜN RAU SẠCH BAN CÔNG XANH MÁT',
    subtitle: 'Tự tay chăm sóc và thu hoạch rau củ quả organic sạch 100% cho gia đình',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1600&q=85',
    link: '/danh-muc/hat-giong-rau-cu',
    position: 'hero_slider',
    sort_order: 2,
    status: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Kỹ thuật ngâm ủ và gieo hạt giống hoa nảy mầm 100%',
    slug: 'ky-thuat-ngam-u-va-gieo-hat-giong-hoa',
    thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    category: 'Kỹ thuật gieo trồng',
    summary: 'Bí quyết chuẩn bị giá thể, nhiệt độ nước ngâm và cách giữ độ ẩm lý tưởng giúp hạt giống hoa nhanh chóng bung mầm khỏe khoắn.',
    content: `
      <h2>1. Chuẩn bị giá thể và đất trồng</h2>
      <p>Hạt giống hoa non nớt cần môi trường đất tơi xốp, giàu mùn và thoát nước tốt. Đất sạch Tribat hoặc hỗn hợp mùn xơ dừa + phân trùn quế đã xử lý là lựa chọn tối ưu.</p>
      
      <h2>2. Quy trình ngâm ủ hạt giống</h2>
      <p>Đối với hạt vỏ cứng (như hướng dương, hoa hồng, mười giờ thái): Ngâm trong nước ấm tỷ lệ 2 sôi 3 lạnh (khoảng 40-45°C) trong 4-6 tiếng. Đối với hạt siêu nhỏ (như dạ yến thảo, cúc bách nhật): Không cần ngâm, có thể gieo trực tiếp.</p>
      
      <h2>3. Giữ ẩm và ánh sáng</h2>
      <p>Dùng bình phun sương tưới nhẹ 2 lần mỗi ngày. Đặt khay ươm nơi thoáng mát, có ánh sáng tán xạ, tránh ánh nắng gắt trực tiếp.</p>
    `,
    author: 'Kỹ Sư Nhà Vườn',
    views: 1250,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'post-2',
    title: 'Top 5 loại hoa rực rỡ dễ trồng nhất cho ban công chung cư',
    slug: 'top-5-loai-hoa-ruc-ro-de-trong-nhat-ban-cong',
    thumbnail: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
    category: 'Mẹo làm vườn',
    summary: 'Gợi ý hoa hướng dương lùn, dạ yến thảo rủ, cúc bách nhật... nở hoa quanh năm dù diện tích ban công khiêm tốn.',
    content: `
      <h2>1. Hoa Hướng Dương Lùn F1</h2>
      <p>Chỉ cao 35-40cm nhưng bông to vàng rực, cực kỳ ưa nắng và chỉ 50-60 ngày là nở hoa rực rỡ cả góc ban công.</p>
      
      <h2>2. Hoa Dạ Yến Thảo Rủ</h2>
      <p>Nữ hoàng hoa ban công với tán buông rủ dài, nở hoa liên tục quanh năm nhiều sắc màu.</p>
      
      <h2>3. Hoa Cúc Bách Nhật</h2>
      <p>Bền bỉ, chịu nắng hạn cực tốt, hoa tròn tím biếc tươi lâu suốt 2-3 tháng.</p>
    `,
    author: 'Hạt Giống Nhà Vườn',
    views: 980,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
