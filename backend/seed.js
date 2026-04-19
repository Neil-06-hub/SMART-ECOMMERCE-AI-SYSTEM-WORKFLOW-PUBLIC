const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/smart-ecommerce";

const sampleProducts = [
  {
    name: "Điện thoại thông minh AI Pro 15",
    description: "Smartphone tích hợp AI tiên tiến nhất, camera 108MP chụp đêm siêu nét, chip AI xử lý mượt mà mọi tác vụ. Pin 5000mAh sạc siêu tốc.",
    price: 25000000,
    originalPrice: 28000000,
    category: "Điện thoại",
    tags: ["smartphone", "ai", "camera", "pro", "flagship", "casual", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 50,
    sold: 120,
    rating: 4.8,
    numReviews: 45,
    featured: true,
    specs: [
      { name: "Màn hình", value: "6.7 inch OLED 120Hz" },
      { name: "Vi xử lý", value: "Snapdragon 8 Gen 2 AI" },
      { name: "RAM", value: "12 GB" },
      { name: "Bộ nhớ trong", value: "256 GB" },
      { name: "Camera chính", value: "108MP + 12MP + 12MP" },
      { name: "Pin & Sạc", value: "5000 mAh, 120W" }
    ]
  },
  {
    name: "Laptop Creator X1 AI",
    description: "Laptop mỏng nhẹ hiệu năng cao dành cho nhà sáng tạo nội dung. Màn hình OLED 4K, card đồ họa mạnh mẽ hỗ trợ AI render video cực nhanh.",
    price: 35000000,
    originalPrice: 40000000,
    category: "Laptop",
    tags: ["laptop", "creator", "oled", "ai", "render", "tối giản", "formal"],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 30,
    sold: 15,
    rating: 4.9,
    numReviews: 12,
    featured: true,
    specs: [
      { name: "CPU", value: "Intel Core i9-13900H" },
      { name: "RAM", value: "32 GB LPDDR5x" },
      { name: "Ổ cứng", value: "1 TB PCIe Gen4 SSD" },
      { name: "Card đồ họa", value: "NVIDIA RTX 4060 8GB" },
      { name: "Màn hình", value: "16 inch 4K OLED 100% DCI-P3" },
      { name: "Trọng lượng", value: "1.8 kg" }
    ]
  },
  {
    name: "Đồng hồ thông minh Fit AI Watch",
    description: "Theo dõi sức khỏe 24/7 với trợ lý AI cá nhân. Cảnh báo nhịp tim, đo SPO2, hướng dẫn tập luyện thông minh. Trọng lượng siêu nhẹ.",
    price: 3500000,
    originalPrice: 5000000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "smartwatch", "health", "fitness", "ai", "casual", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 100,
    sold: 300,
    rating: 4.6,
    numReviews: 89,
    featured: false,
    specs: [
      { name: "Màn hình", value: "1.4 inch AMOLED" },
      { name: "Chống nước", value: "Đạt chuẩn 5ATM" },
      { name: "Thời lượng pin", value: "Tối đa 14 ngày" },
      { name: "Cảm biến", value: "Nhịp tim, SpO2, Gia tốc kế" },
      { name: "Chất liệu dây", value: "Silicone kháng khuẩn" }
    ]
  },
  {
    name: "Tai nghe chống ồn AI Silence",
    description: "Tai nghe true-wireless với công nghệ chống ồn chủ động điều khiển bằng AI, tự động tùy chỉnh âm thanh theo môi trường xung quanh.",
    price: 4200000,
    originalPrice: 4500000,
    category: "Âm thanh",
    tags: ["headphone", "audio", "anc", "wireless", "ai", "tối giản", "casual", "đen"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 200,
    sold: 450,
    rating: 4.7,
    numReviews: 210,
    featured: true,
    specs: [
      { name: "Kết nối", value: "Bluetooth 5.3" },
      { name: "Chống ồn (ANC)", value: "Khử tiếng ồn kép (Dual ANC)" },
      { name: "Microphone", value: "3 mic / mỗi tai nghe" },
      { name: "Pin", value: "8 giờ (Tai nghe), 32 giờ (Case)" },
      { name: "Chống nước", value: "IPX4" }
    ]
  },
  {
    name: "Máy ảnh Mirrorless Alpha AI-7",
    description: "Máy ảnh ống kính rời mỏng nhẹ với hệ thống lấy nét tự động nhận diện ánh mắt bằng AI cực kỳ thông minh. Cảm biến Full-Frame 24MP.",
    price: 45000000,
    originalPrice: 48000000,
    category: "Máy ảnh",
    tags: ["camera", "photography", "mirrorless", "ai", "fullframe", "tối giản", "bạc"],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 10,
    sold: 5,
    rating: 5.0,
    numReviews: 3,
    featured: false,
    specs: [
      { name: "Cảm biến", value: "Full-Frame 24.2 MP" },
      { name: "Quay video", value: "4K 60fps, 10-bit 4:2:2" },
      { name: "Hệ thống lấy nét", value: "AI Tracking, 759 điểm AF" },
      { name: "Màn hình", value: "3.0 inch cảm ứng xoay lật" },
      { name: "Kết nối", value: "Wi-Fi 6, Bluetooth, USB-C" }
    ]
  },
  {
    name: "Bàn phím cơ AI Master",
    description: "Bàn phím cơ siêu nhạy với switch tùy chỉnh. Có tích hợp thuật toán AI để học thói quen gõ phím, giảm thiểu lỗi sai chính tả.",
    price: 2100000,
    originalPrice: 2500000,
    category: "Phụ kiện",
    tags: ["keyboard", "mechanical", "gaming", "accessory", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 150,
    sold: 80,
    rating: 4.5,
    numReviews: 45,
    featured: false,
    specs: [
      { name: "Kiểu dáng", value: "TKL (Tenkeyless) 87 phím" },
      { name: "Switch", value: "Tích hợp switch quang học AI-Optic" },
      { name: "Keycap", value: "PBT Double-shot" },
      { name: "Kết nối", value: "Có dây Type-C & Bluetooth & 2.4G" },
      { name: "Đèn nền", value: "RGB 16.8 triệu màu" }
    ]
  },
  {
    name: "Màn hình cong UltraWide 34 inch",
    description: "Màn hình tỷ lệ 21:9 dành cho công việc đa nhiệm. Hình ảnh siêu thực, tích hợp chế độ bảo vệ mắt thông minh nhận diện thời gian sử dụng.",
    price: 15000000,
    originalPrice: 16500000,
    category: "Màn hình",
    tags: ["monitor", "ultrawide", "display", "gaming", "work", "formal", "streetwear"],
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 25,
    sold: 60,
    rating: 4.8,
    numReviews: 24,
    featured: true,
    specs: [
      { name: "Kích thước", value: "34 inch (21:9 Curved)" },
      { name: "Độ phân giải", value: "WQHD (3440 x 1440)" },
      { name: "Tần số quét", value: "120 Hz" },
      { name: "Gam màu", value: "98% DCI-P3" },
      { name: "Cổng kết nối", value: "HDMI 2.1, DisplayPort 1.4, USB-C" }
    ]
  },
  {
    name: "Chuột không dây Ergonomic AI",
    description: "Chuột làm việc công thái học, phom dáng tự nhiên giúp cổ tay thoải mái cả ngày dài. Cảm biến laser siêu nhạy.",
    price: 850000,
    originalPrice: 1200000,
    category: "Phụ kiện",
    tags: ["mouse", "wireless", "ergonomic", "accessory", "tối giản", "formal"],
    image: "https://images.unsplash.com/photo-1527864550474-290076c4ca96?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1527864550474-290076c4ca96?auto=format&fit=crop&q=80&w=800"
    ],
    stock: 300,
    sold: 1200,
    rating: 4.4,
    numReviews: 350,
    featured: false,
    specs: [
      { name: "Thiết kế", value: "Công thái học dọc (Vertical)" },
      { name: "Cảm biến", value: "Quang học Laser, tối đa 4000 DPI" },
      { name: "Kết nối", value: "Bluetooth / Đầu thu USB" },
      { name: "Pin", value: "Sạc Type-C, dùng 30 ngày/lần" }
    ]
  },

  // ── ĐIỆN THOẠI ────────────────────────────────────────────────────────────
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Flagship Android cao cấp nhất 2024 với bút S-Pen tích hợp, camera 200MP zoom quang 10x, chip Snapdragon 8 Gen 3 mạnh mẽ.",
    price: 28000000,
    originalPrice: 31000000,
    category: "Điện thoại",
    tags: ["smartphone", "samsung", "flagship", "spen", "camera", "formal", "casual"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"],
    stock: 40,
    sold: 95,
    rating: 4.9,
    numReviews: 62,
    featured: true,
    specs: [
      { name: "Màn hình", value: "6.8 inch Dynamic AMOLED 2X 120Hz" },
      { name: "Vi xử lý", value: "Snapdragon 8 Gen 3" },
      { name: "RAM", value: "12 GB" },
      { name: "Bộ nhớ trong", value: "256 GB / 512 GB / 1 TB" },
      { name: "Camera chính", value: "200MP + 12MP + 50MP + 10MP" },
      { name: "Pin & Sạc", value: "5000 mAh, 45W" }
    ]
  },
  {
    name: "iPhone 15 Pro Max",
    description: "iPhone mạnh nhất lịch sử với chip A17 Pro, khung titan, cổng USB-C 3.0, camera 48MP khẩu độ f/1.78 quay ProRes 4K.",
    price: 34000000,
    originalPrice: 36000000,
    category: "Điện thoại",
    tags: ["iphone", "apple", "flagship", "ios", "titanium", "tối giản", "formal", "bạc"],
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800"],
    stock: 35,
    sold: 210,
    rating: 4.9,
    numReviews: 134,
    featured: true,
    specs: [
      { name: "Màn hình", value: "6.7 inch Super Retina XDR ProMotion 120Hz" },
      { name: "Vi xử lý", value: "Apple A17 Pro (3nm)" },
      { name: "RAM", value: "8 GB" },
      { name: "Bộ nhớ trong", value: "256 GB / 512 GB / 1 TB" },
      { name: "Camera chính", value: "48MP Main + 12MP Ultra + 12MP Tele 5x" },
      { name: "Pin & Sạc", value: "4422 mAh, 27W MagSafe" }
    ]
  },
  {
    name: "Xiaomi 14 Ultra",
    description: "Điện thoại nhiếp ảnh co-engineering với Leica, ống kính biến tiêu cự thực sự, cảm biến Sony LYT-900 1 inch cực đại.",
    price: 23000000,
    originalPrice: 26000000,
    category: "Điện thoại",
    tags: ["smartphone", "xiaomi", "leica", "camera", "flagship", "casual"],
    image: "https://images.unsplash.com/photo-1585790050230-5dd98dc34635?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1585790050230-5dd98dc34635?auto=format&fit=crop&q=80&w=800"],
    stock: 55,
    sold: 48,
    rating: 4.8,
    numReviews: 29,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.73 inch LTPO AMOLED 120Hz" },
      { name: "Vi xử lý", value: "Snapdragon 8 Gen 3" },
      { name: "RAM", value: "16 GB LPDDR5X" },
      { name: "Bộ nhớ trong", value: "512 GB UFS 4.0" },
      { name: "Camera chính", value: "50MP Sony LYT-900 1-inch + 50MP + 50MP" },
      { name: "Pin & Sạc", value: "5300 mAh, 90W + 80W không dây" }
    ]
  },
  {
    name: "OPPO Find X7 Pro",
    description: "Siêu phẩm OPPO với camera Hasselblad, sạc siêu tốc 100W, màn hình LTPO 120Hz cong tràn viền sang trọng.",
    price: 19500000,
    originalPrice: 22000000,
    category: "Điện thoại",
    tags: ["smartphone", "oppo", "hasselblad", "camera", "fast-charge", "casual"],
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800"],
    stock: 60,
    sold: 73,
    rating: 4.7,
    numReviews: 41,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.82 inch LTPO AMOLED 120Hz" },
      { name: "Vi xử lý", value: "Dimensity 9300" },
      { name: "RAM", value: "16 GB" },
      { name: "Bộ nhớ trong", value: "256 GB" },
      { name: "Camera chính", value: "50MP Hasselblad + 64MP Tele + 50MP Ultra" },
      { name: "Pin & Sạc", value: "5000 mAh, 100W SuperVOOC" }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Android thuần chất với chip Tensor G3 của Google, tính năng AI độc quyền: Magic Eraser, Best Take, Audio Magic Eraser.",
    price: 22000000,
    originalPrice: 24500000,
    category: "Điện thoại",
    tags: ["smartphone", "google", "pixel", "ai", "android", "tối giản", "casual"],
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800"],
    stock: 45,
    sold: 56,
    rating: 4.7,
    numReviews: 37,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.7 inch LTPO OLED 120Hz" },
      { name: "Vi xử lý", value: "Google Tensor G3" },
      { name: "RAM", value: "12 GB" },
      { name: "Bộ nhớ trong", value: "128 GB / 256 GB / 1 TB" },
      { name: "Camera chính", value: "50MP + 48MP Ultra + 48MP Tele 5x" },
      { name: "Pin & Sạc", value: "5050 mAh, 30W" }
    ]
  },
  {
    name: "Vivo X100 Pro",
    description: "Camera phone cao cấp với cảm biến ZEISS, zoom quang 4.3x chống rung OIS, sạc siêu tốc 100W FlashCharge.",
    price: 20500000,
    originalPrice: 23000000,
    category: "Điện thoại",
    tags: ["smartphone", "vivo", "zeiss", "camera", "pro", "casual"],
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&q=80&w=800"],
    stock: 70,
    sold: 32,
    rating: 4.6,
    numReviews: 18,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.78 inch AMOLED 120Hz" },
      { name: "Vi xử lý", value: "Dimensity 9300" },
      { name: "RAM", value: "16 GB" },
      { name: "Bộ nhớ trong", value: "256 GB" },
      { name: "Camera chính", value: "50MP ZEISS + 50MP Ultra + 64MP Tele" },
      { name: "Pin & Sạc", value: "5400 mAh, 100W + 50W không dây" }
    ]
  },
  {
    name: "OnePlus 12",
    description: "Flagship killer với camera Hasselblad, sạc 100W SUPERVOOC, màn hình ProXDR mượt mà và hiệu năng vượt trội tầm giá.",
    price: 18000000,
    originalPrice: 20000000,
    category: "Điện thoại",
    tags: ["smartphone", "oneplus", "flagship", "fast-charge", "casual", "streetwear"],
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
    sold: 67,
    rating: 4.6,
    numReviews: 44,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.82 inch LTPO AMOLED 120Hz" },
      { name: "Vi xử lý", value: "Snapdragon 8 Gen 3" },
      { name: "RAM", value: "12 GB / 16 GB" },
      { name: "Bộ nhớ trong", value: "256 GB / 512 GB" },
      { name: "Camera chính", value: "50MP Hasselblad + 48MP + 64MP Tele" },
      { name: "Pin & Sạc", value: "5400 mAh, 100W SUPERVOOC" }
    ]
  },
  {
    name: "Realme GT 6",
    description: "Smartphone gaming giá tốt với chip Snapdragon 8s Gen 3, tản nhiệt VC lớn, màn hình AMOLED 120Hz sáng 6000 nits.",
    price: 13500000,
    originalPrice: 15000000,
    category: "Điện thoại",
    tags: ["smartphone", "realme", "gaming", "mid-range", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&q=80&w=800"],
    stock: 120,
    sold: 145,
    rating: 4.5,
    numReviews: 88,
    featured: false,
    specs: [
      { name: "Màn hình", value: "6.78 inch AMOLED 120Hz, 6000 nits" },
      { name: "Vi xử lý", value: "Snapdragon 8s Gen 3" },
      { name: "RAM", value: "12 GB" },
      { name: "Bộ nhớ trong", value: "256 GB" },
      { name: "Camera chính", value: "50MP OIS + 8MP Ultra + 2MP Macro" },
      { name: "Pin & Sạc", value: "5500 mAh, 120W SUPERVOOC" }
    ]
  },

  // ── LAPTOP ────────────────────────────────────────────────────────────────
  {
    name: "MacBook Air M3 15 inch",
    description: "Laptop mỏng nhẹ hiệu năng cao với chip Apple M3, màn hình Liquid Retina 15.3 inch sắc nét, pin bền 18 giờ.",
    price: 32000000,
    originalPrice: 34000000,
    category: "Laptop",
    tags: ["laptop", "apple", "macbook", "m3", "macos", "tối giản", "bạc"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
    sold: 88,
    rating: 4.9,
    numReviews: 56,
    featured: true,
    specs: [
      { name: "CPU", value: "Apple M3 8-core" },
      { name: "RAM", value: "8 GB / 16 GB Unified Memory" },
      { name: "Ổ cứng", value: "256 GB / 512 GB SSD" },
      { name: "Màn hình", value: "15.3 inch Liquid Retina 2880×1864" },
      { name: "Thời lượng pin", value: "Tối đa 18 giờ" },
      { name: "Trọng lượng", value: "1.51 kg" }
    ]
  },
  {
    name: "Dell XPS 15 OLED",
    description: "Laptop cao cấp dành cho chuyên gia với màn hình OLED 3.5K chuẩn màu tuyệt đối, hiệu năng Intel i9 + RTX 4070.",
    price: 42000000,
    originalPrice: 46000000,
    category: "Laptop",
    tags: ["laptop", "dell", "xps", "oled", "creator", "tối giản", "formal", "bạc"],
    image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
    sold: 22,
    rating: 4.8,
    numReviews: 15,
    featured: false,
    specs: [
      { name: "CPU", value: "Intel Core i9-13900H" },
      { name: "RAM", value: "32 GB DDR5" },
      { name: "Ổ cứng", value: "1 TB PCIe Gen4 SSD" },
      { name: "Card đồ họa", value: "NVIDIA RTX 4070 8GB" },
      { name: "Màn hình", value: "15.6 inch OLED 3.5K 60Hz 100% DCI-P3" },
      { name: "Trọng lượng", value: "1.86 kg" }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G16",
    description: "Laptop gaming mỏng nhẹ cao cấp nhất của ASUS ROG với AMD Ryzen 9 + RTX 4090, màn hình QHD 240Hz tần số cao.",
    price: 55000000,
    originalPrice: 60000000,
    category: "Laptop",
    tags: ["laptop", "asus", "rog", "gaming", "rtx4090", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800"],
    stock: 10,
    sold: 8,
    rating: 4.9,
    numReviews: 7,
    featured: true,
    specs: [
      { name: "CPU", value: "AMD Ryzen 9 8945HS" },
      { name: "RAM", value: "32 GB DDR5 5600MHz" },
      { name: "Ổ cứng", value: "2 TB PCIe Gen4 SSD" },
      { name: "Card đồ họa", value: "NVIDIA RTX 4090 16GB" },
      { name: "Màn hình", value: "16 inch QHD+ 240Hz 100% DCI-P3" },
      { name: "Trọng lượng", value: "1.95 kg" }
    ]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    description: "Laptop doanh nhân huyền thoại, siêu mỏng nhẹ chỉ 1.12kg, bàn phím thoải mái nhất phân khúc, bảo mật đa lớp.",
    price: 38000000,
    originalPrice: 42000000,
    category: "Laptop",
    tags: ["laptop", "lenovo", "thinkpad", "business", "ultrabook", "formal", "đen"],
    image: "https://images.unsplash.com/photo-1541807084-5c52e6e76cf3?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1541807084-5c52e6e76cf3?auto=format&fit=crop&q=80&w=800"],
    stock: 20,
    sold: 31,
    rating: 4.8,
    numReviews: 19,
    featured: false,
    specs: [
      { name: "CPU", value: "Intel Core i7-1365U vPro" },
      { name: "RAM", value: "16 GB LPDDR5" },
      { name: "Ổ cứng", value: "512 GB PCIe Gen4 SSD" },
      { name: "Màn hình", value: "14 inch IPS 2.8K 120Hz" },
      { name: "Thời lượng pin", value: "Tối đa 15 giờ" },
      { name: "Trọng lượng", value: "1.12 kg" }
    ]
  },
  {
    name: "HP Spectre x360 14",
    description: "Laptop 2-in-1 cao cấp với màn hình OLED cảm ứng gập 360 độ, thiết kế kim cương sang trọng, hiệu năng Intel Evo.",
    price: 33000000,
    originalPrice: 36000000,
    category: "Laptop",
    tags: ["laptop", "hp", "spectre", "2in1", "oled", "convertible", "formal", "tối giản", "bạc"],
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800"],
    stock: 18,
    sold: 24,
    rating: 4.7,
    numReviews: 16,
    featured: false,
    specs: [
      { name: "CPU", value: "Intel Core Ultra 7 155H" },
      { name: "RAM", value: "16 GB LPDDR5x" },
      { name: "Ổ cứng", value: "1 TB PCIe Gen4 SSD" },
      { name: "Màn hình", value: "14 inch 2.8K OLED cảm ứng 120Hz" },
      { name: "Thời lượng pin", value: "Tối đa 17 giờ" },
      { name: "Trọng lượng", value: "1.36 kg" }
    ]
  },
  {
    name: "MSI Titan GT77 HX",
    description: "Laptop gaming siêu khủng dành cho game thủ hardcore, không thỏa hiệp về hiệu năng với màn hình 4K 144Hz.",
    price: 65000000,
    originalPrice: 72000000,
    category: "Laptop",
    tags: ["laptop", "msi", "gaming", "titan", "4k", "desktop-replacement", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800"],
    stock: 5,
    sold: 3,
    rating: 4.9,
    numReviews: 4,
    featured: false,
    specs: [
      { name: "CPU", value: "Intel Core i9-13980HX" },
      { name: "RAM", value: "64 GB DDR5 4800MHz" },
      { name: "Ổ cứng", value: "2 TB PCIe Gen4 × 2 (RAID 0)" },
      { name: "Card đồ họa", value: "NVIDIA RTX 4090 16GB 175W" },
      { name: "Màn hình", value: "17.3 inch 4K 144Hz Mini LED" },
      { name: "Trọng lượng", value: "3.3 kg" }
    ]
  },
  {
    name: "Acer Swift Go 14",
    description: "Ultrabook mỏng nhẹ cho sinh viên và dân văn phòng, Intel Core Ultra tiết kiệm điện, màn hình OLED 2.8K đẹp mắt.",
    price: 19000000,
    originalPrice: 21000000,
    category: "Laptop",
    tags: ["laptop", "acer", "swift", "ultrabook", "student", "oled", "tối giản", "casual"],
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800"],
    stock: 40,
    sold: 62,
    rating: 4.5,
    numReviews: 38,
    featured: false,
    specs: [
      { name: "CPU", value: "Intel Core Ultra 5 125H" },
      { name: "RAM", value: "16 GB LPDDR5x" },
      { name: "Ổ cứng", value: "512 GB PCIe Gen4 SSD" },
      { name: "Màn hình", value: "14 inch 2.8K OLED 90Hz" },
      { name: "Thời lượng pin", value: "Tối đa 12 giờ" },
      { name: "Trọng lượng", value: "1.25 kg" }
    ]
  },
  {
    name: "ASUS Vivobook 15 OLED",
    description: "Laptop phổ thông với màn hình OLED cao cấp hiếm có tầm giá, AMD Ryzen 5 đủ mạnh cho học tập và làm việc hàng ngày.",
    price: 14500000,
    originalPrice: 16000000,
    category: "Laptop",
    tags: ["laptop", "asus", "vivobook", "oled", "student", "amd", "casual"],
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800"],
    stock: 60,
    sold: 110,
    rating: 4.4,
    numReviews: 72,
    featured: false,
    specs: [
      { name: "CPU", value: "AMD Ryzen 5 7530U" },
      { name: "RAM", value: "16 GB DDR4" },
      { name: "Ổ cứng", value: "512 GB PCIe SSD" },
      { name: "Màn hình", value: "15.6 inch FHD OLED 60Hz" },
      { name: "Thời lượng pin", value: "Tối đa 10 giờ" },
      { name: "Trọng lượng", value: "1.7 kg" }
    ]
  },

  // ── MÀN HÌNH ─────────────────────────────────────────────────────────────
  {
    name: "LG 27\" 4K OLED Flex",
    description: "Màn hình OLED 4K đầu tiên của LG cho game thủ, có thể điều chỉnh độ cong từ phẳng đến 900R, tốc độ 240Hz.",
    price: 28000000,
    originalPrice: 32000000,
    category: "Màn hình",
    tags: ["monitor", "oled", "4k", "gaming", "curved", "240hz", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1593640408182-31c57e0a1e6e?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1593640408182-31c57e0a1e6e?auto=format&fit=crop&q=80&w=800"],
    stock: 12,
    sold: 18,
    rating: 4.9,
    numReviews: 11,
    featured: true,
    specs: [
      { name: "Kích thước", value: "27 inch (Curved 900R ~ Flat)" },
      { name: "Độ phân giải", value: "4K UHD (3840 × 2160)" },
      { name: "Tần số quét", value: "240 Hz" },
      { name: "Tấm nền", value: "OLED, thời gian phản hồi 0.03ms" },
      { name: "Cổng kết nối", value: "HDMI 2.1, DisplayPort 1.4, USB-C" }
    ]
  },
  {
    name: "Samsung Odyssey G7 32\"",
    description: "Màn hình gaming cong VA 32 inch với tần số 165Hz và độ cong 1000R mãnh liệt, HDR600 cho hình ảnh rực rỡ.",
    price: 11500000,
    originalPrice: 13000000,
    category: "Màn hình",
    tags: ["monitor", "samsung", "gaming", "curved", "165hz", "va", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1547394765-185f53c50485?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1547394765-185f53c50485?auto=format&fit=crop&q=80&w=800"],
    stock: 30,
    sold: 45,
    rating: 4.7,
    numReviews: 28,
    featured: false,
    specs: [
      { name: "Kích thước", value: "32 inch (1000R Curved)" },
      { name: "Độ phân giải", value: "QHD (2560 × 1440)" },
      { name: "Tần số quét", value: "165 Hz" },
      { name: "Tấm nền", value: "VA, 1ms (MPRT)" },
      { name: "Cổng kết nối", value: "HDMI 2.0, DisplayPort 1.4, USB Hub" }
    ]
  },
  {
    name: "ASUS ProArt PA279CRV",
    description: "Màn hình chuyên đồ họa 27 inch 4K IPS với độ chính xác màu Delta E < 1, calibrated factory, chuẩn Calman Verified.",
    price: 16000000,
    originalPrice: 18000000,
    category: "Màn hình",
    tags: ["monitor", "asus", "proart", "4k", "color-accurate", "creator", "tối giản", "formal"],
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800"],
    stock: 20,
    sold: 14,
    rating: 4.8,
    numReviews: 9,
    featured: false,
    specs: [
      { name: "Kích thước", value: "27 inch" },
      { name: "Độ phân giải", value: "4K UHD (3840 × 2160)" },
      { name: "Tấm nền", value: "IPS, 60Hz" },
      { name: "Gam màu", value: "100% sRGB, 99% DCI-P3, Delta E < 1" },
      { name: "Cổng kết nối", value: "HDMI 2.0, DisplayPort 1.4, USB-C 96W PD" }
    ]
  },
  {
    name: "Dell 27\" Gaming G2724D",
    description: "Màn hình gaming IPS 27 inch QHD 165Hz giá cực tốt, AMD FreeSync Premium, thời gian phản hồi nhanh 1ms.",
    price: 7500000,
    originalPrice: 8500000,
    category: "Màn hình",
    tags: ["monitor", "dell", "gaming", "ips", "165hz", "freesync", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=800"],
    stock: 50,
    sold: 78,
    rating: 4.6,
    numReviews: 51,
    featured: false,
    specs: [
      { name: "Kích thước", value: "27 inch" },
      { name: "Độ phân giải", value: "QHD (2560 × 1440)" },
      { name: "Tần số quét", value: "165 Hz" },
      { name: "Tấm nền", value: "IPS, 1ms (GtG)" },
      { name: "Cổng kết nối", value: "HDMI 2.0 × 2, DisplayPort 1.2, USB Hub" }
    ]
  },

  // ── MÁY ẢNH ──────────────────────────────────────────────────────────────
  {
    name: "Canon EOS R6 Mark II",
    description: "Mirrorless full-frame chuyên chụp thể thao và video, lấy nét chủ đề AI cực nhanh, quay RAW 4K 60fps.",
    price: 52000000,
    originalPrice: 56000000,
    category: "Máy ảnh",
    tags: ["camera", "canon", "mirrorless", "fullframe", "video", "sport", "formal", "bạc"],
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764649?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764649?auto=format&fit=crop&q=80&w=800"],
    stock: 8,
    sold: 12,
    rating: 4.9,
    numReviews: 8,
    featured: true,
    specs: [
      { name: "Cảm biến", value: "Full-Frame 24.2 MP CMOS" },
      { name: "Quay video", value: "4K 60fps RAW, 6K Oversampled" },
      { name: "Hệ thống lấy nét", value: "Dual Pixel CMOS AF II, 1053 vùng AF" },
      { name: "Tốc độ chụp", value: "40fps (điện tử), 12fps (cơ)" },
      { name: "Kết nối", value: "Wi-Fi 6, Bluetooth, USB-C, HDMI micro" }
    ]
  },
  {
    name: "Fujifilm X-T5",
    description: "Máy ảnh APS-C 40MP độ phân giải cực cao với tính năng Pixel Shift Multi Shot cho ảnh 160MP siêu chi tiết.",
    price: 38000000,
    originalPrice: 42000000,
    category: "Máy ảnh",
    tags: ["camera", "fujifilm", "apsc", "retro", "photography", "vintage", "bạc"],
    image: "https://images.unsplash.com/photo-1617005082490-b4b1c17c58b1?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1617005082490-b4b1c17c58b1?auto=format&fit=crop&q=80&w=800"],
    stock: 12,
    sold: 9,
    rating: 4.8,
    numReviews: 6,
    featured: false,
    specs: [
      { name: "Cảm biến", value: "APS-C 40.2 MP X-Trans CMOS 5 HR" },
      { name: "Quay video", value: "6.2K 30fps, 4K 60fps" },
      { name: "Hệ thống lấy nét", value: "Phase Detection + Contrast AF" },
      { name: "Chống rung", value: "IBIS 7 stops" },
      { name: "Màn hình", value: "3.0 inch cảm ứng xoay lật" }
    ]
  },
  {
    name: "GoPro Hero 12 Black",
    description: "Action cam siêu bền chịu nước 10m, quay 5.3K 60fps HDR, chống rung HyperSmooth 6.0 cực mượt mà.",
    price: 10500000,
    originalPrice: 12000000,
    category: "Máy ảnh",
    tags: ["camera", "gopro", "action", "waterproof", "sport", "casual", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
    sold: 195,
    rating: 4.7,
    numReviews: 128,
    featured: false,
    specs: [
      { name: "Độ phân giải video", value: "5.3K 60fps, 4K 120fps" },
      { name: "Chống rung", value: "HyperSmooth 6.0" },
      { name: "Chống nước", value: "10 mét (không cần case)" },
      { name: "Màn hình", value: "Trước 1.4 inch + Sau 2.27 inch" },
      { name: "Kết nối", value: "Bluetooth, Wi-Fi, USB-C" }
    ]
  },
  {
    name: "DJI Osmo Pocket 3",
    description: "Máy quay gimbal pocket 3 trục nhỏ gọn, cảm biến 1 inch, quay 4K 120fps cho content creator chuyên nghiệp.",
    price: 11000000,
    originalPrice: 12500000,
    category: "Máy ảnh",
    tags: ["camera", "dji", "gimbal", "vlog", "pocket", "creator", "tối giản", "casual"],
    image: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&q=80&w=800"],
    stock: 45,
    sold: 88,
    rating: 4.8,
    numReviews: 54,
    featured: false,
    specs: [
      { name: "Cảm biến", value: "1 inch CMOS, f/2.0" },
      { name: "Quay video", value: "4K 120fps, 4K HDR 60fps" },
      { name: "Gimbal", value: "3 trục, góc quay dọc 290°" },
      { name: "Màn hình", value: "2 inch cảm ứng" },
      { name: "Thời lượng pin", value: "166 phút" }
    ]
  },
  {
    name: "Sony ZV-E10 II",
    description: "Máy ảnh vlog APS-C chuyên dành cho YouTuber và streamer, lật màn hình toàn phần, micro chỉ hướng xịn.",
    price: 19000000,
    originalPrice: 21000000,
    category: "Máy ảnh",
    tags: ["camera", "sony", "vlog", "youtube", "apsc", "creator", "casual"],
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
    sold: 41,
    rating: 4.6,
    numReviews: 27,
    featured: false,
    specs: [
      { name: "Cảm biến", value: "APS-C 26 MP Exmor R BSI" },
      { name: "Quay video", value: "4K 60fps, Full HD 120fps" },
      { name: "Hệ thống lấy nét", value: "AI Phase Detection, nhận diện người/vật" },
      { name: "Màn hình", value: "3 inch xoay lật toàn phần" },
      { name: "Âm thanh", value: "Microphone 3 hướng tích hợp + jack 3.5mm" }
    ]
  },

  // ── ÂM THANH ─────────────────────────────────────────────────────────────
  {
    name: "Sony WH-1000XM5",
    description: "Tai nghe over-ear chống ồn số 1 thế giới, 8 micro AI lọc tiếng ồn, âm thanh LDAC Hi-Res 30 giờ pin.",
    price: 7500000,
    originalPrice: 8500000,
    category: "Âm thanh",
    tags: ["headphone", "sony", "anc", "wireless", "hi-res", "tối giản", "casual", "đen"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
    sold: 320,
    rating: 4.9,
    numReviews: 245,
    featured: true,
    specs: [
      { name: "Kết nối", value: "Bluetooth 5.2, Multipoint" },
      { name: "Chống ồn", value: "ANC với 8 microphone AI" },
      { name: "Codec", value: "LDAC, AAC, SBC" },
      { name: "Pin", value: "30 giờ (ANC on), 40 giờ (ANC off)" },
      { name: "Trọng lượng", value: "250 g" }
    ]
  },
  {
    name: "Apple AirPods Pro 2",
    description: "True wireless cao cấp của Apple với chip H2, chống ồn Adaptive ANC tự động, tích hợp trợ lý Siri thông minh.",
    price: 5800000,
    originalPrice: 6500000,
    category: "Âm thanh",
    tags: ["earbuds", "apple", "airpods", "anc", "ios", "tối giản", "casual", "trắng"],
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800"],
    stock: 150,
    sold: 520,
    rating: 4.8,
    numReviews: 389,
    featured: true,
    specs: [
      { name: "Chip", value: "Apple H2" },
      { name: "Chống ồn", value: "Adaptive ANC, Transparency Mode" },
      { name: "Pin", value: "6 giờ (tai nghe), 30 giờ (case)" },
      { name: "Chống nước", value: "IP54 (tai nghe), IPX4 (case)" },
      { name: "Kết nối", value: "Bluetooth 5.3, USB-C / MagSafe" }
    ]
  },
  {
    name: "Bose QuietComfort Ultra",
    description: "Tai nghe over-ear flagship mới nhất của Bose với Immersive Audio không gian 3D, chống ồn World Class.",
    price: 9500000,
    originalPrice: 10500000,
    category: "Âm thanh",
    tags: ["headphone", "bose", "anc", "wireless", "spatial-audio", "formal", "tối giản", "đen"],
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800"],
    stock: 45,
    sold: 98,
    rating: 4.8,
    numReviews: 67,
    featured: false,
    specs: [
      { name: "Kết nối", value: "Bluetooth 5.3, Multipoint 2 thiết bị" },
      { name: "Chống ồn", value: "QuietComfort ANC World Class" },
      { name: "Âm thanh", value: "Immersive Audio 3D (Spatial)" },
      { name: "Pin", value: "24 giờ (ANC on)" },
      { name: "Trọng lượng", value: "253 g" }
    ]
  },
  {
    name: "JBL Charge 5",
    description: "Loa Bluetooth di động chống nước IP67, thời lượng pin 20 giờ, âm thanh JBL Pro mạnh mẽ và có thể sạc cho thiết bị khác.",
    price: 2800000,
    originalPrice: 3500000,
    category: "Âm thanh",
    tags: ["speaker", "jbl", "bluetooth", "waterproof", "portable", "casual", "streetwear"],
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800"],
    stock: 200,
    sold: 680,
    rating: 4.7,
    numReviews: 412,
    featured: false,
    specs: [
      { name: "Công suất", value: "40W RMS" },
      { name: "Kết nối", value: "Bluetooth 5.1, PartyBoost, USB-C" },
      { name: "Chống nước/bụi", value: "IP67" },
      { name: "Pin", value: "20 giờ, sạc powerbank cho thiết bị khác" },
      { name: "Trọng lượng", value: "960 g" }
    ]
  },
  {
    name: "Sennheiser Momentum 4 Wireless",
    description: "Tai nghe over-ear cao cấp của Sennheiser với âm thanh audiophile trung thực, ANC thông minh và pin 60 giờ kỷ lục.",
    price: 8000000,
    originalPrice: 9000000,
    category: "Âm thanh",
    tags: ["headphone", "sennheiser", "audiophile", "anc", "wireless", "formal", "tối giản", "đen"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"],
    stock: 35,
    sold: 55,
    rating: 4.8,
    numReviews: 38,
    featured: false,
    specs: [
      { name: "Driver", value: "42mm, tần số 6Hz - 22kHz" },
      { name: "Kết nối", value: "Bluetooth 5.2, aptX Adaptive" },
      { name: "Chống ồn", value: "ANC tự động thích nghi" },
      { name: "Pin", value: "60 giờ (ANC off), 40 giờ (ANC on)" },
      { name: "Trọng lượng", value: "293 g" }
    ]
  },
  {
    name: "Sonos Era 300",
    description: "Loa thông minh không gian Spatial Audio Dolby Atmos với 6 driver định hướng, hỗ trợ Apple AirPlay 2 và Spotify Connect.",
    price: 10000000,
    originalPrice: 11500000,
    category: "Âm thanh",
    tags: ["speaker", "sonos", "smart", "spatial-audio", "dolby-atmos", "tối giản", "formal", "trắng"],
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800"],
    stock: 20,
    sold: 14,
    rating: 4.7,
    numReviews: 10,
    featured: false,
    specs: [
      { name: "Driver", value: "6 driver (2 tweeter + 4 mid-woofer)" },
      { name: "Âm thanh", value: "Spatial Audio Dolby Atmos" },
      { name: "Kết nối", value: "Wi-Fi, Bluetooth, AirPlay 2, Ethernet" },
      { name: "Điều khiển", value: "Sonos App, Voice Control (Alexa/Google)" },
      { name: "Màu sắc", value: "White / Black" }
    ]
  },

  // ── ĐỒNG HỒ THÔNG MINH ───────────────────────────────────────────────────
  {
    name: "Apple Watch Series 9",
    description: "Đồng hồ thông minh hàng đầu với màn hình Always-On Retina, tính năng Double Tap điều khiển bằng cử chỉ, chip S9 AI.",
    price: 10500000,
    originalPrice: 12000000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "apple", "smartwatch", "health", "ios", "casual", "formal", "bạc"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"],
    stock: 70,
    sold: 280,
    rating: 4.9,
    numReviews: 198,
    featured: true,
    specs: [
      { name: "Màn hình", value: "Always-On Retina LTPO OLED" },
      { name: "Chip", value: "Apple S9 SiP" },
      { name: "Cảm biến sức khỏe", value: "ECG, SpO2, Nhiệt độ da, Tim mạch" },
      { name: "Chống nước", value: "WR50, Swimming OK" },
      { name: "Pin", value: "18 giờ, 36 giờ Low Power Mode" }
    ]
  },
  {
    name: "Samsung Galaxy Watch 7",
    description: "Smartwatch Android cao cấp với chip 3nm tiết kiệm điện, phân tích giấc ngủ AI, đo đường huyết không xâm lấn.",
    price: 7500000,
    originalPrice: 8500000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "samsung", "android", "health", "glucose", "casual", "đen"],
    image: "https://images.unsplash.com/photo-1434493789543-fc5b38c47aee?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1434493789543-fc5b38c47aee?auto=format&fit=crop&q=80&w=800"],
    stock: 55,
    sold: 142,
    rating: 4.7,
    numReviews: 89,
    featured: false,
    specs: [
      { name: "Màn hình", value: "1.3 inch Super AMOLED 432ppi" },
      { name: "Chip", value: "Exynos W1000 (3nm)" },
      { name: "Cảm biến sức khỏe", value: "ECG, SpO2, BioActive Sensor" },
      { name: "Chống nước", value: "5ATM + IP68, MIL-STD-810H" },
      { name: "Pin", value: "40 giờ (thường), 130 giờ (tiết kiệm)" }
    ]
  },
  {
    name: "Garmin Fenix 7 Pro Solar",
    description: "Đồng hồ GPS cao cấp cho vận động viên, sạc bằng năng lượng mặt trời, bản đồ địa hình tích hợp, pin 22 ngày.",
    price: 18000000,
    originalPrice: 20000000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "garmin", "outdoor", "gps", "sports", "solar", "casual", "streetwear", "bạc"],
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
    sold: 22,
    rating: 4.9,
    numReviews: 15,
    featured: false,
    specs: [
      { name: "Màn hình", value: "1.3 inch MIP Transflective + Solar" },
      { name: "GPS", value: "Multi-GNSS (GPS + GLONASS + Galileo)" },
      { name: "Pin", value: "22 ngày (smartwatch), 89 ngày (expedice)" },
      { name: "Chống nước", value: "100 mét (10 ATM)" },
      { name: "Chất liệu", value: "Vỏ và bezel titanium" }
    ]
  },
  {
    name: "Amazfit GTR 4",
    description: "Smartwatch giá tốt với GPS đa tần dual-band, đo SpO2 và nhịp tim liên tục, 150+ chế độ thể thao, pin 14 ngày.",
    price: 3200000,
    originalPrice: 4000000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "amazfit", "gps", "fitness", "budget", "casual", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&q=80&w=800"],
    stock: 120,
    sold: 350,
    rating: 4.5,
    numReviews: 220,
    featured: false,
    specs: [
      { name: "Màn hình", value: "1.43 inch AMOLED 466×466" },
      { name: "GPS", value: "Dual-band L1+L5, 6 hệ thống vệ tinh" },
      { name: "Cảm biến", value: "Nhịp tim, SpO2, Stress, Nhiệt độ" },
      { name: "Chống nước", value: "5ATM" },
      { name: "Pin", value: "14 ngày sử dụng thông thường" }
    ]
  },
  {
    name: "Huawei Watch GT 4",
    description: "Đồng hồ thông minh thiết kế thời trang với mặt kính sapphire, theo dõi sức khỏe toàn diện, pin lên đến 14 ngày.",
    price: 5200000,
    originalPrice: 6000000,
    category: "Đồng hồ thông minh",
    tags: ["watch", "huawei", "smartwatch", "health", "fashion", "casual", "formal"],
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"],
    stock: 75,
    sold: 188,
    rating: 4.5,
    numReviews: 116,
    featured: false,
    specs: [
      { name: "Màn hình", value: "1.43 inch AMOLED, kính sapphire" },
      { name: "Cảm biến", value: "ECG, SpO2, Nhịp tim, Nhiệt độ da" },
      { name: "GPS", value: "GPS + GLONASS + Galileo + BeiDou" },
      { name: "Chống nước", value: "5ATM" },
      { name: "Pin", value: "14 ngày (thường), 7 ngày (Heavy Use)" }
    ]
  },

  // ── PHỤ KIỆN ──────────────────────────────────────────────────────────────
  {
    name: "Logitech MX Master 3S",
    description: "Chuột làm việc cao cấp nhất của Logitech, cuộn MagSpeed siêu nhanh, click siêu im lặng, kết nối 3 thiết bị cùng lúc.",
    price: 2200000,
    originalPrice: 2800000,
    category: "Phụ kiện",
    tags: ["mouse", "logitech", "wireless", "productivity", "silent", "tối giản", "formal", "đen"],
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800"],
    stock: 100,
    sold: 420,
    rating: 4.8,
    numReviews: 285,
    featured: false,
    specs: [
      { name: "Cảm biến", value: "Quang học 8000 DPI" },
      { name: "Kết nối", value: "Bluetooth / USB Logi Bolt — 3 thiết bị" },
      { name: "Cuộn bánh xe", value: "MagSpeed Electromagnetic (siêu nhanh)" },
      { name: "Pin", value: "Sạc USB-C, dùng 70 ngày/lần" },
      { name: "Click", value: "Siêu yên lặng (90% quieter)" }
    ]
  },
  {
    name: "iPad Pro M4 11 inch",
    description: "Máy tính bảng mỏng nhất thế giới với chip M4 siêu mạnh, màn hình Ultra Retina XDR OLED tandem, hoàn hảo cho sáng tạo.",
    price: 26000000,
    originalPrice: 28000000,
    category: "Máy tính bảng",
    tags: ["tablet", "apple", "ipad", "m4", "creator", "drawing", "tối giản", "formal", "bạc"],
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
    sold: 68,
    rating: 4.9,
    numReviews: 45,
    featured: true,
    specs: [
      { name: "Chip", value: "Apple M4 (3nm, 10-core CPU)" },
      { name: "Màn hình", value: "11 inch Ultra Retina XDR OLED Tandem" },
      { name: "RAM", value: "8 GB / 16 GB" },
      { name: "Bộ nhớ", value: "256 GB / 512 GB / 1 TB / 2 TB" },
      { name: "Kết nối", value: "Wi-Fi 6E, Bluetooth 5.3, USB-C Thunderbolt 4" }
    ]
  },
  {
    name: "Webcam Logitech StreamCam",
    description: "Webcam Full HD 60fps dành cho streamer và content creator, lấy nét AI nhận diện khuôn mặt tự động, kết nối USB-C.",
    price: 2500000,
    originalPrice: 3000000,
    category: "Camera & Webcam",
    tags: ["webcam", "logitech", "streaming", "creator", "usbc", "casual"],
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
    sold: 195,
    rating: 4.6,
    numReviews: 127,
    featured: false,
    specs: [
      { name: "Độ phân giải", value: "Full HD 1080p 60fps" },
      { name: "Ống kính", value: "78° FOV, f/2.0 autofocus AI" },
      { name: "Kết nối", value: "USB-C" },
      { name: "Chế độ", value: "Landscape (ngang) + Portrait (dọc)" },
      { name: "Microphone", value: "2 mic Stereo với lọc tiếng ồn" }
    ]
  },
  {
    name: "Hub USB-C Anker 12-in-1",
    description: "Hub đa năng 12 cổng cho laptop, hỗ trợ HDMI 4K, đọc thẻ SD/MicroSD, sạc PD 100W, USB-A 3.0 tốc độ cao.",
    price: 1200000,
    originalPrice: 1500000,
    category: "Phụ kiện",
    tags: ["hub", "anker", "usbc", "accessory", "adapter", "tối giản", "formal"],
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80&w=800"],
    stock: 250,
    sold: 860,
    rating: 4.7,
    numReviews: 540,
    featured: false,
    specs: [
      { name: "Cổng HDMI", value: "HDMI 2.0 (4K 60Hz)" },
      { name: "Cổng USB-A", value: "USB-A 3.0 × 4 (5Gbps)" },
      { name: "Sạc", value: "USB-C PD 100W (pass-through)" },
      { name: "Đọc thẻ", value: "SD + MicroSD (UHS-I)" },
      { name: "Kết nối mạng", value: "Ethernet Gigabit (RJ45)" }
    ]
  },
  {
    name: "Bàn phím không dây Keychron K8 Pro",
    description: "Bàn phím cơ tenkeyless hot-swap, switch Gateron, tương thích cả Windows và Mac, kết nối Bluetooth 5.1 đa điểm.",
    price: 2800000,
    originalPrice: 3200000,
    category: "Phụ kiện",
    tags: ["keyboard", "mechanical", "keychron", "wireless", "hotswap", "tối giản", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800"],
    stock: 90,
    sold: 230,
    rating: 4.7,
    numReviews: 152,
    featured: false,
    specs: [
      { name: "Kiểu dáng", value: "TKL 87 phím, layout chuẩn" },
      { name: "Switch", value: "Gateron G Pro 3.0 (Hot-swap)" },
      { name: "Kết nối", value: "Bluetooth 5.1 (3 thiết bị) + USB-C" },
      { name: "Tương thích", value: "Windows + macOS (keycap kép)" },
      { name: "Pin", value: "4000mAh, sạc Type-C" }
    ]
  },
  {
    name: "Tai nghe gaming HyperX Cloud Alpha",
    description: "Tai nghe gaming over-ear huyền thoại với driver kép tách biệt bass/mid-high, microphone noise-cancelling có thể tháo rời.",
    price: 1800000,
    originalPrice: 2200000,
    category: "Phụ kiện",
    tags: ["headphone", "gaming", "hyperx", "microphone", "accessory", "streetwear", "đen"],
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&q=80&w=800"],
    stock: 130,
    sold: 410,
    rating: 4.6,
    numReviews: 275,
    featured: false,
    specs: [
      { name: "Driver", value: "Dual Chamber Driver 50mm" },
      { name: "Tần số", value: "13Hz – 27,000 Hz" },
      { name: "Microphone", value: "Cardioid, có thể tháo ra" },
      { name: "Kết nối", value: "3.5mm jack (có adapter USB)" },
      { name: "Trọng lượng", value: "298 g" }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");
    
    // Clear existing data
    await Product.deleteMany();
    console.log("Cleared existing products...");
    await User.deleteMany();
    console.log("Cleared existing users...");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("✅ Sample products added successfully!");

    // Create admin account
    const admin = await User.create({
      name: "Admin",
      email: "admin@smartshop.com",
      password: "admin123456",
      role: "admin",
    });
    console.log("✅ Admin account created:");
    console.log("   Email: admin@smartshop.com");
    console.log("   Password: admin123456");

    // Create sample customers (needed for AI training - more users = better model)
    // Must pre-hash passwords because insertMany() bypasses mongoose pre-save hooks
    const hashedPassword = await bcrypt.hash("customer123456", 12);
    const sampleCustomers = [
      { name: "Nguyễn Văn A", email: "customer@smartshop.com", preferences: ["smartphone", "laptop", "ai"] },
      { name: "Trần Thị Bình", email: "binh@smartshop.com", preferences: ["watch", "headphone", "audio"] },
      { name: "Lê Minh Cường", email: "cuong@smartshop.com", preferences: ["laptop", "monitor", "accessory"] },
      { name: "Phạm Thu Dung", email: "dung@smartshop.com", preferences: ["camera", "photography"] },
      { name: "Hoàng Văn Em", email: "em@smartshop.com", preferences: ["gaming", "keyboard", "monitor"] },
      { name: "Vũ Thị Flan", email: "flan@smartshop.com", preferences: ["smartphone", "audio", "watch"] },
      { name: "Đặng Quốc Giang", email: "giang@smartshop.com", preferences: ["laptop", "ai", "work"] },
      { name: "Bùi Thị Hoa", email: "hoa@smartshop.com", preferences: ["camera", "smartphone", "photography"] },
    ];
    await User.insertMany(sampleCustomers.map(c => ({ ...c, password: hashedPassword, role: "customer" })));
    console.log(`✅ ${sampleCustomers.length} customer accounts created`);
    console.log("   Main customer: customer@smartshop.com / customer123456");

    // ── Phase 2 AI seed data ──────────────────────────────────────────────────
    console.log("\n🤖 Seeding behavioral events (seed 05)...");
    const { seedBehavioralEvents } = require("./seeds/05-behavior-history");
    await seedBehavioralEvents();

    console.log("\n📊 Seeding feature snapshots (seed 06)...");
    const { seedFeatureSnapshots } = require("./seeds/06-feature-snapshots");
    await seedFeatureSnapshots();

    console.log("\n🛒 Seeding order history (seed 07)...");
    const { seedOrders } = require("./seeds/07-orders");
    await seedOrders();

    console.log("\n🎉 All seed data completed successfully!");
    console.log("   Next: run the ML training pipeline to generate AI models.");
    process.exit();
  } catch (error) {
    console.error("Error with seeding data:", error);
    process.exit(1);
  }
};

seedData();
