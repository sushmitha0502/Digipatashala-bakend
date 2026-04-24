import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Teacher, Teacherdocs } from "../models/teacher.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Sendmail } from "../utils/Nodemailer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { student } from "../models/student.model.js";

/* ------------------ TOKENS ------------------ */
const generateAccessAndRefreshTokens = async (teacherId) => {
    try {
        const teacher = await Teacher.findById(teacherId);
        const Accesstoken = teacher.generateAccessToken();
        const Refreshtoken = teacher.generateRefreshToken();

        teacher.Refreshtoken = Refreshtoken;
        await teacher.save({ validateBeforeSave: false });

        return { Accesstoken, Refreshtoken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

/* ------------------ SIGNUP ------------------ */
const signup = asyncHandler(async (req, res) => {

    const { Firstname, Lastname, Email, Password, Subject } = req.body;

    if ([Firstname, Lastname, Email, Password, Subject].some(f => !f)) {
        throw new ApiError(400, "All fields are required");
    }

    const existedTeacher = await Teacher.findOne({ Email });
    if (existedTeacher) throw new ApiError(400, "Teacher already exists");

    const existedStudent = await student.findOne({ Email });
    if (existedStudent) throw new ApiError(400, "Email belongs to student");

    const newTeacher = await Teacher.create({
        Firstname,
        Lastname,
        Email,
        Password,
        Subject, // ✅ NEW
        Isverified: true,
    });

    const createdTeacher = await Teacher.findById(newTeacher._id).select("-Password");

    const { Accesstoken, Refreshtoken } =
        await generateAccessAndRefreshTokens(newTeacher._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
        .status(200)
        .cookie("TeacherAccesstoken", Accesstoken, options)
        .cookie("TeacherRefreshtoken", Refreshtoken, options)
        .json(new ApiResponse(200, createdTeacher, "Signup successful"));
});

/* ------------------ LOGIN ------------------ */
const login = asyncHandler(async (req, res) => {

    const Email = req.user.Email;
    const Password = req.user.Password;

    const teacher = await Teacher.findOne({ Email });
    if (!teacher) throw new ApiError(404, "Teacher not found");

    const isMatch = await teacher.isPasswordCorrect(Password);
    if (!isMatch) throw new ApiError(401, "Incorrect password");

    const { Accesstoken, Refreshtoken } =
        await generateAccessAndRefreshTokens(teacher._id);

    const loggedInTeacher = await Teacher.findById(teacher._id)
        .select("-Password -Refreshtoken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
        .status(200)
        .cookie("TeacherAccesstoken", Accesstoken, options)
        .cookie("TeacherRefreshtoken", Refreshtoken, options)
        .json(new ApiResponse(200, loggedInTeacher, "Login successful"));
});

/* ------------------ LOGOUT ------------------ */
const logout = asyncHandler(async (req, res) => {

    await Teacher.findByIdAndUpdate(
        req.teacher._id,
        { $set: { Refreshtoken: undefined } }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
        .status(200)
        .clearCookie("TeacherAccesstoken", options)
        .clearCookie("TeacherRefreshtoken", options)
        .clearCookie("Accesstoken", options)
        .clearCookie("Refreshtoken", options)
        .json(new ApiResponse(200, {}, "Logged out"));
});

/* ------------------ GET TEACHER ------------------ */
const getTeacher = asyncHandler(async (req, res) => {

    const teacher = await Teacher.findById(req.params.id)
        .populate("Teacherdetails"); // ✅ IMPORTANT

    if (!teacher) throw new ApiError(404, "Teacher not found");

    return res
        .status(200)
        .json(new ApiResponse(200, teacher, "Teacher data"));
});

/* ------------------ ADD DETAILS ------------------ */
const addTeacherDetails = asyncHandler(async (req, res) => {

    const id = req.params.id;

    const {
        Phone,
        Address,
        Experience,
        SecondarySchool,
        HigherSchool,
        UGcollege,
        PGcollege,
        SecondaryMarks,
        HigherMarks,
        UGmarks,
        PGmarks,
    } = req.body;

    if (!Phone?.trim() || !Address?.trim() || !Experience?.toString().trim()) {
        throw new ApiError(400, "Phone, Address and Experience are required");
    }

    const AadhaarLocalPath = req.files?.Aadhaar?.[0]?.path;
    const SecondaryLocalPath = req.files?.Secondary?.[0]?.path;
    const HigherLocalPath = req.files?.Higher?.[0]?.path;
    const UGLocalPath = req.files?.UG?.[0]?.path;
    const PGLocalPath = req.files?.PG?.[0]?.path;

    if (!AadhaarLocalPath) {
        throw new ApiError(400, "Aadhaar is required");
    }

    const teacherDetailsPayload = {
        Phone,
        Address,
        Experience: Number(Experience),
        Aadhaar: (await uploadOnCloudinary(AadhaarLocalPath)).url,
        ...(SecondarySchool?.trim() ? { SecondarySchool } : {}),
        ...(HigherSchool?.trim() ? { HigherSchool } : {}),
        ...(UGcollege?.trim() ? { UGcollege } : {}),
        ...(PGcollege?.trim() ? { PGcollege } : {}),
        ...(SecondaryMarks !== undefined && SecondaryMarks !== "" ? { SecondaryMarks: Number(SecondaryMarks) } : {}),
        ...(HigherMarks !== undefined && HigherMarks !== "" ? { HigherMarks: Number(HigherMarks) } : {}),
        ...(UGmarks !== undefined && UGmarks !== "" ? { UGmarks: Number(UGmarks) } : {}),
        ...(PGmarks !== undefined && PGmarks !== "" ? { PGmarks: Number(PGmarks) } : {}),
    };

    if (SecondaryLocalPath) {
        const Secondary = await uploadOnCloudinary(SecondaryLocalPath);
        teacherDetailsPayload.Secondary = Secondary.url;
    }
    if (HigherLocalPath) {
        const Higher = await uploadOnCloudinary(HigherLocalPath);
        teacherDetailsPayload.Higher = Higher.url;
    }
    if (UGLocalPath) {
        const UG = await uploadOnCloudinary(UGLocalPath);
        teacherDetailsPayload.UG = UG.url;
    }
    if (PGLocalPath) {
        const PG = await uploadOnCloudinary(PGLocalPath);
        teacherDetailsPayload.PG = PG.url;
    }

    const teacherdetails = await Teacherdocs.create(teacherDetailsPayload);

    const updatedTeacher = await Teacher.findByIdAndUpdate(
        id,
        {
            Teacherdetails: teacherdetails._id,
            Isapproved: "pending",
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedTeacher, "Details added")
    );
});

/* ------------------ UPDATE PROFILE ------------------ */
const updateTeacherProfile = asyncHandler(async (req, res) => {

    const id = req.params.id;

    if (String(req.teacher._id) !== String(id)) {
        throw new ApiError(403, "not authorized");
    }

    const { Firstname, Lastname, Phone, Address, Experience } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
        id,
        { Firstname, Lastname },
        { new: true }
    );

    if (!teacher) {
        throw new ApiError(404, "Teacher not found");
    }

    if (teacher.Teacherdetails) {
        await Teacherdocs.findByIdAndUpdate(
            teacher.Teacherdetails,
            {
                ...(Phone !== undefined ? { Phone } : {}),
                ...(Address !== undefined ? { Address } : {}),
                ...(Experience !== undefined ? { Experience } : {}),
            },
            { new: true }
        );
    }

    const updatedTeacher = await Teacher.findById(id)
        .select("-Password -Refreshtoken")
        .populate("Teacherdetails");

    return res.status(200).json(
        new ApiResponse(200, updatedTeacher, "Profile updated")
    );
});

/* ------------------ FORGOT PASSWORD ------------------ */
const ForgetPassword = asyncHandler(async (req, res) => {

    const { Email } = req.body;

    const user = await Teacher.findOne({ Email });
    if (!user) throw new ApiError(404, "Email not found");

    await user.generateResetToken();

    const resetLink = `${process.env.FRONTEND_URL}/teacher/forgetpassword/${user.forgetPasswordToken}`;

    await Sendmail(
        Email,
        "RESET PASSWORD",
        `<a href="${resetLink}">Reset Password</a>`
    );

    res.status(200).json({ message: "Reset email sent" });
});
const mailVerified = asyncHandler(async (req, res) => {
  const id = req.query.id;

  const updatedInfo = await Teacher.updateOne(
    { _id: id },
    { $set: { Isverified: true } }
  );

  if (updatedInfo.nModified === 0) {
    throw new ApiError(404, "Teacher not found or already verified");
  }

  return res.send(`
    <h1>Email Verified Successfully</h1>
  `);
});

/* ------------------ RESET PASSWORD ------------------ */
const ResetPassword = asyncHandler(async (req, res) => {

    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword)
        throw new ApiError(400, "Passwords do not match");

    const user = await Teacher.findOne({
        forgetPasswordToken: token,
        forgetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Invalid or expired token");

    user.Password = password;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
});
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find()
    .select("-Password -Refreshtoken")
    .populate("Teacherdetails");

  return res.status(200).json(
    new ApiResponse(200, teachers, "All teachers fetched")
  );
});
/* ------------------ EXPORTS ------------------ */
export {
    signup,
    mailVerified, 
    login,
    logout,
    getTeacher,
    addTeacherDetails,
    updateTeacherProfile,
    ForgetPassword,
    ResetPassword,
    getAllTeachers,
};
