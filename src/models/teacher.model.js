import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const teacherSchema = new mongoose.Schema(
{
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },

    Firstname: {
        type: String,
        required: true,
        trim: true,
    },

    Lastname: {
        type: String,
        required: true,
        trim: true,
    },

    Password: {
        type: String,
        required: true,
    },

    // ✅ NEW — SUBJECT FIELD (IMPORTANT)
    Subject: {
        type: String,
        required: true,
        enum: ["math", "physics", "chemistry", "biology", "computer"],
    },

    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,

    Isverified: {
        type: Boolean,
        default: false,
    },

    Isapproved: {
        type: String,
        enum: ["approved", "rejected", "pending", "reupload"],
        default: "pending",
    },

    Remarks: {
        type: String,
    },

    Refreshtoken: {
        type: String,
    },

    Teacherdetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teacherdocs",
    },

    Balance: {
        type: Number,
        default: 0,
    },

    WithdrawalHistory: [
        {
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    enrolledStudent: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "student",
            },
            isNewEnrolled: {
                type: Boolean,
                default: true,
            },
        },
    ],
},
{
    timestamps: true,
}
);


// 🔥 CAPITALIZE NAMES
teacherSchema.pre("save", async function (next) {
    if (this.isModified("Firstname") || this.isNew) {
        this.Firstname =
            this.Firstname.charAt(0).toUpperCase() +
            this.Firstname.slice(1).toLowerCase();
    }

    if (this.isModified("Lastname") || this.isNew) {
        this.Lastname =
            this.Lastname.charAt(0).toUpperCase() +
            this.Lastname.slice(1).toLowerCase();
    }

    next();
});


// 🔐 HASH PASSWORD
teacherSchema.pre("save", async function (next) {
    if (!this.isModified("Password")) return next();

    this.Password = await bcrypt.hash(this.Password, 10);
    next();
});


// 🔑 PASSWORD CHECK
teacherSchema.methods.isPasswordCorrect = async function (Password) {
    return await bcrypt.compare(Password, this.Password);
};


// 🔐 ACCESS TOKEN
teacherSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            Email: this.Email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};


// 🔐 REFRESH TOKEN
teacherSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            Email: this.Email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


// 🔁 RESET PASSWORD TOKEN
teacherSchema.methods.generateResetToken = async function () {
    const reset = crypto.randomBytes(20).toString("hex");

    this.forgetPasswordToken = crypto
        .createHash("sha256")
        .update(reset)
        .digest("hex");

    this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await this.save();
};



// 📄 TEACHER DOCUMENTS SCHEMA
const TeacherDetailsSchema = new mongoose.Schema(
{
    Phone: {
        type: Number,
        required: true,
        trim: true,
        unique: true,
    },

    Address: {
        type: String,
        required: true,
    },

    Experience: {
        type: Number,
        required: true,
    },

    SecondarySchool: {
        type: String,
    },

    HigherSchool: {
        type: String,
    },

    UGcollege: {
        type: String,
    },

    PGcollege: {
        type: String,
    },

    SecondaryMarks: {
        type: Number,
    },

    HigherMarks: {
        type: Number,
    },

    UGmarks: {
        type: Number,
    },

    PGmarks: {
        type: Number,
    },

    Aadhaar: {
        type: String,
        required: true,
    },

    Secondary: {
        type: String,
    },

    Higher: {
        type: String,
    },

    UG: {
        type: String,
    },

    PG: {
        type: String,
    },
},
{
    timestamps: true,
}
);


// ✅ MODELS
const Teacher = mongoose.model("teacher", teacherSchema);
const Teacherdocs = mongoose.model("teacherdocs", TeacherDetailsSchema);

export { Teacher, Teacherdocs };
