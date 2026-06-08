const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GROQ_MODEL = "llama3-8b-8192"; // Model tối ưu chi phí và tốc độ từ Groq

/**
 * Gọi Groq API để chat
 */
const callGroqAPI = async (messages, responseJson = false) => {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env");
  }

  const payload = {
    model: GROQ_MODEL,
    messages: messages,
    temperature: 0.2,
    max_tokens: 1024,
  };

  if (responseJson) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
};

/**
 * Xử lý prompt dạng JSON (như runOpenRouterJSON cũ)
 */
const runGroqJSON = async (prompt) => {
  const messages = [
    {
      role: "system",
      content: "Bạn là trợ lý cho hệ thống thương mại điện tử. Luôn trả về đúng định dạng JSON được yêu cầu, không thêm bất kỳ văn bản giải thích nào ngoài JSON. Mọi trường thông tin phải chứa nội dung cụ thể dựa trên thông tin đầu vào.",
    },
    { role: "user", content: prompt },
  ];

  try {
    const responseText = await callGroqAPI(messages, true);
    // Parse JSON safely
    const cleaned = responseText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    return {
      data: JSON.parse(cleaned),
      modelName: GROQ_MODEL,
    };
  } catch (error) {
    console.error("[Groq Service] Error in runGroqJSON:", error.message);
    throw error;
  }
};

/**
 * Tư vấn mua sắm (Chatbot AI Mode)
 */
