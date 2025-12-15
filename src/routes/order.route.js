import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { cancelOrder, getOrderByAdminOnly, getOrderById, getOrderListofUser, getPendingOrders, makeOrder, serveOrder } from "../controllers/order.controllers.js";

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

//get particular order by id
router.route("/orderbyId/:id").get(
    verifyJwt,
    authorizeRoles("student", "admin"),
    upload.none(),
    getOrderById
);

//get all pending orders for staff
router.route("/pendingOrders").get(
    verifyJwt,
    authorizeRoles("staff","admin"),
    upload.none(),
    getPendingOrders
)

//served fooditem 
router.route("/orderServed/:id").post(
    verifyJwt,
    authorizeRoles("staff","admin"),
    upload.none(),
    serveOrder
)

//get orders for admins
router.route("/orders").get(
    verifyJwt,
    authorizeRoles("admin"),
    upload.none(),
    getOrderByAdminOnly
)

//cancelled the order
router.route("/cancelOrder/:id").post(
    verifyJwt,
    authorizeRoles("student"),
    upload.none(),
    cancelOrder
)

export {router as orderRoute};