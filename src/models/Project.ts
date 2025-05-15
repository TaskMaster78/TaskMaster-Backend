import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  status: String,
  startDate: String,
  endDate: String,
  selectedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export const Project = mongoose.model("Project", projectSchema);
