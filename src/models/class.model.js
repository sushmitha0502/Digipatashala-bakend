import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Class 1", "Class 2", etc.
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'school',
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
  }],
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'section',
  }],
  subjects: [{
    name: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'teacher',
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const classModel = mongoose.model('class', classSchema);

export { classModel };