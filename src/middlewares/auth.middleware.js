import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // 1️ Get token from cookies or Authorization header
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new apiError(401, "Unauthorized request");

  // 2️ Decode the token (use jwt.verify, not jwt.sign)
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  console.log(decodedToken);

  // 3️ Find user by decoded _id
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

  if (!user) throw new apiError(401, "Invalid access token");

  // 4️ Attach user info to request
  req.user = user;

  // 5️ Continue to next middleware
  next();
});
