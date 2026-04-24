import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      trim: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length >= 2;
        },
        message: "Each question must have at least 2 options.",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    packetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPacket",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      default: "Read each question and choose the correct answer.",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
