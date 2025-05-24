"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    projectTitle: { type: String, required: true },
    taskName: { type: String, required: true },
    description: String,
    assignedStudent: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["In Progress", "Completed", "Pending", "On Hold", "Cancelled"], // ✅ Add "On Hold" here
        default: "Pending"
    },
    dueDate: String
}, { timestamps: true });
exports.Task = mongoose_1.default.model("Task", taskSchema);
