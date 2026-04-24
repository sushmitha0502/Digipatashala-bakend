import { Router } from "express";
import { addClass, addCourseStudent, addCourseTeacher, canStudentEnroll, enrolledcourseSTD, enrolledcourseTeacher, getCourse, getcourseTeacher, stdEnrolledCoursesClasses, teacherEnrolledCoursesClasses, getTeacherCourses, addRecordedClass, getRecordedClasses, getTeacherRecordedClasses } from "../controllers/course.controller.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";
import { authTeacher } from "../middlewares/teacherAuth.middleware.js";

import { getAllCourses } from "../controllers/course.controller.js";
const router = Router()

router.route("/all").get(getAllCourses);

router.route("/all").get(getCourse)

router.route("/:coursename").get(getcourseTeacher)

router.route("/:coursename/create/:id").post(authTeacher, addCourseTeacher)

router.route("/:coursename/:courseID/add/student/:id").post(authSTD, addCourseStudent)

router.route("/:coursename/:courseID/verify/student/:id").post(authSTD, canStudentEnroll)

router.route("/student/:id/enrolled").get(authSTD, enrolledcourseSTD)

router.route("/teacher/:id/enrolled").get(authTeacher, enrolledcourseTeacher)

router.route("/:courseId/teacher/:teacherId/add-class").post(authTeacher, addClass)

router.route("/:courseId?/teacher/:teacherId/add-recorded-class").post(authTeacher, addRecordedClass)

router.route("/classes/student/:studentId").get(authSTD, stdEnrolledCoursesClasses)

router.route("/classes/teacher/:teacherId").get(authTeacher, teacherEnrolledCoursesClasses)

router.route("/teacher/:teacherId/courses").get(authTeacher, getTeacherCourses)

router.route("/teacher/:teacherId/recorded-classes").get(authTeacher, getTeacherRecordedClasses)

router.route("/recorded-classes").get(authSTD, getRecordedClasses)

export default router;