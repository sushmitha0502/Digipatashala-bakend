import { Router } from "express";
import {
  createLearningPacket,
  getLearningPackets,
  getLearningPacketById,
  updateLearningPacket,
  deleteLearningPacket,
  downloadLearningPacket,
} from "../controllers/learningPacket.controller.js";
import { authTeacher } from "../middlewares/teacherAuth.middleware.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Teacher routes
router.route("/").post(authTeacher, upload.array("attachments", 10), createLearningPacket);
router.route("/").get(getLearningPackets);
router.route("/:id").get(getLearningPacketById);
router.route("/:id").put(authTeacher, updateLearningPacket);
router.route("/:id").delete(authTeacher, deleteLearningPacket);
router.route("/:id/download").get(authSTD, downloadLearningPacket);

export default router;