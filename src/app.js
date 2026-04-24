import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "https://digipatashala-frontend.vercel.app",
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
import studentRouter from "./routes/student.routes.js";
import teacherRouter from "./routes/teacher.routes.js";
import courseRouter from "./routes/course.routes.js";
import adminRouter from "./routes/admin.routes.js";
import ruralLearningRouter from "./routes/ruralLearning.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import learningPacketRouter from "./routes/learningPacket.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import progressTrackingRouter from "./routes/progressTracking.routes.js";

app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/course", courseRouter);
app.use("/api/admin", adminRouter);
app.use("/api/rural-learning", ruralLearningRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/learning-packets", learningPacketRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/progress", progressTrackingRouter);

export { app };