import mongoose from "mongoose";

const progressTrackingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true,
  },
  teacher: {
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
  subject: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  learningPacketsCompleted: [{
    packet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'learningPacket',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    score: Number,
  }],
  quizzesCompleted: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'quiz',
    },
    score: Number,
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  assignmentsCompleted: [{
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'assignment',
    },
    score: Number,
    submittedAt: Date,
    gradedAt: Date,
  }],
  digitalLiteracyModulesCompleted: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'learningPacket',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    certificateEarned: {
      type: Boolean,
      default: false,
    },
  }],
  totalPoints: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const progressTracking = mongoose.model('progressTracking', progressTrackingSchema);

export { progressTracking };