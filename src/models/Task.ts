import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  projectTitle: { type: String, required: true },
  taskName: { type: String, required: true },
  description: String,
  assignedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" },
  dueDate: String,
}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);
