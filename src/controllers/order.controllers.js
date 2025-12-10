import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Order } from "../models/order.models.js";
import {Dish} from "../models/dish.model.js"
import { User } from "../models/user.model.js";

const makeOrder = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { items } = req.body;

  if (!items || items.length === 0)
    throw new apiError(400, "Items are required for making orders");

  const orderItems = [];

  for (const i of items) {

    const food = await Dish.findById(i.foodItem);
    if (!food) throw new apiError(404, "Food item not found");

    if (i.quantity <= 0)
      throw new apiError(400, "Quantity must be greater than 0");

    if (i.quantity > food.stock)
      throw new apiError(
        400,
        `Only ${food.stock} ${food.name} available`
      );

    orderItems.push({
      foodItem: food._id,
      quantity: i.quantity,
      name: food.name,
      price: food.price,
      image: food.image
    });

    // Deduct stock
    food.stock -= i.quantity;
    await food.save();
  }

  // DO NOT pass totalAmount here
  const order = await Order.create({
    user: userId,
    items: orderItems,
  });

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name email userId")
    .populate(
      "items.foodItem",
      "name description price image category"
    );

  return res.status(201).json(
    new apiResponse(201, populatedOrder, "Order placed successfully")
  );

});

const getOrderListofUser = asyncHandler(async (req, res) => {

  const { sort, page = 1, limit = 5 } = req.query;

  const userId = req.user._id;

  let sortOption = {};

  if (sort === "newest") sortOption.createdAt = -1;
  else if (sort === "oldest") sortOption.createdAt = 1;

  const skip = (Number(page) - 1) * Number(limit);

  // Get orders
  const orders = await Order.find({ user: userId })
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  //  Count total orders
  const total = await Order.countDocuments({ user: userId });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        count: orders.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        orders
      },
      "Here are all listed orders"
    )
  );

});

const getOrderById = asyncHandler (async (req, res) => {
    const {id} = req.params;

    const order = await Order.findById(id);

    if(!order) throw new apiError(404,"Order not found!");

    return res
    .status(200)
    .json(
        new apiResponse(200,{order},`successfully fetched the token no. ${order.token}`)
    )
})


export {makeOrder, getOrderListofUser, getOrderById};