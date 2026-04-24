import { ApiError } from "../utils/ApiError.js";
import { Teacher } from "../models/teacher.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const authTeacher = asyncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies?.TeacherAccesstoken ?? req.cookies?.Accesstoken;
    const refreshToken =
        req.cookies?.TeacherRefreshtoken ?? req.cookies?.Refreshtoken;

    if (!accessToken && !refreshToken) {
        throw new ApiError(401, "unauthorized req");
    }

    try {
        if (accessToken) {
            const decodedAccessToken = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            const teacher = await Teacher.findById(decodedAccessToken?._id)
                .select("-Password -Refreshtoken");

            if (!teacher) {
                throw new ApiError(401, "invalid access token");
            }

            req.teacher = teacher;
            return next();
        }
    } catch (error) {
        if (!refreshToken) {
            throw new ApiError(401, "invalid access token");
        }
    }

    try {
        const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const teacherWithToken = await Teacher.findById(decodedRefreshToken?._id);

        if (
            !teacherWithToken ||
            teacherWithToken.Refreshtoken !== refreshToken
        ) {
            throw new ApiError(401, "invalid access token");
        }

        const newAccessToken = teacherWithToken.generateAccessToken();

        res.cookie("TeacherAccesstoken", newAccessToken, cookieOptions);

        req.teacher = await Teacher.findById(teacherWithToken._id)
            .select("-Password -Refreshtoken");

        next();
    } catch (error) {
        throw new ApiError(401, "invalid access token");
    }
});

export { authTeacher };
