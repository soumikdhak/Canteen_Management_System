import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import mongoose from "mongoose";

// const registerUser = asyncHandler(async (req, res) =>{
//     const {name, email, password, role, phoneNumber,}=req.body;

    
// });

export {registerUser};