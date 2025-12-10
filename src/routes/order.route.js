import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { getOrderById, getOrderListofUser, makeOrder } from "../controllers/order.controllers.js";

const router = Router();

//create order 
router.route("/createOrders").post(
    verifyJwt,
    authorizeRoles("student"),
    upload.none(),
    makeOrder
);

//get order list by student id
router.route("/orderLists").get(
    verifyJwt,
    authorizeRoles("student"),
    upload.none(),
    getOrderListofUser
);

router.route("/orderbyId/:id").get(
    verifyJwt,
    authorizeRoles("student", "admin"),
    upload.none(),
    getOrderById
);

export {router as orderRoute};