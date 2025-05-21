import express from "express";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { schema } from "./schema/schema";
import cors from "cors";
import { verify } from "jsonwebtoken";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.PUBLIC_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// CORS
app.use(cors({ origin: process.env.PUBLIC_URL || "http://localhost:3000" }));
app.use(express.json());

// Health check route
app.get("/", (_req, res) => {
  res.send("✅ GraphQL backend is up and running!");
});

// JWT Auth middleware for GraphQL
// JWT Auth middleware for GraphQL
app.use(
  "/graphql",
  graphqlHTTP(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    let user = null;

    interface JwtPayload {
      id: string;
      role: "admin" | "student";
      username: string;
    }

    if (token) {
      try {
        const decoded = verify(
          token,
          process.env.JWT_SECRET as string
        ) as JwtPayload;

        user = {
          id: decoded.id,
          role: decoded.role,
          username: decoded.username
        };
      } catch (err) {
        console.warn("⚠️ Invalid token:", err);
      }
    }

    return {
      schema,
      graphiql: true,
      context: { user }
    };
  })
);

// Socket.IO logic
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;

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
