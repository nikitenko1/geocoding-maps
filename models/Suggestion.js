import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    district: { type: String, default: "", required: true },
    name: { type: String, default: "", required: true, unique: true },
    coordinates: { type: [], required: true, unique: true },
    NH: { type: Number },
    jurisdiction: { type: String },
    reason: { type: String },
    intervention: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Suggestion || mongoose.model("Suggestion", suggestionSchema);
