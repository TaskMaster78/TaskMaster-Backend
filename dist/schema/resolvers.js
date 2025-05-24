"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProjects = exports.loginUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const mongoose_1 = __importDefault(require("mongoose"));
const createUser = async (args) => {
    const hashedPassword = await bcrypt_1.default.hash(args.password, 10);
    const user = new User_1.User({ ...args, password: hashedPassword });
    return await user.save();
};
exports.createUser = createUser;
const loginUser = async (username, password) => {
    const user = await User_1.User.findOne({ username });
    if (!user)
        throw new Error("User not found");
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid password");
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h"
    });
    return { token, role: user.role };
};
exports.loginUser = loginUser;
const createProject = async (_, args, context) => {
    const user = context.user;
    if (!user || user.role !== "admin")
        throw new Error("Unauthorized");
    const selectedStudents = args.selectedStudents.map((id) => new mongoose_1.default.Types.ObjectId(id));
    const project = new Project_1.Project({
        ...args,
        selectedStudents // override with converted ObjectIds
    });
    return await project.save();
};
const getUserProjects = async (currentUser) => {
    if (currentUser.role === "admin") {
        return await Project_1.Project.find();
    }
    return await Project_1.Project.find({ assignedTo: currentUser.id });
};
exports.getUserProjects = getUserProjects;
