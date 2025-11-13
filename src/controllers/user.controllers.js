import {  asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import  {User}  from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

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

  // 🧩 1. Basic validation
  if ([name, email, password, role, phoneNumber].some(field => !field || field.trim() === "")) {
    throw new apiError(400, "All required fields must be provided");
  }

  // 🧩 2. Check if user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) throw new apiError(409, "User with this email already exists");

  // 🧩 3. Create new user
  const user = new User({
    name,
    email,
    password,
    role,
    phoneNumber
  });

  // 🧩 4. Attach role-specific data
  if (role === "student") {
    user.studentInfo = { studentCode, department, batch };
  } else if (role === "staff") {
    user.staffInfo = { age, address, position, shift, joiningDate };
  } else if (role === "admin") {
    user.adminInfo = { designation };
  }

  // 🧩 5. Save the user
  await user.save();

  // 🧩 6. Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 🧩 7. Fetch created user without sensitive data
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) throw new apiError(500, "Error while creating user");

  // 🧩 8. Cookie options
  const options = {
    httpOnly: true,
    secure: true, // set true only in production with HTTPS
    sameSite: "None"
  };

  // 🧩 9. Send response
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken
        },
        "User registered successfully"
      )
    );
});


//login controller
const loginUser = asyncHandler(async (req, res) => {
  const { email,userId, password } = req.body;

  if (!email && !password)
    throw new apiError(400, "Email and password are required");

  //console.log("Incoming email:", email);
  const user = await User.findOne({
        $or: [{userId}, {email}]
  })
  //console.log("User found:", user);

  if (!user) throw new apiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) throw new apiError(401, "Invalid user credentials");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  // 1️ Remove refresh token from DB for the logged-in user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // removes refreshToken field
    },
    { new: true }
  );

  // 2️ Cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // 3️ Clear both cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new apiError(401, "Invalid or expired refresh token");
  }

  // Generate new tokens
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // Update the refresh token in DB
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
});


export { registerUser, loginUser, logout, refreshAccessToken };
