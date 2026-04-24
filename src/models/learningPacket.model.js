import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ["pdf", "video", "audio", "image", "text", "link"],
      default: "pdf",
    },
    sizeKB: { type: Number, default: 0 },
  },
  { _id: false }
);

const learningPacketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Telugu", "Punjabi"],
      default: "English",
    },
    category: {
      type: String,
      enum: [
        "Mathematics",
        "Science",
        "English",
        "Punjabi",
        "Hindi",
        "Telugu",
        "Social Studies",
        "Digital Literacy",
        "Computer Basics",
        "Cyber Safety",
        "Typing Skills",
      ],
      default: "Digital Literacy",
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'school',
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'section',
    },
    schoolName: {
      type: String,
      trim: true,
      default: "Nabha Government School",
    },
    section: {
      type: String,
      trim: true,
      default: "A",
    },
    packetType: {
      type: String,
      enum: ["lesson", "assignment", "quiz", "digital-literacy"],
      default: "lesson",
    },
    lessonText: {
      type: String,
      default: "",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'quiz',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'assignment',
    },
    downloadable: {
      type: Boolean,
      default: true,
    },
    lowBandwidth: {
      type: Boolean,
      default: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    createdByRole: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

export const LearningPacket = mongoose.model("LearningPacket", learningPacketSchema);