import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeAssignment,
  assignToStudents,
} from "../controllers/assignment.controller.js";
import { authTeacher } from "../middlewares/teacherAuth.middleware.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Teacher routes
router.route("/").post(authTeacher, upload.array("attachments", 10), createAssignment);
router.route("/").get(getAssignments);
router.route("/:id").get(getAssignmentById);
router.route("/:id/assign").post(authTeacher, assignToStudents);
router.route("/:id/grade").post(authTeacher, gradeAssignment);

// Student routes
router.route("/:id/submit").post(authSTD, upload.array("files", 5), submitAssignment);

export default router;