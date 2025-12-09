import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { makeOrder } from "../controllers/order.controllers.js";

const router = Router();

router.route("/createOrders").post(
    verifyJwt,
    authorizeRoles("admin","student","staff"),
    upload.none(),
    makeOrder
)

export {router as orderRoute};