import express from "express";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { schema } from "./schema/schema";
import cors from "cors";
import { verify } from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// CORS
app.use(cors({ origin: process.env.PUBLIC_URL || "http://localhost:3000" }));

// Health check route
app.get("/", (_req, res) => {
  res.send("✅ GraphQL backend is up and running!");
});

// JWT Auth middleware for GraphQL
app.use(
  "/graphql",
  graphqlHTTP((req, res) => {
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
      } catch {
        console.warn("⚠️ Invalid token");
      }
    }

    return {
      schema,
      graphiql: true,
      context: { user }
    };
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
});
