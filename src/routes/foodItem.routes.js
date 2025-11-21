import { Router } from "express";
import { addfoodItem, updatefoodItem, updateImage } from "../controllers/foodItem.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

//add food item route

router.route("/addfoodItem").post(
    upload.none(),
    verifyJwt,
    authorizeRoles("admin"),
    addfoodItem
);

//update fooditem route
router.route("/updatefoodItem/:id").patch(
    verifyJwt,
    authorizeRoles("admin"),
    updatefoodItem
);

//update fooditem image
router.route("/updateimage/:id").patch(
    verifyJwt,
    authorizeRoles("admin"),
    updateImage
)



export { router as foodItemRoute };