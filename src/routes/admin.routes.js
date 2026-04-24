import { Router } from "express";
import { adminLogin, adminLogout, adminSignUp, approveStudent, approveTeacher, checkStudentDocuments, checkTeacherDocuments, forApproval, sendmessage, allmessages, readMessage, toapproveCourse, approveCourse, getRecordedClassesForAdmin, approveRecordedClass, getAdminUsers, getAdminQuizzes, updateStudentByAdmin, updateTeacherByAdmin } from "../controllers/admin.controller.js";
import { authAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.route("/signup").post(adminSignUp)

router.route("/login").post(adminLogin)

router.route("/:adminID/approve").post(authAdmin, forApproval)

router.route("/:adminID/approve/student/:studentID").post(authAdmin, approveStudent)

router.route("/:adminID/approve/teacher/:teacherID").post(authAdmin,approveTeacher)

router.route("/:adminID/documents/student/:studentID").get(authAdmin, checkStudentDocuments)

router.route("/:adminID/documents/teacher/:teacherID").get(authAdmin, checkTeacherDocuments)

router.route("/logout").post(authAdmin, adminLogout)

router.route("/contact-us").post(sendmessage)

router.route("/messages/all").get(authAdmin, allmessages)

router.route("/message/read").patch(authAdmin, readMessage)

router.route("/:adminID/approve/course").get(authAdmin, toapproveCourse)

router.route("/:adminID/approve/course/:courseID").post(authAdmin, approveCourse)

router.route("/:adminID/recorded-classes").get(authAdmin, getRecordedClassesForAdmin)
router.route("/:adminID/recorded-classes/:courseID/:recordID/approve").post(authAdmin, approveRecordedClass)

router.route("/:adminID/users").get(authAdmin, getAdminUsers)

router.route("/:adminID/quizzes").get(authAdmin, getAdminQuizzes)

router.route("/:adminID/users/student/:studentID").patch(authAdmin, updateStudentByAdmin)

router.route("/:adminID/users/teacher/:teacherID").patch(authAdmin, updateTeacherByAdmin)

export default router;

//testing
