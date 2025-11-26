import { Router } from "express";
import { logout, registerUser, refreshAccessToken, updateProfilepic, getAllStaffs, getStaff, updatePassword, deletestaff, updateStaffData } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorizeRoles.middleware.js"

const router = Router();

//register the user
router.route("/register").post(
    upload.none(), 
    registerUser
);

//login the user
router.route("/login").post(
    loginUser
);

//refreshaccesstoken
router.route("/refreshaccessToken").post(
    refreshAccessToken
);

//logout
router.route("/logout").post(
    verifyJwt,
    logout
);

//update profile pic 
router.route("/updateProfilepic/:id").patch(
    verifyJwt,
    upload.single("avatar"),
    updateProfilepic
);

//change password
router.route("/changePassword").patch(
    verifyJwt,
    upload.none(),
    updatePassword
);

//get list of all staff
router.route("/allstaffs").get(
    verifyJwt,
    authorizeRoles("admin"),
    getAllStaffs
);

//get any particular staff by id
router.route("/staff/:id").get(
    verifyJwt,
    authorizeRoles("admin"),
    getStaff
);

//delete particular staff by id
router.route("/deleteStaff/:id").delete(
    verifyJwt,
    authorizeRoles("admin"),
    deletestaff
);

//update particular staff by id
router.route("/updateStaffData/:id").patch(
    verifyJwt,
    authorizeRoles("admin"),
    upload.none(),
    updateStaffData
)

export { router as userRoute };
