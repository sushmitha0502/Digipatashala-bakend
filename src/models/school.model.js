import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const school = mongoose.model('school', schoolSchema);

export { school };