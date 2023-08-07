import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    district: { type: String, default: "", required: true },
    name: { type: String, default: "", required: true },
    coordinates: { type: [], required: true },
    NH: { type: Number },
    jurisdiction: { type: String },
    reason: { type: String },
    intervention: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Place || mongoose.model("Place", placeSchema);
