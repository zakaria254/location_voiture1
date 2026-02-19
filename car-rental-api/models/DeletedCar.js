const mongoose = require("mongoose");

const deletedCarSchema = new mongoose.Schema(
  {
    originalCarId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["user", "admin"], required: true },
    },
    car: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

deletedCarSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DeletedCar", deletedCarSchema);
