import express from "express";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { schema } from "./schema/schema";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.use(cors({ origin: "http://localhost:3000" }));
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}/graphql`);
});
