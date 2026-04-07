# Services — Claude Context

> Services chứa **business logic thuần** — không có `req`/`res`. Controllers gọi services và xử lý HTTP response.
> Pattern: throw error nếu fail → controller catch và trả HTTP response phù hợp.

## gemini.service.js

**Wrapper cho Google Gemini 1.5 Flash API.**

### Function Signatures
```js
// Gọi Gemini với prompt, trả về text response
export const callGemini = async (prompt: string): Promise<string>

// Gọi Gemini, parse kết quả thành JSON object
export const callGeminiJSON = async (prompt: string): Promise<object>
```

### ⚠️ Critical Pattern — Strip Markdown
Gemini LUÔN trả về JSON được bọc trong markdown code block:
````
```json
{ "key": "value" }
```
````

**Phải strip trước khi parse**:
```js
const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
return JSON.parse(cleaned);
```

Nếu không strip → `JSON.parse()` ném SyntaxError.

### Error Handling
```js
try {
  const result = await callGeminiJSON(prompt);
  return result;
} catch (error) {
  // Fallback gracefully — đừng để AI failure crash toàn bộ request
  console.error('Gemini error:', error.message);
  return fallbackData; // hoặc throw để controller xử lý
}
```

### Rate Limits
- Free tier: 15 requests/minute, 1M tokens/day
- Nếu hit rate limit → retry sau 60s hoặc cache kết quả
- Prompt size: giữ dưới 8000 tokens để tránh lỗi

---

## recommendation.service.js

**Hai chiến lược gợi ý sản phẩm.**

### Function Signatures
```js
// Content-based: tìm SP có tags tương tự
export const getContentBased = async (productId: string, limit?: number): Promise<Product[]>

// Collaborative: tìm SP mà users tương tự đã mua
export const getCollaborative = async (userId: string, limit?: number): Promise<Product[]>

// Hàm tổng hợp — merge + deduplicate cả hai
export const getRecommendations = async (productId: string, userId?: string): Promise<Product[]>
```

### Content-based Algorithm
```js
// MongoDB Aggregate — sản phẩm có nhiều tags chung nhất
{ $match: { _id: { $ne: productId }, isActive: true } }
{ $project: {
    commonTags: { $setIntersection: ['$tags', targetProduct.tags] },
    // ...fields
  }
}
{ $addFields: { commonTagCount: { $size: '$commonTags' } } }
{ $match: { commonTagCount: { $gt: 0 } } }
{ $sort: { commonTagCount: -1 } }
{ $limit: 6 }
```

### Collaborative Filtering Algorithm
```js
// Tìm users đã view/purchase cùng sản phẩm
// → Lấy sản phẩm khác mà những users đó đã interact
Activity.find({ product: productId, action: { $in: ['view','purchase'] } })
// → Extract user IDs → tìm activity của họ → recommend products
```

---

## marketing.service.js

**Dùng Gemini để tạo email content cá nhân hóa.**

### Function Signatures
```js
// Tạo abandoned cart email cho 1 user
export const generateAbandonedCartEmail = async (
  user: User,
  cartItems: Product[]
): Promise<{ subject: string, htmlContent: string }>

// Tạo weekly newsletter
export const generateNewsletter = async (
  featuredProducts: Product[]
): Promise<{ subject: string, htmlContent: string }>
```

### Prompt Template Pattern
```js
const prompt = `
Bạn là copywriter cho shop thương mại điện tử. Tạo email cho ${user.name}.
Giỏ hàng của họ: ${JSON.stringify(cartItems.map(i => i.name))}.
Trả về JSON: { "subject": "...", "htmlContent": "..." }
Không wrap trong markdown.
`;
```
**Lưu ý**: Dùng `callGeminiJSON()` — đã có strip markdown built-in.

---

## email.service.js

**Gửi email qua Nodemailer + Gmail SMTP.**

### Function Signatures
```js
// Gửi email đơn
export const sendEmail = async (options: {
  to: string,
  subject: string,
  html: string
}): Promise<void>

// Gửi hàng loạt (loop, không gửi parallel để tránh spam filter)
export const sendBulkEmail = async (recipients: EmailOptions[]): Promise<void>
```

### Gmail Config
```js
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // App Password, KHÔNG phải password thường
  }
});
```

### ⚠️ Critical: Gmail App Password
- `EMAIL_PASS` **bắt buộc** phải là **Gmail App Password** (16 ký tự không có dấu cách)
- Tạo tại: Google Account → Security → 2-Step Verification → App Passwords
- Password thường của Gmail sẽ bị từ chối bởi Google SMTP
