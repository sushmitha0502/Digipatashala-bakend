import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  language: {
    type: String,
    enum: ['english', 'telugu', 'hindi'],
    default: 'english',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'image'],
    },
  }],
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'file-upload'],
      default: 'text',
    },
    options: [String], // for multiple-choice
    correctAnswer: String,
    points: {
      type: Number,
      default: 1,
    },
  }],
  totalPoints: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
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
  assignedTo: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'student',
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: Date,
    answers: [{
      questionIndex: Number,
      answer: String,
      fileUrl: String,
    }],
    score: Number,
    feedback: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const assignment = mongoose.model('assignment', assignmentSchema);

export { assignment };