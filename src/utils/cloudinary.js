import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { apiError } from "./apiError.js";
import { asyncHandler } from "./asyncHandler.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file buffer to Cloudinary
export const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(new apiError(500, "Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );

    // IMPORTANT FIX
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    
  });
};

