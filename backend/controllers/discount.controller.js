const DiscountCode = require("../models/DiscountCode");

// @desc  Lấy tất cả mã giảm giá
// @route GET /api/admin/discounts
const getAll = async (req, res) => {
  try {
    const discounts = await DiscountCode.find().sort({ createdAt: -1 });
    res.json({ success: true, discounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Tạo mã giảm giá
// @route POST /api/admin/discounts
const create = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt, description } = req.body;

    const existing = await DiscountCode.findOne({ code: code?.toUpperCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: "Mã giảm giá đã tồn tại" });

    const discount = await DiscountCode.create({
      code, type, value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || 0,
      expiresAt: expiresAt || null,
      description: description || "",
    });

    res.status(201).json({ success: true, message: "Tạo mã giảm giá thành công", discount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cập nhật mã giảm giá
// @route PUT /api/admin/discounts/:id
const update = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt, description, isActive } = req.body;

    const discount = await DiscountCode.findByIdAndUpdate(
      req.params.id,
      { code, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt, description, isActive },
      { new: true, runValidators: true }
    );

    if (!discount) return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
    res.json({ success: true, message: "Cập nhật thành công", discount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa mã giảm giá
// @route DELETE /api/admin/discounts/:id
const remove = async (req, res) => {
  try {
    const discount = await DiscountCode.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
    res.json({ success: true, message: "Đã xóa mã giảm giá" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle kích hoạt/tắt mã
// @route PATCH /api/admin/discounts/:id/toggle
const toggleActive = async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });

    discount.isActive = !discount.isActive;
    await discount.save();
    res.json({ success: true, message: `Mã đã ${discount.isActive ? "kích hoạt" : "tắt"}`, discount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Validate mã giảm giá (dùng ở checkout, không cần admin)
// @route POST /api/discounts/validate
const validate = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });

    const discount = await DiscountCode.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!discount) return res.status(404).json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });

    if (discount.expiresAt && new Date() > discount.expiresAt)
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn" });

    if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit)
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });

    if (orderAmount && discount.minOrderAmount > 0 && orderAmount < discount.minOrderAmount)
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(discount.minOrderAmount)}đ để dùng mã này`,
      });

    // Tính số tiền được giảm
    let discountAmount = 0;
    if (discount.type === "percent") {
      discountAmount = Math.round((orderAmount || 0) * (discount.value / 100));
      if (discount.maxDiscount > 0) discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else {
      discountAmount = discount.value;
    }

    res.json({ success: true, discount: { code: discount.code, type: discount.type, value: discount.value, discountAmount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, create, update, remove, toggleActive, validate };
