import express from "express";
import { Quiz } from "../models/quiz.model.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { title, instructions, questions } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Quiz title is required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one question is required" });
    }

    const normalizedQuestions = questions.map((question, index) => ({
      questionId:
        question?.questionId ||
        `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      questionText: question?.questionText?.trim(),
      options: Array.isArray(question?.options)
        ? question.options.map((option) => option.trim()).filter(Boolean)
        : [],
      correctAnswer: question?.correctAnswer?.trim(),
    }));

    const hasInvalidQuestion = normalizedQuestions.some(
      (question) =>
        !question.questionText ||
        question.options.length < 2 ||
        !question.correctAnswer
    );

    if (hasInvalidQuestion) {
      return res.status(400).json({
        message: "Each question needs text, at least 2 options, and a correct answer",
      });
    }

    const newQuiz = await Quiz.create({
      title: title.trim(),
      instructions: instructions?.trim(),
      questions: normalizedQuestions,
    });

    return res.status(201).json({
      success: true,
      data: newQuiz,
    });
  } catch (error) {
    console.error("QUIZ CREATE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (_, res) => {
  try {
    const quizzes = await Quiz.find({ packetId: null }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error("QUIZ LIST ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("QUIZ FETCH ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
