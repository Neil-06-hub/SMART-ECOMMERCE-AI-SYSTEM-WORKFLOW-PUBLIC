const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Public platform overview stats (no auth required)
// @route GET /api/stats/overview
exports.getPublicOverview = async (req, res) => {
  try {
    // A) Platform KPIs
    const [totalUsers, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'customer', deletedAt: null }),
      Order.countDocuments({ orderStatus: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // B) Age distribution from User.dob + User.gender
    const ageDistribution = await User.aggregate([
      { $match: { role: 'customer', deletedAt: null, dob: { $ne: null } } },
      { $addFields: { age: { $subtract: [{ $year: new Date() }, { $year: '$dob' }] } } },
      {
        $addFields: {
          bracket: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: '18-24' },
                { case: { $lt: ['$age', 35] }, then: '25-34' },
                { case: { $lt: ['$age', 45] }, then: '35-44' },
                { case: { $lt: ['$age', 55] }, then: '45-54' },
              ],
              default: '55+',
            },
          },
        },
      },
      {
        $group: {
          _id: { bracket: '$bracket', gender: '$gender' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.bracket': 1 } },
    ]);

    // C) Top 5 selling categories from Order items
    const topCategories = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'prod',
        },
      },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$prod.category',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // D) Monthly sales for top 3 categories (last 6 months) — for the chart
    const top3Cats = topCategories.slice(0, 3).map((c) => c._id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCategories =
      top3Cats.length > 0
        ? await Order.aggregate([
            {
              $match: {
                orderStatus: { $ne: 'cancelled' },
                createdAt: { $gte: sixMonthsAgo },
              },
            },
            { $unwind: '$items' },
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'prod',
              },
            },
            { $unwind: { path: '$prod', preserveNullAndEmptyArrays: false } },
            { $match: { 'prod.category': { $in: top3Cats } } },
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' },
                  category: '$prod.category',
                },
                totalSold: { $sum: '$items.quantity' },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ])
        : [];

    // E) Top 4 products by sold count (for CTA cards + Card 1 preview)
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(4)
      .select('name price images category sold');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        ageDistribution,
        topCategories,
        monthlyCategories,
        topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
