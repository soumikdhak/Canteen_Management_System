import { Router } from "express";
import { addfoodItem, deletefoodItem, foodItem, getAllItems, getFoods, updatefoodItem, updateImage } from "../controllers/foodItem.controllers.js";
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

//update fooditem image route
router.route("/updateimage/:id").patch(
    verifyJwt,
    authorizeRoles("admin"),
    upload.single("image"),
    updateImage
)

//delete fooditem route
router.route("/deleteimage/:id").delete(
    verifyJwt,
    authorizeRoles("admin"),
    deletefoodItem
)

//get all fooditems
router.route("/allitems").get(
    verifyJwt,
    getAllItems
)

//get particular food item
router.route("/foodItem/:id").get(
    verifyJwt,
    foodItem
)

//get food accordding to search  
router.route("/foods").get(
    verifyJwt,
    upload.none(),
    getFoods
)

export { router as foodItemRoute };