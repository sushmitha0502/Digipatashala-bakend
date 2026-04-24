import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "A", "B", "C"
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class',
    required: true,
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
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const section = mongoose.model('section', sectionSchema);

export { section };