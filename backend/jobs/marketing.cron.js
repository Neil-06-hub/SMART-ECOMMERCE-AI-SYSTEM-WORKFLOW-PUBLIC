const cron = require("node-cron");
const { sendCartAbandonedEmails, sendWeeklyNewsletter } = require("../services/marketing.service");

const initMarketingJobs = () => {
  // Trigger 2: Kiểm tra giỏ hàng bỏ quên mỗi giờ
  // Chạy lúc phút 0 của mỗi giờ: "0 * * * *"
  cron.schedule("0 * * * *", async () => {
    console.log("🕐 [CRON] Checking abandoned carts...");
    await sendCartAbandonedEmails();
  });

  // Trigger 3: Gửi Newsletter mỗi thứ Hai lúc 9:00 sáng
  // "0 9 * * 1" = lúc 9h sáng mỗi thứ Hai
  cron.schedule("0 9 * * 1", async () => {
    console.log("📰 [CRON] Sending weekly newsletter...");
    await sendWeeklyNewsletter();
  });

  console.log("✅ Marketing Cron Jobs initialized");
  console.log("  → Abandoned cart check: every hour");
  console.log("  → Weekly newsletter: every Monday at 9:00 AM");
};

module.exports = { initMarketingJobs };
