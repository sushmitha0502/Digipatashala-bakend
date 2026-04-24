import { Router } from "express";
import {
    signup as teacherSignup,
    mailVerified as teacherMailVerified,
    login as teacherLogin,
    logout as teacherLogout,
    addTeacherDetails,
    getTeacher,
    updateTeacherProfile,
    ForgetPassword,
    ResetPassword,
    getAllTeachers   // ✅ NEW
} from "../controllers/teacher.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { authTeacher } from "../middlewares/teacherAuth.middleware.js";
import { authSchema } from "../middlewares/joiLogin.middleware.js";

const router = Router();

router.route("/signup").post(teacherSignup);
router.route("/verify").get(teacherMailVerified);
router.route("/login").post(authSchema, teacherLogin);
router.route("/logout").post(authTeacher, teacherLogout);

// ✅ NEW API
router.route("/all").get(getAllTeachers);

router.route("/verification/:id").post(
    authTeacher,
    upload.fields([
        { name: "Aadhaar", maxCount: 1 },
        { name: "Secondary", maxCount: 1 },
        { name: "Higher", maxCount: 1 },
        { name: "UG", maxCount: 1 },
        { name: "PG", maxCount: 1 }
    ]),
    addTeacherDetails
);
router.post("/register", teacherSignup);
router.route("/teacherdocument/:id").get(authTeacher, getTeacher);
router.route("/update/:id").put(authTeacher, updateTeacherProfile);
router.route('/forgetpassword').post(ForgetPassword);
router.route('/forgetpassword/:token').post(ResetPassword);

export default router;