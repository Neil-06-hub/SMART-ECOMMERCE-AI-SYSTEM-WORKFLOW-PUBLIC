const User = require("../models/User");
const Product = require("../models/Product");
const Activity = require("../models/Activity");
const MarketingLog = require("../models/MarketingLog");
const { generateMarketingEmail, generateNewsletterEmail } = require("./gemini.service");
const { sendEmail, buildEmailHTML } = require("./email.service");

/**
 * Trigger 1: Gửi email chào mừng khi user đăng ký mới
 */
const sendWelcomeEmail = async (user) => {
  try {
    const emailData = await generateMarketingEmail({
      name: user.name,
      products: [],
      goal: "Chào mừng khách hàng mới, giới thiệu cửa hàng và khuyến khích mua hàng lần đầu",
    });

    const html = buildEmailHTML({
      headline: emailData.headline,
      content: emailData.content,
      discountCode: emailData.discountCode || "WELCOME10",
      callToAction: emailData.callToAction,
    });

    await sendEmail({ to: user.email, subject: emailData.subject, html });

    await MarketingLog.create({
      type: "welcome",
      recipient: user.email,
      recipientName: user.name,
      subject: emailData.subject,
      content: emailData.content,
      status: "success",
      discountCode: emailData.discountCode || "WELCOME10",
    });

    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (err) {
    console.error(`❌ Failed to send welcome email: ${err.message}`);
    await MarketingLog.create({
      type: "welcome",
      recipient: user.email,
      recipientName: user.name,
      subject: "Welcome Email",
      content: "",
      status: "failed",
      errorMessage: err.message,
    }).catch(() => {});
  }
};

/**
 * Trigger 2: Gửi email nhắc nhở giỏ hàng bỏ quên (sau 24h)
 * Chạy bởi Cron Job mỗi giờ
 */
const sendCartAbandonedEmails = async () => {
  try {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h trước
    const users = await User.find({
      cartAbandonedAt: { $lte: threshold },
      cartAbandonedNotified: false,
    });

    console.log(`📧 Found ${users.length} abandoned cart(s) to process`);

    for (const user of users) {
      try {
        // Lấy sản phẩm gần đây nhất của user
        const recentActivities = await Activity.find({ user: user._id, action: "add_cart" })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("product", "name");
        const productNames = recentActivities.map((a) => a.product?.name).filter(Boolean);

        const emailData = await generateMarketingEmail({
          name: user.name,
          products: productNames.length ? productNames : ["sản phẩm yêu thích"],
          goal: "Nhắc nhở khách hàng hoàn thành đơn hàng trong giỏ hàng đã bỏ quên, tặng mã giảm giá để khuyến khích",
        });

        const html = buildEmailHTML({
          headline: emailData.headline,
          content: emailData.content,
          discountCode: emailData.discountCode || "CART15",
          callToAction: emailData.callToAction,
        });

        await sendEmail({ to: user.email, subject: emailData.subject, html });
        await User.findByIdAndUpdate(user._id, { cartAbandonedNotified: true });

        await MarketingLog.create({
          type: "cart_abandoned",
          recipient: user.email,
          recipientName: user.name,
          subject: emailData.subject,
          content: emailData.content,
          status: "success",
          discountCode: emailData.discountCode || "CART15",
        });

        console.log(`✅ Cart abandoned email sent to ${user.email}`);
      } catch (err) {
        console.error(`❌ Error sending cart email to ${user.email}: ${err.message}`);
        await MarketingLog.create({
          type: "cart_abandoned",
          recipient: user.email,
          recipientName: user.name,
          subject: "Cart Abandoned Email",
          content: "",
          status: "failed",
          errorMessage: err.message,
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Cart abandoned job error:", err.message);
  }
};

/**
 * Trigger 3: Gửi Newsletter tuần với sản phẩm hot nhất
 * Chạy bởi Cron Job mỗi tuần
 */
const sendWeeklyNewsletter = async () => {
  try {
    // Top 3 sản phẩm hot nhất tuần
    const hotProducts = await Product.find({ isActive: true })
      .sort({ sold: -1, rating: -1 })
      .limit(3)
      .select("name price image");

    const users = await User.find({ role: "customer" }).select("name email");
    console.log(`📧 Sending newsletter to ${users.length} users...`);

    for (const user of users) {
      try {
        const emailData = await generateNewsletterEmail({
          userName: user.name,
          hotProducts,
        });

        const html = buildEmailHTML({
          headline: emailData.headline,
          content: `${emailData.intro || ""}\n\n${emailData.content}`,
          callToAction: emailData.callToAction,
        });

        await sendEmail({ to: user.email, subject: emailData.subject, html });

        await MarketingLog.create({
          type: "newsletter",
          recipient: user.email,
          recipientName: user.name,
          subject: emailData.subject,
          content: emailData.content,
          status: "success",
        });
      } catch (err) {
        console.error(`❌ Newsletter error for ${user.email}: ${err.message}`);
      }
    }

    console.log("✅ Weekly newsletter sent!");
  } catch (err) {
    console.error("Newsletter job error:", err.message);
  }
};

/**
 * Kích hoạt chiến dịch Marketing thủ công từ Admin
 */
const triggerMarketingCampaign = async (campaignType) => {
  switch (campaignType) {
    case "cart_abandoned":
      await sendCartAbandonedEmails();
      return { message: "Đã gửi email nhắc giỏ hàng bỏ quên" };
    case "newsletter":
      await sendWeeklyNewsletter();
      return { message: "Đã gửi newsletter cho tất cả khách hàng" };
    default:
      throw new Error(`Loại chiến dịch '${campaignType}' không hợp lệ`);
  }
};

module.exports = { sendWelcomeEmail, sendCartAbandonedEmails, sendWeeklyNewsletter, triggerMarketingCampaign };
