import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { student } from "../models/student.model.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const authSTD = asyncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies?.StudentAccesstoken ?? req.cookies?.Accesstoken;
    const refreshToken =
        req.cookies?.StudentRefreshtoken ?? req.cookies?.Refreshtoken;

    if (!accessToken && !refreshToken) {
        throw new ApiError(401, "unauthorized req");
    }

    try {
        if (accessToken) {
            const decodedAccessToken = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            const Student = await student.findById(decodedAccessToken?._id)
                .select("-Password -Refreshtoken");

            if (!Student) {
                throw new ApiError(401, "invalid access token");
            }

            req.Student = Student;
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

        const currentStudent = await student.findById(decodedRefreshToken?._id);

        if (
            !currentStudent ||
            currentStudent.Refreshtoken !== refreshToken
        ) {
            throw new ApiError(401, "invalid access token");
        }

        const newAccessToken = currentStudent.generateAccessToken();

        res.cookie("StudentAccesstoken", newAccessToken, cookieOptions);

        req.Student = await student.findById(currentStudent._id)
            .select("-Password -Refreshtoken");

        next();
    } catch (error) {
        throw new ApiError(401, "invalid access token");
    }
});

export { authSTD };
