"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    status: String,
    startDate: String,
    endDate: String,
    selectedStudents: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});
exports.Project = mongoose_1.default.model("Project", projectSchema);
