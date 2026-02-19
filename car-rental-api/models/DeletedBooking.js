const mongoose = require("mongoose");

const deletedBookingSchema = new mongoose.Schema(
  {
    originalBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["user", "admin"], required: true },
    },
    booking: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

deletedBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DeletedBooking", deletedBookingSchema);
