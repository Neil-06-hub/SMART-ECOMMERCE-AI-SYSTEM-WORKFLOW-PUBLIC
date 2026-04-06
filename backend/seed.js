const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart-ecommerce";

const sampleProducts = [
  {
    name: "Điện thoại thông minh AI Pro 15",
    description: "Smartphone tích hợp AI tiên tiến nhất, camera 108MP chụp đêm siêu nét, chip AI xử lý mượt mà mọi tác vụ. Pin 5000mAh sạc siêu tốc.",
    price: 25000000,
    originalPrice: 28000000,
    category: "Điện thoại",
    tags: ["smartphone", "ai", "camera", "pro", "flagship"],
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
    tags: ["laptop", "creator", "oled", "ai", "render"],
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
    tags: ["watch", "smartwatch", "health", "fitness", "ai"],
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
    tags: ["headphone", "audio", "anc", "wireless", "ai"],
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
    tags: ["camera", "photography", "mirrorless", "ai", "fullframe"],
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
    tags: ["keyboard", "mechanical", "gaming", "accessory"],
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
    tags: ["monitor", "ultrawide", "display", "gaming", "work"],
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
    tags: ["mouse", "wireless", "ergonomic", "accessory"],
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
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");
    
    // Clear existing products
    await Product.deleteMany();
    console.log("Cleared existing products...");

    // Insert new products
    await Product.insertMany(sampleProducts);
    console.log("Sample products added successfully!");

    process.exit();
  } catch (error) {
    console.error("Error with seeding data:", error);
    process.exit(1);
  }
};

seedData();
