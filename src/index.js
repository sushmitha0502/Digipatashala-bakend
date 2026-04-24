// import dotenv from "dotenv";
// dotenv.config();

// import db from "./database/db.js";
// import { app } from "./app.js";
// import quizRoutes from "./routes/quiz.routes.js";

// const PORT = process.env.PORT || 5002;

// console.log("DB_NAME:", process.env.DB_NAME);
// console.log("MONGO_URI:", process.env.MONGO_URI);
// console.log("PORT:", PORT);

// app.use("/api/quiz", quizRoutes);

// db()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`⚙️ Server is running at port : ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("mongodb connection failed !!!", err);
//   });

import dotenv from "dotenv";
dotenv.config();

import db from "../database/db.js";
import { app } from "../app.js";
import quizRoutes from "../routes/quiz.routes.js";
import serverless from "serverless-http";

// connect DB ONCE
let isConnected = false;

const connectDB = async () => {
  if (!isConnected) {
    try {
      await db();
      isConnected = true;
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err);
      throw err;
    }
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// routes
app.use("/api/quiz", quizRoutes);

// export handler for Vercel
export default serverless(app);