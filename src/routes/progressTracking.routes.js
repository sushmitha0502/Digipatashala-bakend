import { Router } from "express";
import {
  getStudentProgress,
  updateProgress,
  getTeacherStudentsProgress,
  getClassProgress,
  addAchievement,
} from "../controllers/progressTracking.controller.js";
import { authTeacher } from "../middlewares/teacherAuth.middleware.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";

const router = Router();

// Teacher routes
router.route("/teacher/students").get(authTeacher, getTeacherStudentsProgress);
router.route("/class/:classId").get(authTeacher, getClassProgress);
router.route("/student/:studentId").get(authTeacher, getStudentProgress);
router.route("/student/:studentId/achievement").post(authTeacher, addAchievement);

// Student routes
router.route("/student/:studentId").get(authSTD, getStudentProgress);

// Update progress (can be called by both teacher and student)
router.route("/update").post(updateProgress);

export default router;