const chatWithAI = async (messageHistory) => {
  const systemPrompt = `Bạn là Trợ lý Mua sắm AI thông minh, thân thiện của SmartShop.
Nhiệm vụ của bạn là tư vấn sản phẩm, giúp khách hàng chọn được thiết bị công nghệ (Laptop, Điện thoại, Tai nghe, Đồng hồ...) phù hợp với nhu cầu và ngân sách.

QUY TẮC QUAN TRỌNG:
1. Hãy trả lời ngắn gọn, lịch sự, thuyết phục, bằng tiếng Việt.
2. Nếu khách hàng nói muốn "gặp nhân viên", "nói chuyện với người", "gặp hỗ trợ", hoặc bất kỳ câu nào thể hiện ý định muốn kết nối với nhân viên thật, hãy trả lời họ thân thiện và kèm theo câu: "Tôi sẽ kết nối bạn với nhân viên hỗ trợ ngay bây giờ. Vui lòng đợi trong giây lát."
3. Gợi ý các sản phẩm phù hợp nếu khách hỏi.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...messageHistory,
  ];

  try {
    const reply = await callGroqAPI(messages, false);
    return reply;
  } catch (error) {
    console.error("[Groq Service] Error in chatWithAI:", error.message);
    return "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Bạn có thể thử lại sau hoặc yêu cầu gặp nhân viên hỗ trợ nhé.";
  }
};

// ── Re-implement marketing fallbacks & validation to match original gemini.service.js ──

const generateMarketingEmail = async ({ name, products, goal }) => {
  const prompt = `Bạn là chuyên gia marketing cho hệ thống thương mại điện tử.
Hãy phân tích dữ liệu khách hàng dưới đây và trả về một email marketing bằng JSON.
Chỉ trả về JSON, không thêm giải thích.

Input:
- Tên khách: ${name}
- Sản phẩm đã xem/mua: ${(products || []).join(", ")}
- Mục tiêu: ${goal}

Format output (JSON only):
{
  "subject": "Tiêu đề email hấp dẫn",
  "headline": "Câu chào mừng cá nhân hóa",
  "content": "Nội dung email thuyết phục khoảng 100 chữ tiếng Việt",
  "discountCode": "Mã giảm giá đề xuất",
  "callToAction": "Nội dung nút bấm"
}`;

  try {
    const { data } = await runGroqJSON(prompt);
    return { ...data, source: "groq" };
  } catch (error) {
    console.error("[Groq Service] Loi tao marketing email:", error.message);
    return {
      subject: `Ưu đãi đặc biệt từ SmartShop dành cho ${name}`,
      headline: `Chào ${name}!`,
      content: `Khám phá các sản phẩm nổi bật tuần này tại SmartShop và nhận ngay mã giảm giá đặc biệt mua sắm tiết kiệm hơn.`,
      discountCode: "SAVE10",
      callToAction: "Mua ngay",
      source: "fallback",
    };
  }
};

const analyzeBusinessWithAI = async ({ recentOrders, topProducts }) => {
  const totalRevenue = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = recentOrders.length ? totalRevenue / recentOrders.length : 0;

  const prompt = `Bạn là chuyên gia phân tích kinh doanh thương mại điện tử.
Dưới đây là dữ liệu kinh doanh của cửa hàng. Hãy phân tích và đưa ra nhận xét thông minh bằng JSON.
Chi trả về JSON, không có văn bản giải thích.

Dữ liệu:
- Tổng đơn hàng gần đây: ${recentOrders.length} đơn
- Tổng doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VND
- Giá trị đơn hàng trung bình: ${Math.round(avgOrderValue).toLocaleString("vi-VN")} VND
- Top sản phẩm bán chạy: ${topProducts.map((p) => `${p.name} (${p.sold} đã bán)`).join(", ")}

Format output (JSON only):
{
  "summary": "Tóm tắt tình hình kinh doanh ngắn gọn",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Đề xuất cải tiến 1", "Đề xuất cải tiến 2"],
  "trend": "positive | negative | neutral",
  "recommendation": "Lời khuyên chiến lược ngắn gọn"
}`;

  try {
    const { data } = await runGroqJSON(prompt);
    return { ...data, source: "groq" };
  } catch (error) {
    console.error("[Groq Service] Loi phan tich AI:", error.message);
    return {
      summary: `Cửa hàng ghi nhận ${recentOrders.length} đơn hàng với tổng doanh thu ${totalRevenue.toLocaleString("vi-VN")}đ.`,
      strengths: ["Hoạt động bán hàng diễn ra bình thường.", "Top sản phẩm bán chạy tiếp tục đóng góp doanh thu chính."],
      improvements: ["Mở rộng danh mục sản phẩm.", "Tối ưu hóa giá trị đơn hàng trung bình bằng các chương trình khuyến mại."],
      trend: "neutral",
      recommendation: "Theo dõi sát sao phản hồi của khách hàng và cập nhật tồn kho.",
      source: "fallback",
    };
  }
};

const generateNewsletterEmail = async ({ userName, hotProducts }) => {
  const productList = (hotProducts || [])
    .map((p) => `${p.name} - ${Number(p.price || 0).toLocaleString("vi-VN")}đ`)
    .join("\n");

  const prompt = `Bạn là copywriter chuyên nghiệp cho thương mại điện tử.
Hãy tạo một email newsletter tuần này giới thiệu sản phẩm hot bằng JSON.
Chỉ trả về JSON, không giải thích.

Input:
- Tên khách: ${userName || "Quý khách"}
- Sản phẩm nổi bật tuần này:
${productList}

Format output (JSON only):
{
  "subject": "Tiêu đề email newsletter hấp dẫn",
  "headline": "Tiêu đề bài viết",
  "intro": "Đoạn giới thiệu ngắn 30-50 chữ",
  "content": "Nội dung giới thiệu sản phẩm sinh động 80-100 chữ",
  "callToAction": "Nội dung nút bấm"
}`;

  try {
    const { data } = await runGroqJSON(prompt);
    return { ...data, source: "groq" };
  } catch (error) {
    console.error("[Groq Service] Loi tao newsletter:", error.message);
    return {
      subject: "Bản tin nổi bật tuần này từ SmartShop",
      headline: "Đừng bỏ lỡ các sản phẩm bán chạy nhất!",
      intro: "Chào bạn, đây là các sản phẩm hot đang được nhiều khách hàng săn đón.",
      content: "Ghé thăm cửa hàng SmartShop ngay hôm nay để nhận được ưu đãi tốt nhất cho sản phẩm công nghệ bạn yêu thích.",
      callToAction: "Khám phá ngay",
      source: "fallback",
    };
  }
};

module.exports = {
  runGroqJSON,
  chatWithAI,
  generateMarketingEmail,
  analyzeBusinessWithAI,
  generateNewsletterEmail,
};
