const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password của Gmail
    },
  });

/**
 * Gửi email với template HTML đẹp
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com") {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return Promise.resolve(true);
  }
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Smart Ecommerce" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Template HTML cho email marketing
 */
const buildEmailHTML = ({ headline, content, callToAction, discountCode, intro }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .body { padding: 30px; }
    .body p { line-height: 1.7; color: #444; font-size: 15px; }
    .discount-box { background: #fff3cd; border: 2px dashed #ffc107; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
    .discount-code { font-size: 28px; font-weight: bold; color: #e65100; letter-spacing: 3px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 35px; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ Smart Ecommerce</h1>
      <p>${headline || "Ưu đãi dành riêng cho bạn"}</p>
    </div>
    <div class="body">
      ${intro ? `<p>${intro}</p>` : ""}
      <p>${content}</p>
      ${discountCode ? `
      <div class="discount-box">
        <p style="margin:0 0 8px; color:#555;">Mã giảm giá của bạn:</p>
        <div class="discount-code">${discountCode}</div>
        <p style="margin:8px 0 0; font-size:13px; color:#888;">Nhập mã khi thanh toán để được giảm giá</p>
      </div>` : ""}
      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" class="btn">${callToAction || "Mua sắm ngay"}</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Smart Ecommerce AI System. Mọi quyền được bảo lưu.</p>
      <p>Email này được tạo tự động bởi hệ thống AI.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, buildEmailHTML };
