"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    name: { type: String, required: true },
    universityId: { type: String, required: true },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    bio: { type: String, default: "" }
});
exports.User = mongoose_1.default.model("User", userSchema);
