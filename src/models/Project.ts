import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     { type: String },
  category:        { type: String },
  status:          { type: String },
  startDate:       { type: Date },
  endDate:         { type: Date },
  selectedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt:       { type: Date, default: Date.now }
});

export const Project = mongoose.model("Project", projectSchema);