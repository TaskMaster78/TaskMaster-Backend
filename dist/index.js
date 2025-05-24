"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const schema_1 = require("./schema/schema");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = require("jsonwebtoken");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Create HTTP server and attach Socket.IO
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.PUBLIC_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// MongoDB connection
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB error:", err));
// CORS
app.use((0, cors_1.default)({ origin: process.env.PUBLIC_URL || "http://localhost:3000" }));
app.use(express_1.default.json());
// Health check route
app.get("/", (_req, res) => {
    res.send("✅ GraphQL backend is up and running!");
});
// JWT Auth middleware for GraphQL
// JWT Auth middleware for GraphQL
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    let user = null;
    if (token) {
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            user = {
                id: decoded.id,
                role: decoded.role,
                username: decoded.username
            };
        }
        catch (err) {
            console.warn("⚠️ Invalid token:", err);
        }
    }
    return {
        schema: schema_1.schema,
        graphiql: true,
        context: { user }
    };
}));
// Socket.IO logic
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId); // ✅ user joins their personal room
        console.log(`🟢 User ${userId} joined their room`);
    }
    socket.on("sendMessage", (message) => {
        const { recipientId } = message;
        console.log("📩 Message received:", message);
        socket.to(recipientId).emit("receiveMessage", message); // ✅ send only to recipient
    });
});
// Start both HTTP & WebSocket servers
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    console.log(`💬 WebSocket server listening on ws://localhost:${PORT}`);
});
