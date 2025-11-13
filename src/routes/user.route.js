import { Router } from "express";
import { logout, registerUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Now multer will parse form-data into req.body
router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(loginUser);
router.route("/refreshaccessToken").post(refreshAccessToken);
router.route("/logout").post(verifyJwt,logout);


export { router as userRoute };
