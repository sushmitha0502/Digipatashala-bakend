import { progressTracking } from "../models/progressTracking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Check if teacher has access to this student
  if (req.teacher) {
    // Verify teacher teaches this student
    const progress = await progressTracking.findOne({
      student: studentId,
      teacher: req.teacher._id,
    });

    if (!progress) {
      throw new ApiError(403, "You don't have access to this student's progress");
    }
  }

  // If student is requesting their own progress
  if (req.student && req.student._id.toString() !== studentId) {
    throw new ApiError(403, "You can only view your own progress");
  }

  const progress = await progressTracking.findOne({ student: studentId })
    .populate('student', 'Firstname Lastname')
    .populate('teacher', 'Firstname Lastname Subject')
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .populate('learningPacketsCompleted.packet', 'title subject grade')
    .populate('quizzesCompleted.quiz', 'title subject')
    .populate('assignmentsCompleted.assignment', 'title subject')
    .populate('digitalLiteracyModulesCompleted.module', 'title category');

  if (!progress) {
    throw new ApiError(404, "Progress record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Student progress fetched successfully"));
});

const updateProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const {
    learningPacketId,
    quizId,
    assignmentId,
    score,
    type,
  } = req.body;

  let progress = await progressTracking.findOne({ student: studentId });

  if (!progress) {
    // Create new progress record
    progress = new progressTracking({
      student: studentId,
      teacher: req.teacher._id,
      // Other fields will be populated as needed
    });
  }

  // Update based on type
  if (type === 'learningPacket' && learningPacketId) {
    const exists = progress.learningPacketsCompleted.some(
      (packet) => packet.packet.toString() === learningPacketId
    );

    if (!exists) {
      progress.learningPacketsCompleted.push({
        packet: learningPacketId,
        score: score || 0,
      });
      progress.totalPoints += score || 0;
    }
  } else if (type === 'quiz' && quizId) {
    const exists = progress.quizzesCompleted.some(
      (quiz) => quiz.quiz.toString() === quizId
    );

    if (!exists) {
      progress.quizzesCompleted.push({
        quiz: quizId,
        score: score || 0,
      });
      progress.totalPoints += score || 0;
    }
  } else if (type === 'assignment' && assignmentId) {
    const exists = progress.assignmentsCompleted.some(
      (assignment) => assignment.assignment.toString() === assignmentId
    );

    if (!exists) {
      progress.assignmentsCompleted.push({
        assignment: assignmentId,
        score: score || 0,
      });
      progress.totalPoints += score || 0;
    }
  } else if (type === 'digitalLiteracy' && learningPacketId) {
    const exists = progress.digitalLiteracyModulesCompleted.some(
      (module) => module.module.toString() === learningPacketId
    );

    if (!exists) {
      progress.digitalLiteracyModulesCompleted.push({
        module: learningPacketId,
        certificateEarned: score >= 80, // Earn certificate if score >= 80%
      });
      progress.totalPoints += score || 0;
    }
  }

  // Update level based on total points
  if (progress.totalPoints >= 1000) {
    progress.level = 'advanced';
  } else if (progress.totalPoints >= 500) {
    progress.level = 'intermediate';
  } else {
    progress.level = 'beginner';
  }

  progress.lastActivity = new Date();
  await progress.save();

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Progress updated successfully"));
});

const getTeacherStudentsProgress = asyncHandler(async (req, res) => {
  const teacherId = req.teacher._id;

  const studentsProgress = await progressTracking.find({ teacher: teacherId })
    .populate('student', 'Firstname Lastname')
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .sort({ lastActivity: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, studentsProgress, "Students progress fetched successfully"));
});

const getClassProgress = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const classProgress = await progressTracking.find({ class: classId })
    .populate('student', 'Firstname Lastname')
    .populate('teacher', 'Firstname Lastname')
    .sort({ totalPoints: -1 });

  // Calculate class statistics
  const stats = {
    totalStudents: classProgress.length,
    averagePoints: classProgress.length > 0
      ? Math.round(classProgress.reduce((sum, p) => sum + p.totalPoints, 0) / classProgress.length)
      : 0,
    levelDistribution: {
      beginner: classProgress.filter(p => p.level === 'beginner').length,
      intermediate: classProgress.filter(p => p.level === 'intermediate').length,
      advanced: classProgress.filter(p => p.level === 'advanced').length,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { progress: classProgress, stats }, "Class progress fetched successfully"));
});

const addAchievement = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { title, description } = req.body;

  const progress = await progressTracking.findOne({ student: studentId });

  if (!progress) {
    throw new ApiError(404, "Progress record not found");
  }

  // Check if teacher has access
  if (progress.teacher.toString() !== req.teacher._id.toString()) {
    throw new ApiError(403, "You can only add achievements for your students");
  }

  progress.achievements.push({
    title,
    description,
  });

  await progress.save();

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Achievement added successfully"));
});

export {
  getStudentProgress,
  updateProgress,
  getTeacherStudentsProgress,
  getClassProgress,
  addAchievement,
};