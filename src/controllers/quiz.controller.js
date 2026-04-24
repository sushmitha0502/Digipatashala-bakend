import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz } from "../models/quiz.model.js";

const getAllQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find();

    return res.status(200).json({
  success: true,
  data: quizzes
});
});

export { getAllQuizzes };