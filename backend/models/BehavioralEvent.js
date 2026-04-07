const mongoose = require("mongoose");

const EVENT_WEIGHTS = {
  view: 1,
  click: 1.5,
  add_to_cart: 2,
  purchase: 5,
  rec_click: 1.5,
  search: 0.5,
};

const behavioralEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  eventType: {
    type: String,
    enum: ["view", "click", "add_to_cart", "purchase", "rec_click", "search"],
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  metadata: {
    sessionId: { type: String, default: null },
    placement: { type: String, default: null },
    query: { type: String, default: null },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: auto-delete after 90 days
behavioralEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

// Query indexes
behavioralEventSchema.index({ userId: 1, timestamp: -1 });
behavioralEventSchema.index({ productId: 1, eventType: 1 });
behavioralEventSchema.index({ userId: 1, productId: 1 });

// Auto-set weight from eventType if not provided
behavioralEventSchema.pre("save", function (next) {
  if (!this.weight) {
    this.weight = EVENT_WEIGHTS[this.eventType] || 1;
  }
  next();
});

module.exports = mongoose.model("BehavioralEvent", behavioralEventSchema);
module.exports.EVENT_WEIGHTS = EVENT_WEIGHTS;
