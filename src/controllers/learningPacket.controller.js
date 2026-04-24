import { LearningPacket } from "../models/learningPacket.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createLearningPacket = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    grade,
    language,
    category,
    lessonText,
    packetType,
    school,
    class: classId,
    section,
  } = req.body;

  if (!title || !description || !subject || !grade) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const attachments = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (uploadResult) {
        attachments.push({
          name: file.originalname,
          url: uploadResult.url,
          type: file.mimetype.split('/')[0],
          sizeKB: Math.round(file.size / 1024),
        });
      }
    }
  }

  const learningPacket = await LearningPacket.create({
    title,
    description,
    subject,
    grade: parseInt(grade),
    language: language || 'english',
    category,
    lessonText,
    packetType,
    attachments,
    school,
    class: classId,
    section,
    createdById: req.teacher?._id || req.admin?._id,
    createdByRole: req.teacher ? 'teacher' : 'admin',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, learningPacket, "Learning packet created successfully"));
});

const getLearningPackets = asyncHandler(async (req, res) => {
  const {
    grade,
    subject,
    language,
    category,
    school,
    class: classId,
    section,
    packetType,
  } = req.query;

  const filter = {};

  if (grade) filter.grade = parseInt(grade);
  if (subject) filter.subject = subject;
  if (language) filter.language = language;
  if (category) filter.category = category;
  if (school) filter.school = school;
  if (classId) filter.class = classId;
  if (section) filter.section = section;
  if (packetType) filter.packetType = packetType;

  filter.published = true;

  const learningPackets = await LearningPacket.find(filter)
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .populate('createdById', 'Firstname Lastname')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, learningPackets, "Learning packets fetched successfully"));
});

const getLearningPacketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPacket = await LearningPacket.findById(id)
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .populate('createdById', 'Firstname Lastname')
    .populate('quiz')
    .populate('assignment');

  if (!learningPacket) {
    throw new ApiError(404, "Learning packet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, learningPacket, "Learning packet fetched successfully"));
});

const updateLearningPacket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const learningPacket = await LearningPacket.findByIdAndUpdate(
    id,
    { ...updates, grade: updates.grade ? parseInt(updates.grade) : undefined },
    { new: true }
  );

  if (!learningPacket) {
    throw new ApiError(404, "Learning packet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, learningPacket, "Learning packet updated successfully"));
});

const deleteLearningPacket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPacket = await LearningPacket.findByIdAndDelete(id);

  if (!learningPacket) {
    throw new ApiError(404, "Learning packet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Learning packet deleted successfully"));
});

const downloadLearningPacket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPacket = await LearningPacket.findById(id);

  if (!learningPacket) {
    throw new ApiError(404, "Learning packet not found");
  }

  // Mark as downloaded for progress tracking
  // This would be handled by the progress tracking system

  return res
    .status(200)
    .json(new ApiResponse(200, learningPacket, "Learning packet ready for download"));
});

export {
  createLearningPacket,
  getLearningPackets,
  getLearningPacketById,
  updateLearningPacket,
  deleteLearningPacket,
  downloadLearningPacket,
};