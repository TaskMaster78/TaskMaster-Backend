import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  name: { type: String, required: true },
  universityId: { type: String, required: true }
});

export const User = mongoose.model("User", userSchema);
