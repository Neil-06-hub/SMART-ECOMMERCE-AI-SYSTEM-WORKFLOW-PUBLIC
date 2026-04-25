const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const DEFAULT_RETRY_MS = 60 * 1000;

let cooldownUntil = 0;
let cooldownReason = "";
let openRouterDisabled = String(process.env.OPENROUTER_ENABLED || "true").toLowerCase() === "false";
let openRouterDisableReason = openRouterDisabled ? "disabled_by_env" : "";

const getApiKey = () =>
  (process.env.OPENROUTER_API_KEY || "").trim().replace(/^["']|["']$/g, "");

const isApiKeyConfigured = () => {
  const key = getApiKey();
  return !openRouterDisabled && key.length >= 10;
};

const isCooldownActive = () => Date.now() < cooldownUntil;

const parseJSONSafely = (text) => {
  const cleaned = String(text || "").replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
};

const extractTextFromContent = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : item?.text || ""))
      .join("")
      .trim();
  }
  return "";
};

const isRateLimitError = (status, message) =>
  status === 429 || message.includes("rate limit") || message.includes("too many requests");

const extractRetryDelayMs = (message) => {
  const retryAfterSeconds = String(message || "").match(/retry in\s+([\d.]+)s/i);
  if (!retryAfterSeconds) return DEFAULT_RETRY_MS;

  const seconds = Number(retryAfterSeconds[1]);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds * 1000) : DEFAULT_RETRY_MS;
};

const activateCooldown = (message, reason = "rate_limit") => {
  cooldownUntil = Date.now() + extractRetryDelayMs(message);
  cooldownReason = reason;
};

const disableOpenRouter = (reason) => {
  openRouterDisabled = true;
  openRouterDisableReason = reason;
};

const shouldSkipOpenRouter = () => openRouterDisabled || !isApiKeyConfigured() || isCooldownActive();

const getUnavailableReason = () => {
  if (openRouterDisabled) return openRouterDisableReason || "disabled";
  if (!isApiKeyConfigured()) return "missing_api_key";
  if (isCooldownActive()) return cooldownReason || "cooldown";
  return null;
};

const buildMarketingFallback = ({ name, products = [], goal }) => {
  const firstName = name || "ban";
  const productLine =
    products.length > 0 ? `San pham goi y: ${products.join(", ")}.` : "Thong diep duoc ca nhan hoa theo hanh vi mua sam gan day.";
  const promoCode = goal?.toLowerCase().includes("gio")
    ? "CART15"
    : goal?.toLowerCase().includes("chao mung")
      ? "WELCOME10"
      : "SAVE10";

  return {
    subject: `SmartShop - uu dai danh rieng cho ${firstName}`,
    headline: `Xin chao ${firstName}!`,
    content: `${productLine} Hom nay SmartShop gui tang ban uu dai dac biet de mua sam tiet kiem hon. Nhan ma ${promoCode} va kham pha cac lua chon phu hop ngay bay gio.`,
    discountCode: promoCode,
    callToAction: "Mua ngay",
    source: "fallback",
    note: "Noi dung duoc tao tu mau co san vi OpenRouter tam thoi khong kha dung.",
  };
};

const buildLocalAnalysis = ({ recentOrders, topProducts }) => {
  const totalRevenue = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = recentOrders.length ? Math.round(totalRevenue / recentOrders.length) : 0;
  const cancelledCount = recentOrders.filter((o) => o.orderStatus === "cancelled").length;
  const cancelRate = recentOrders.length ? Math.round((cancelledCount / recentOrders.length) * 100) : 0;
  const topProductNames = topProducts.slice(0, 2).map((p) => p.name).join(" va ");
  const trend = totalRevenue > 50000000 ? "positive" : totalRevenue > 10000000 ? "neutral" : "negative";

  return {
    summary: `Cua hang ghi nhan ${recentOrders.length} don hang voi tong doanh thu ${totalRevenue.toLocaleString("vi-VN")}d. Gia tri don trung binh ${avgOrderValue.toLocaleString("vi-VN")}d. Ty le huy don ${cancelRate}%.`,
    strengths: [
      `Top san pham ban chay: ${topProductNames || "dang cap nhat"}`,
      avgOrderValue > 5000000 ? "Gia tri don hang cao, khach hang chi tieu tot." : "Luong don hang dang duoc duy tri on dinh.",
      cancelRate < 20 ? "Ty le huy don thap, trai nghiem mua hang kha tot." : "Van hanh dang on dinh va can tiep tuc toi uu.",
    ],
    improvements: [
      cancelRate >= 20
        ? "Ty le huy don dang cao, nen cai thien quy trinh xac nhan don."
        : "Mo rong danh muc de tang co hoi cross-sell.",
      avgOrderValue < 3000000
        ? "Ap dung combo hoac bundle de tang gia tri don trung binh."
        : "Toi uu loyalty program de giu chan nhom khach hang VIP.",
    ],
    trend,
    recommendation:
      trend === "positive"
        ? "Doanh thu dang tot. Nen tap trung retention marketing va upsell san pham gia tri cao."
        : "Nen day manh khuyen mai ngan han va toi uu email marketing de tang conversion.",
    source: "fallback",
    note: "Phan tich dang dung logic noi bo vi OpenRouter tam thoi khong kha dung.",
  };
};

