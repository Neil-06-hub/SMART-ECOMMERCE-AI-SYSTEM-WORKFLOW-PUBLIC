const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Parse JSON an toàn từ response AI (loại bỏ markdown code block nếu có)
 */
const parseJSONSafely = (text) => {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
};

/**
 * Tạo email Marketing bằng AI
 * @param {Object} data - { name, products, goal }
 * @returns {Object} - { subject, headline, content, discountCode, callToAction }
 */
const generateMarketingEmail = async ({ name, products, goal }) => {
  const model = getModel();

  const prompt = `Bạn là một chuyên gia Marketing cho hệ thống thương mại điện tử.
Hãy phân tích dữ liệu khách hàng dưới đây và trả về một chiến dịch Marketing.
Yêu cầu bắt buộc: CHỈ trả về dữ liệu định dạng JSON, không có văn bản giải thích.

Input:
- Tên khách: ${name}
- Sản phẩm đã xem/mua: ${products.join(", ")}
- Mục tiêu: ${goal}

Output format (JSON only):
{
  "subject": "Tiêu đề email hấp dẫn",
  "headline": "Câu chào mừng cá nhân hóa",
  "content": "Nội dung email thuyết phục khoảng 100 chữ tiếng Việt",
  "discountCode": "Mã giảm giá đề xuất (VD: SALE20)",
  "callToAction": "Nội dung nút bấm"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJSONSafely(text);
};

/**
 * AI phân tích dữ liệu kinh doanh cho Dashboard Admin
 */
const analyzeBusinessWithAI = async ({ recentOrders, topProducts }) => {
  const model = getModel();

  const totalRevenue = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = recentOrders.length ? totalRevenue / recentOrders.length : 0;

  const prompt = `Bạn là chuyên gia phân tích kinh doanh thương mại điện tử.
Dưới đây là dữ liệu kinh doanh của cửa hàng. Hãy phân tích và đưa ra nhận xét thông minh.
Chỉ trả về JSON, không có văn bản giải thích.

Dữ liệu:
- Tổng đơn hàng gần đây: ${recentOrders.length} đơn
- Tổng doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VNĐ
- Giá trị đơn hàng trung bình: ${Math.round(avgOrderValue).toLocaleString("vi-VN")} VNĐ
- Top sản phẩm bán chạy: ${topProducts.map((p) => `${p.name} (${p.sold} đã bán)`).join(", ")}

Output format (JSON only):
{
  "summary": "Tóm tắt tình hình kinh doanh trong 2-3 câu",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Đề xuất cải thiện 1", "Đề xuất cải thiện 2"],
  "trend": "positive | negative | neutral",
  "recommendation": "Lời khuyên chiến lược ngắn gọn"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJSONSafely(text);
};

/**
 * Tạo email Newsletter hàng tuần với sản phẩm hot
 */
const generateNewsletterEmail = async ({ userName, hotProducts }) => {
  const model = getModel();

  const productList = hotProducts.map((p) => `${p.name} - ${p.price.toLocaleString("vi-VN")}đ`).join("\n");

  const prompt = `Bạn là copywriter chuyên nghiệp cho thương mại điện tử.
Hãy tạo một email newsletter tuần này giới thiệu sản phẩm hot.
Chỉ trả về JSON, không có văn bản giải thích.

Input:
- Tên khách: ${userName || "Quý khách"}
- Sản phẩm nổi bật tuần này:
${productList}

Output format (JSON only):
{
  "subject": "Tiêu đề email newsletter hấp dẫn",
  "headline": "Tiêu đề bài viết",
  "intro": "Đoạn giới thiệu ngắn 30-50 chữ",
  "content": "Nội dung giới thiệu sản phẩm sinh động 80-100 chữ",
  "callToAction": "Nội dung nút bấm"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJSONSafely(text);
};

module.exports = { generateMarketingEmail, analyzeBusinessWithAI, generateNewsletterEmail };
