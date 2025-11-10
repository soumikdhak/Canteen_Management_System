import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Now multer will parse form-data into req.body
router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(loginUser)

export { router as userRoute };
