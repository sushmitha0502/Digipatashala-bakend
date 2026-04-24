import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedOption: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: false,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    schoolName: {
      type: String,
      trim: true,
      default: "Government School",
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      default: "A",
    },
    packetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPacket",
      required: true,
    },
    downloadedOffline: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    syncStatus: {
      type: String,
      enum: ["pending", "synced"],
      default: "pending",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);