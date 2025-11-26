import {  asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import  {User}  from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

//register the user
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

  //  1. Basic validation
  if ([name, email, password, role, phoneNumber].some(field => !field || field.trim() === "")) {
    throw new apiError(400, "All required fields must be provided");
  }

  //  2. Check if user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) throw new apiError(409, "User with this email already exists");

  //  3. Create new user
  const user = new User({
    name,
    email,
    password,
    role,
    phoneNumber
  });

  //  4. Attach role-specific data
  if (role === "student") {
    user.studentInfo = { studentCode, department, batch };
  } else if (role === "staff") {
    user.staffInfo = { age, address, position, shift, joiningDate };
  } else if (role === "admin") {
    user.adminInfo = { designation };
  }

  //  5. Save the user
  await user.save();

  //  6. Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  //  7. Fetch created user without sensitive data
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) throw new apiError(500, "Error while creating user");

  //  8. Cookie options
  const options = {
    httpOnly: true,
    secure: true, // set true only in production with HTTPS
    sameSite: "None"
  };

  //  9. Send response
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


//login controller user
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


//logout the user
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


//refresh access token
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


//update profile picture
const updateProfilepic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const imagefile = req.file?.buffer; // multer memoryStorage

  if (!imagefile)
    throw new apiError(400, "Image file is required!");

  const uploadedFile = await uploadOnCloudinary(imagefile);

  if (!uploadedFile)
    throw new apiError(500, "Error while uploading the profile picture!");

  console.log(uploadedFile);
  

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        avatar: uploadedFile.secure_url,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  if (!user) throw new apiError(404, "User not found!");

  return res.status(200).json(
    new apiResponse(200, {user}, "Avatar uploaded successfully!")
  );
});


//update password
const updatePassword = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const { oldPassword, newPassword } = req.body;

  if(oldPassword===newPassword) throw new apiError(400, "New password cannot be the same as old password")

  const user = await User.findById(id);

  if (!user) {
    throw new apiError(404, "User not found!");
  }

  const isPasswordCorrect = await user.isPasswordMatch(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Wrong password!");
  }

  user.password = newPassword;  // pre-save hook will hash it
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse(200, "Password changed successfully!")
  );
});

 //get list of all staff
const getAllStaffs = asyncHandler(async (req, res) => {
  const staffs = await User.find({ role: "staff" }).select("-password -refreshToken");

  if(!staffs) throw new apiError(400, "Staff List is not able to fetch!");

  return res.status(200).json({
    success: true,
    message: "Staffs data fetched successfully!",
    count: staffs.length,
    staffs
  });
});


//get particular staff by id
const getStaff = asyncHandler(async (req, res) => {
    const {id} = req.params;
  
    const user = await User.findById(id);
  
    if (!user) {
      throw new apiError(404, "User not found");
    }
  
    return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user,
        "Staff data fetched successfully")
    )
})

const deletestaff = asyncHandler(async (req,res) => {
  const {id} = req.params;

  const user = await User.findByIdAndDelete(id);

  if(!user) throw new apiError(404,"food item not found!")

  return res
  .status(200)
  .json(
    new apiResponse(200,"staff deleted successfully!")
  )
})


//update particular staff by id
const updateStaffData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Extract top-level fields
  const { name, email, phoneNumber } = req.body;

  // 2. Extract nested staffInfo fields
  const { salary, shift, position, address, age } = req.body.staffInfo || {};

  // 3. Combine all fields into a single object for checking emptiness
  const allFields = { name, email, phoneNumber, salary, shift, position, address, age };

  // 4. Check if every field is empty
  const noFieldProvided = Object.values(allFields).every(
    (val) => val === undefined || val === null || val === ""
  );

  if (noFieldProvided) {
    throw new apiError(400, "At least one field must be provided to update.");
  }

  // 5. Build Mongoose update object (supports nested updates)
  const fields = {
    name,
    email,
    phoneNumber,
    "staffInfo.salary": salary,
    "staffInfo.shift": shift,
    "staffInfo.position": position,
    "staffInfo.address": address,
    "staffInfo.age": age,
  };

  const updateData = Object.entries(fields).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  // 6. Update database
  const updatedStaff = await User.findByIdAndUpdate(id, { $set: updateData }, {
    new: true,
    runValidators: true,
  });

  if (!updatedStaff) throw new apiError(404, "Staff not found");

  return res.status(200).json(
    new apiResponse(200, updatedStaff, "Staff data updated successfully!")
  );
});

export { 
  registerUser, 
  loginUser, 
  logout, 
  refreshAccessToken, 
  updateProfilepic, 
  getAllStaffs, 
  getStaff, 
  updatePassword, 
  deletestaff,
  updateStaffData 
};