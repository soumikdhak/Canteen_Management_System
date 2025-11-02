import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new mongoose.Schema({
  studentCode: { type: String, required: true, unique: true, trim: true },
  department: { type: String, trim: true },
  batch: { type: Number },
  balance: { type: Number, default: 0 },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

const staffSchema = new mongoose.Schema({
  age: Number,
  address: { type: String, trim: true },
  position: { type: String, trim: true },
  salary: { type: Number, default: 0 },
  shift: { type: String, enum: ["Morning", "Evening"], default: "Morning" },
  joiningDate: Date,
});

const adminSchema = new mongoose.Schema({
  designation: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    userId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        const cleanName = this.name
          ? this.name.replace(/\s+/g, "_").toLowerCase()
          : "user";
        const now = new Date();
        const formatted = now
          .toISOString()
          .replace(/[-:.TZ]/g, "")
          .slice(2, 12); // YYMMDDHHMM
        return `${cleanName}_${formatted}`;
      },
    },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "staff", "student"], default: "student", required: true },
    phoneNumber: { type: String, trim: true },
    avatar: { 
      type: String, 
      default: process.env.DEFAULT_AVATAR_URL || 
      "https://res.cloudinary.com/dkmutafep/image/upload/v1762113536/Default_avatar_u26d4p.jpg"
    },
    refreshToken: String,

    studentInfo: { type: studentSchema, default: {} },
    staffInfo: { type: staffSchema, default: {} },
    adminInfo: { type: adminSchema, default: {} },
  },
  { timestamps: true }
);

//  Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//  Compare password
userSchema.methods.isPasswordMatch = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//  JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userId: this.userId,
      role: this.role,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

//  JWT refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
