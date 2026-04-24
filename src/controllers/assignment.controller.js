import { assignment } from "../models/assignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    grade,
    language,
    dueDate,
    questions,
    school,
    class: classId,
    section,
  } = req.body;

  if (!title || !description || !subject || !grade || !dueDate) {
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
        });
      }
    }
  }

  const totalPoints = questions ? questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0;

  const newAssignment = await assignment.create({
    title,
    description,
    subject,
    grade: parseInt(grade),
    language: language || 'english',
    dueDate: new Date(dueDate),
    questions: questions || [],
    attachments,
    totalPoints,
    school,
    class: classId,
    section,
    createdBy: req.teacher?._id || req.admin?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newAssignment, "Assignment created successfully"));
});

const getAssignments = asyncHandler(async (req, res) => {
  const {
    grade,
    subject,
    language,
    school,
    class: classId,
    section,
    createdBy,
  } = req.query;

  const filter = {};

  if (grade) filter.grade = parseInt(grade);
  if (subject) filter.subject = subject;
  if (language) filter.language = language;
  if (school) filter.school = school;
  if (classId) filter.class = classId;
  if (section) filter.section = section;
  if (createdBy) filter.createdBy = createdBy;

  filter.isActive = true;

  const assignments = await assignment.find(filter)
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .populate('createdBy', 'Firstname Lastname')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, assignments, "Assignments fetched successfully"));
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assignmentData = await assignment.findById(id)
    .populate('school', 'name')
    .populate('class', 'name grade')
    .populate('section', 'name')
    .populate('createdBy', 'Firstname Lastname')
    .populate('assignedTo.student', 'Firstname Lastname');

  if (!assignmentData) {
    throw new ApiError(404, "Assignment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, assignmentData, "Assignment fetched successfully"));
});

const submitAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  const assignmentData = await assignment.findById(id);

  if (!assignmentData) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check if student is assigned
  const studentIndex = assignmentData.assignedTo.findIndex(
    (assignment) => assignment.student.toString() === req.student._id.toString()
  );

  if (studentIndex === -1) {
    throw new ApiError(403, "You are not assigned to this assignment");
  }

  // Handle file uploads for answers
  const processedAnswers = [];
  if (answers && answers.length > 0) {
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      let fileUrl = null;

      if (req.files && req.files[i]) {
        const uploadResult = await uploadOnCloudinary(req.files[i].path);
        if (uploadResult) {
          fileUrl = uploadResult.url;
        }
      }

      processedAnswers.push({
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        fileUrl,
      });
    }
  }

  assignmentData.assignedTo[studentIndex].submitted = true;
  assignmentData.assignedTo[studentIndex].submittedAt = new Date();
  assignmentData.assignedTo[studentIndex].answers = processedAnswers;

  await assignmentData.save();

  return res
    .status(200)
    .json(new ApiResponse(200, assignmentData, "Assignment submitted successfully"));
});

const gradeAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, score, feedback } = req.body;

  const assignmentData = await assignment.findById(id);

  if (!assignmentData) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check if teacher created this assignment
  if (assignmentData.createdBy.toString() !== req.teacher._id.toString()) {
    throw new ApiError(403, "You can only grade assignments you created");
  }

  const studentIndex = assignmentData.assignedTo.findIndex(
    (assignment) => assignment.student.toString() === studentId
  );

  if (studentIndex === -1) {
    throw new ApiError(404, "Student not found in assignment");
  }

  assignmentData.assignedTo[studentIndex].score = score;
  assignmentData.assignedTo[studentIndex].feedback = feedback;
  assignmentData.assignedTo[studentIndex].gradedAt = new Date();

  await assignmentData.save();

  return res
    .status(200)
    .json(new ApiResponse(200, assignmentData, "Assignment graded successfully"));
});

const assignToStudents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { students } = req.body;

  const assignmentData = await assignment.findById(id);

  if (!assignmentData) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check if teacher created this assignment
  if (assignmentData.createdBy.toString() !== req.teacher._id.toString()) {
    throw new ApiError(403, "You can only assign students to your assignments");
  }

  // Add students to assignedTo array if not already present
  students.forEach(studentId => {
    const exists = assignmentData.assignedTo.some(
      (assignment) => assignment.student.toString() === studentId
    );

    if (!exists) {
      assignmentData.assignedTo.push({
        student: studentId,
        submitted: false,
      });
    }
  });

  await assignmentData.save();

  return res
    .status(200)
    .json(new ApiResponse(200, assignmentData, "Students assigned successfully"));
});

export {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeAssignment,
  assignToStudents,
};