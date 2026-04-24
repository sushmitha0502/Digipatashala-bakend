import mongoose from "mongoose";
import { LearningPacket } from "../models/learningPacket.model.js";
import { StudentProgress } from "../models/studentProgress.model.js";
import { Quiz } from "../models/quiz.model.js";

const ok = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const fail = (res, message = "Something went wrong", status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

export const createLearningPacket = async (req, res) => {
  try {
    const {
      title,
      description,
      language,
      category,
      grade,
      subject,
      schoolName,
      section,
      packetType,
      lessonText,
      attachments,
      downloadable,
      lowBandwidth,
      createdByRole,
      createdById,
    } = req.body;

    if (!title || !description || !grade || !subject) {
      return fail(res, "title, description, grade and subject are required", 400);
    }

    const packet = await LearningPacket.create({
      title,
      description,
      language,
      category,
      grade,
      subject,
      schoolName,
      section,
      packetType,
      lessonText,
      attachments: Array.isArray(attachments) ? attachments : [],
      downloadable: downloadable ?? true,
      lowBandwidth: lowBandwidth ?? true,
      createdByRole: createdByRole || "teacher",
      createdById: createdById || null,
    });

    return ok(res, packet, "Learning packet created", 201);
  } catch (error) {
    return fail(res, error.message);
  }
};

export const getLearningPackets = async (req, res) => {
  try {
    const { grade, subject, language, packetType, category, schoolName, section } = req.query;

    const filter = { published: true };

    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (language) filter.language = language;
    if (packetType) filter.packetType = packetType;
    if (category) filter.category = category;
    if (schoolName) filter.schoolName = schoolName;
    if (section) filter.section = section;

    const packets = await LearningPacket.find(filter).sort({ createdAt: -1 });

    return ok(res, packets, "Learning packets fetched");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const getLearningPacketById = async (req, res) => {
  try {
    const { id } = req.params;

    const packet = await LearningPacket.findById(id);
    if (!packet) {
      return fail(res, "Packet not found", 404);
    }

    const quiz = await Quiz.findOne({ packetId: id });

    return ok(res, { packet, quiz }, "Packet details fetched");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const updateLearningPacket = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await LearningPacket.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return fail(res, "Packet not found", 404);
    }

    return ok(res, updated, "Packet updated");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const deleteLearningPacket = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await LearningPacket.findByIdAndDelete(id);
    if (!deleted) {
      return fail(res, "Packet not found", 404);
    }

    await Quiz.deleteMany({ packetId: id });
    await StudentProgress.deleteMany({ packetId: id });

    return ok(res, deleted, "Packet deleted");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const createQuizForPacket = async (req, res) => {
  try {
    const { packetId } = req.params;
    const { title, instructions, questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(packetId)) {
      return fail(res, "Invalid packet id", 400);
    }

    const packet = await LearningPacket.findById(packetId);
    if (!packet) {
      return fail(res, "Packet not found", 404);
    }

    let quiz = await Quiz.findOne({ packetId });

    if (quiz) {
      quiz.title = title || quiz.title;
      quiz.instructions = instructions || quiz.instructions;
      quiz.questions = Array.isArray(questions) ? questions : quiz.questions;
      await quiz.save();
      return ok(res, quiz, "Quiz updated");
    }

    quiz = await Quiz.create({
      packetId,
      title: title || `${packet.title} Quiz`,
      instructions: instructions || "Read each question and choose the correct answer.",
      questions: Array.isArray(questions) ? questions : [],
    });

    return ok(res, quiz, "Quiz created", 201);
  } catch (error) {
    return fail(res, error.message);
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { packetId } = req.params;
    const {
      studentId,
      studentName,
      grade,
      section,
      schoolName,
      answers,
      downloadedOffline,
      completed,
      completionPercent,
    } = req.body;

    if (!studentName || !grade) {
      return fail(res, "studentName and grade are required", 400);
    }

    const quiz = await Quiz.findOne({ packetId });
    if (!quiz) {
      return fail(res, "Quiz not found for this packet", 404);
    }

    let score = 0;
    const normalizedAnswers = [];

    for (const question of quiz.questions) {
      const studentAnswer = (answers || []).find((a) => a.questionId === question.questionId);
      const selectedOption = studentAnswer?.selectedOption || "";
      const isCorrect = selectedOption === question.correctAnswer;

      if (isCorrect) score += 1;

      normalizedAnswers.push({
        questionId: question.questionId,
        selectedOption,
        isCorrect,
      });
    }

    const scorePercent =
      quiz.questions.length > 0 ? Math.round((score / quiz.questions.length) * 100) : 0;

    const progress = await StudentProgress.findOneAndUpdate(
      {
        studentName,
        packetId,
      },
      {
        studentId: studentId || null,
        studentName,
        schoolName: schoolName || "Nabha Government School",
        grade,
        section: section || "A",
        packetId,
        downloadedOffline: downloadedOffline ?? false,
        completed: completed ?? true,
        completionPercent: completionPercent ?? 100,
        quizScore: scorePercent,
        answers: normalizedAnswers,
        syncStatus: "pending",
        lastSeenAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return ok(
      res,
      {
        progress,
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
        scorePercent,
      },
      "Quiz submitted"
    );
  } catch (error) {
    return fail(res, error.message);
  }
};

export const saveOfflineDownload = async (req, res) => {
  try {
    const { packetId } = req.params;
    const { studentId, studentName, grade, section, schoolName } = req.body;

    if (!studentName || !grade) {
      return fail(res, "studentName and grade are required", 400);
    }

    const packet = await LearningPacket.findById(packetId);
    if (!packet) {
      return fail(res, "Packet not found", 404);
    }

    const progress = await StudentProgress.findOneAndUpdate(
      { studentName, packetId },
      {
        studentId: studentId || null,
        studentName,
        grade,
        section: section || "A",
        schoolName: schoolName || "Nabha Government School",
        packetId,
        downloadedOffline: true,
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return ok(res, progress, "Offline download marked");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const syncStudentProgress = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return fail(res, "items must be an array", 400);
    }

    const synced = [];

    for (const item of items) {
      const progress = await StudentProgress.findOneAndUpdate(
        {
          studentName: item.studentName,
          packetId: item.packetId,
        },
        {
          studentId: item.studentId || null,
          studentName: item.studentName,
          schoolName: item.schoolName || "Nabha Government School",
          grade: item.grade,
          section: item.section || "A",
          packetId: item.packetId,
          downloadedOffline: item.downloadedOffline ?? false,
          completed: item.completed ?? false,
          completionPercent: item.completionPercent ?? 0,
          quizScore: item.quizScore ?? 0,
          syncStatus: "synced",
          lastSeenAt: new Date(),
        },
        { upsert: true, new: true }
      );

      synced.push(progress);
    }

    return ok(res, synced, "Offline progress synced");
  } catch (error) {
    return fail(res, error.message);
  }
};

export const getTeacherProgressDashboard = async (req, res) => {
  try {
    const { grade, section, schoolName } = req.query;

    const filter = {};
    if (grade) filter.grade = grade;
    if (section) filter.section = section;
    if (schoolName) filter.schoolName = schoolName;

    const progressList = await StudentProgress.find(filter).populate(
      "packetId",
      "title subject language packetType"
    );

    const totalStudents = new Set(progressList.map((item) => item.studentName)).size;
    const completedCount = progressList.filter((item) => item.completed).length;
    const averageScore =
      progressList.length > 0
        ? Math.round(
            progressList.reduce((acc, item) => acc + (item.quizScore || 0), 0) / progressList.length
          )
        : 0;

    return ok(
      res,
      {
        summary: {
          totalStudents,
          totalRecords: progressList.length,
          completedCount,
          averageScore,
        },
        records: progressList,
      },
      "Teacher progress dashboard fetched"
    );
  } catch (error) {
    return fail(res, error.message);
  }
};

export const getSchoolMappingOverview = async (req, res) => {
  try {
    const packets = await LearningPacket.find().select(
      "schoolName grade section subject language packetType title"
    );

    const grouped = {};

    for (const item of packets) {
      const school = item.schoolName || "Unknown School";
      if (!grouped[school]) grouped[school] = {};

      const cls = `Class ${item.grade}`;
      if (!grouped[school][cls]) grouped[school][cls] = {};

      const section = item.section || "A";
      if (!grouped[school][cls][section]) grouped[school][cls][section] = [];

      grouped[school][cls][section].push({
        id: item._id,
        title: item.title,
        subject: item.subject,
        language: item.language,
        packetType: item.packetType,
      });
    }

    return ok(res, grouped, "School / class / section mapping fetched");
  } catch (error) {
    return fail(res, error.message);
  }
};