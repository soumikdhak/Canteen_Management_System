import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import  {User}  from "../models/user.model.js";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phoneNumber,
    designation,
    age,
    address,
    position,
    shift,
    joiningDate,
    studentCode,
    department,
    batch
  } = req.body;

  // Basic validation
  if ([name, email, password, role, phoneNumber].some(field => !field || field.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }
  
  console.log(req.body); // ✅ will show your form data now


  // Check if user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) throw new apiError(409, "User with this email already exists");

  
  // Create base user
  const user = new User({
    name,
    email,
    password,
    role,
    phoneNumber
  });

  // Attach role-specific data
  if (role === "student") {
    user.studentInfo = { studentCode, department, batch };
  }
  if (role === "staff") {
    user.staffInfo = { age, address, position, shift, joiningDate };
  }
  if (role === "admin") {
    user.adminInfo = { designation };
  }

  await user.save();

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