const buildNewsletterFallback = ({ userName, hotProducts = [] }) => {
  const productList = hotProducts.map((p) => p.name).filter(Boolean).join(", ");

  return {
    subject: "SmartShop - san pham noi bat tuan nay",
    headline: "Kham pha san pham hot nhat tuan!",
    intro: `Xin chao ${userName || "Quy khach"}, day la cac goi y noi bat duoc nhieu khach hang quan tam.`,
    content: productList
      ? `Tuan nay SmartShop goi y cho ban: ${productList}. Theo doi ngay de chon duoc san pham phu hop va nhan uu dai tot nhat.`
      : "Tuan nay SmartShop da cap nhat nhieu san pham dang duoc quan tam. Ghe tham cua hang de xem cac lua chon noi bat va uu dai hien co.",
    callToAction: "Xem ngay",
    source: "fallback",
    note: "Noi dung duoc tao tu mau co san vi OpenRouter tam thoi khong kha dung.",
  };
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const looksLikePlaceholder = (value) => {
  const text = normalizeText(value);

  if (!text) return true;

  const placeholderPatterns = [
    "tom tat tinh hinh kinh doanh trong 2 3 cau",
    "diem manh 1",
    "diem manh 2",
    "de xuat cai thien 1",
    "de xuat cai thien 2",
    "loi khuyen chien luoc ngan gon",
    "tieu de email hap dan",
    "cau chao mung ca nhan hoa",
    "noi dung nut bam",
    "tieu de bai viet",
  ];

  return placeholderPatterns.some((pattern) => text.includes(pattern));
};

const validateAnalysisPayload = (data, fallback) => {
  const summary = data?.summary;
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const improvements = Array.isArray(data?.improvements) ? data.improvements : [];
  const recommendation = data?.recommendation;

  const invalid =
    looksLikePlaceholder(summary) ||
    looksLikePlaceholder(recommendation) ||
    strengths.length < 2 ||
    improvements.length < 2 ||
    strengths.some(looksLikePlaceholder) ||
    improvements.some(looksLikePlaceholder);

  if (invalid) {
    return {
      ...fallback,
      note: "OpenRouter tra ve noi dung mau qua chung chung, he thong da chuyen sang phan tich noi bo co so lieu thuc.",
    };
  }

  return { ...fallback, ...data, source: "openrouter", note: undefined };
};

const validateMarketingPayload = (data, fallback) => {
  const invalid =
    looksLikePlaceholder(data?.subject) ||
    looksLikePlaceholder(data?.headline) ||
    looksLikePlaceholder(data?.content) ||
    looksLikePlaceholder(data?.callToAction);

  if (invalid) {
    return {
      ...fallback,
      note: "OpenRouter tra ve noi dung mau qua chung chung, he thong da chuyen sang mau noi bo.",
    };
  }

  return { ...fallback, ...data, source: "openrouter", note: undefined };
};

const validateNewsletterPayload = (data, fallback) => {
  const invalid =
    looksLikePlaceholder(data?.subject) ||
    looksLikePlaceholder(data?.headline) ||
    looksLikePlaceholder(data?.intro) ||
    looksLikePlaceholder(data?.content) ||
    looksLikePlaceholder(data?.callToAction);

  if (invalid) {
    return {
      ...fallback,
      note: "OpenRouter tra ve noi dung mau qua chung chung, he thong da chuyen sang mau noi bo.",
    };
  }

  return { ...fallback, ...data, source: "openrouter", note: undefined };
};

const runOpenRouterJSON = async (prompt) => {
  if (shouldSkipOpenRouter()) {
    const reason = getUnavailableReason() || "openrouter_unavailable";
    throw new Error(`OpenRouter unavailable: ${reason}`);
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
      "X-Title": "Smart Ecommerce AI System",
    },
    body: JSON.stringify({
      model: DEFAULT_OPENROUTER_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Ban la tro ly cho he thong thuong mai dien tu. Luon tra ve dung dinh dang JSON duoc yeu cau, khong them giai thich. Cam lap lai placeholder trong schema nhu 'Diem manh 1', 'Tom tat...', 'De xuat cai thien 1'. Moi gia tri phai duoc dien bang noi dung cu the dua tren input.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  const message = String(payload?.error?.message || payload?.message || response.statusText || "");

  if (!response.ok) {
    if (isRateLimitError(response.status, message)) {
      activateCooldown(message, "rate_limit");
    }

    if (response.status === 402) {
      // Credits exhausted — cooldown 30 minutes before retrying
      cooldownUntil = Date.now() + 30 * 60 * 1000;
      cooldownReason = "insufficient_credits";
    }

    if (response.status === 401 || response.status === 403) {
      disableOpenRouter("invalid_api_key_or_forbidden");
    }

    throw new Error(`OpenRouter ${response.status}: ${message || "Request failed"}`);
  }

  const text = extractTextFromContent(payload?.choices?.[0]?.message?.content);
  return {
    data: parseJSONSafely(text),
    modelName: payload?.model || DEFAULT_OPENROUTER_MODEL,
  };
};

const generateMarketingEmail = async ({ name, products, goal }) => {
  const fallback = buildMarketingFallback({ name, products, goal });

  if (shouldSkipOpenRouter()) {
    return fallback;
  }

  const prompt = `Ban la chuyen gia marketing cho he thong thuong mai dien tu.
Hay phan tich du lieu khach hang duoi day va tra ve mot email marketing.
Yeu cau bat buoc: chi tra ve du lieu JSON, khong co van ban giai thich.
Cam dung lai cac chuoi mau trong schema. Moi truong phai la noi dung cu the.

Input:
- Ten khach: ${name}
- San pham da xem/mua: ${(products || []).join(", ")}
- Muc tieu: ${goal}

Output format (JSON only):
{
  "subject": "Tieu de email hap dan",
  "headline": "Cau chao mung ca nhan hoa",
  "content": "Noi dung email thuyet phuc khoang 100 chu tieng Viet",
  "discountCode": "Ma giam gia de xuat",
  "callToAction": "Noi dung nut bam"
}`;

  try {
    const { data, modelName } = await runOpenRouterJSON(prompt);
    return { ...validateMarketingPayload(data, fallback), model: modelName };
  } catch (error) {
    console.error("[OpenRouter] Loi tao marketing email:", error.message);
    return fallback;
  }
};

const analyzeBusinessWithAI = async ({ recentOrders, topProducts }) => {
  const fallback = buildLocalAnalysis({ recentOrders, topProducts });

  if (shouldSkipOpenRouter()) {
    return fallback;
  }

  const totalRevenue = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = recentOrders.length ? totalRevenue / recentOrders.length : 0;

  const prompt = `Ban la chuyen gia phan tich kinh doanh thuong mai dien tu.
Duoi day la du lieu kinh doanh cua cua hang. Hay phan tich va dua ra nhan xet thong minh.
Chi tra ve JSON, khong co van ban giai thich.
Khong duoc lap lai placeholder tu schema. Phai neu so lieu va nhan xet cu the dua tren du lieu dau vao.

Du lieu:
- Tong don hang gan day: ${recentOrders.length} don
- Tong doanh thu: ${totalRevenue.toLocaleString("vi-VN")} VND
- Gia tri don hang trung binh: ${Math.round(avgOrderValue).toLocaleString("vi-VN")} VND
- Top san pham ban chay: ${topProducts.map((p) => `${p.name} (${p.sold} da ban)`).join(", ")}

Output format (JSON only):
{
  "summary": "Tom tat tinh hinh kinh doanh trong 2-3 cau",
  "strengths": ["Diem manh 1", "Diem manh 2"],
  "improvements": ["De xuat cai thien 1", "De xuat cai thien 2"],
  "trend": "positive | negative | neutral",
  "recommendation": "Loi khuyen chien luoc ngan gon"
}`;

  try {
    const { data, modelName } = await runOpenRouterJSON(prompt);
    return { ...validateAnalysisPayload(data, fallback), model: modelName };
  } catch (error) {
    console.error("[OpenRouter] Loi phan tich AI:", error.message);
    return fallback;
  }
};

const generateNewsletterEmail = async ({ userName, hotProducts }) => {
  const fallback = buildNewsletterFallback({ userName, hotProducts });

  if (shouldSkipOpenRouter()) {
    return fallback;
  }

  const productList = (hotProducts || [])
    .map((p) => `${p.name} - ${Number(p.price || 0).toLocaleString("vi-VN")}d`)
    .join("\n");

  const prompt = `Ban la copywriter chuyen nghiep cho thuong mai dien tu.
Hay tao mot email newsletter tuan nay gioi thieu san pham hot.
Chi tra ve JSON, khong co van ban giai thich.
Cam dung placeholder trong schema. Moi truong phai la noi dung cu the dua tren input.

Input:
- Ten khach: ${userName || "Quy khach"}
- San pham noi bat tuan nay:
${productList}

Output format (JSON only):
{
  "subject": "Tieu de email newsletter hap dan",
  "headline": "Tieu de bai viet",
  "intro": "Doan gioi thieu ngan 30-50 chu",
  "content": "Noi dung gioi thieu san pham sinh dong 80-100 chu",
  "callToAction": "Noi dung nut bam"
}`;

  try {
    const { data, modelName } = await runOpenRouterJSON(prompt);
    return { ...validateNewsletterPayload(data, fallback), model: modelName };
  } catch (error) {
    console.error("[OpenRouter] Loi tao newsletter:", error.message);
    return fallback;
  }
};

module.exports = { generateMarketingEmail, analyzeBusinessWithAI, generateNewsletterEmail };
