import { Router } from "express";
import {
  createLearningPacket,
  getLearningPackets,
  getLearningPacketById,
  updateLearningPacket,
  deleteLearningPacket,
  createQuizForPacket,
  submitQuiz,
  saveOfflineDownload,
  syncStudentProgress,
  getTeacherProgressDashboard,
  getSchoolMappingOverview,
} from "../controllers/ruralLearning.controller.js";

const router = Router();

// Learning packets
router.get("/packets", getLearningPackets);
router.get("/packets/:id", getLearningPacketById);
router.post("/packets", createLearningPacket);
router.put("/packets/:id", updateLearningPacket);
router.delete("/packets/:id", deleteLearningPacket);

// Quiz
router.post("/packets/:packetId/quiz", createQuizForPacket);
router.post("/packets/:packetId/quiz/submit", submitQuiz);

// Offline / sync
router.post("/packets/:packetId/download", saveOfflineDownload);
router.post("/sync", syncStudentProgress);

// Teacher dashboard
router.get("/teacher/progress", getTeacherProgressDashboard);

// School mapping
router.get("/school-mapping", getSchoolMappingOverview);

export default router;