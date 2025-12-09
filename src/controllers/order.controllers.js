import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Order } from "../models/order.models.js";
import {Dish} from "../models/dish.model.js"

const makeOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const {items} = req.body;

    if(!items && items.length===0) throw new apiError(400, "items are required for making orders");

    const orderItems = [];

    for(const i of items){
        const food = await Dish.findById(i.foodItem);

        if(!food) throw new apiError(404,"FoodItem not found!");

        if(i.quantity<=0) throw new apiError (400, "item quantity should be grater than zero");

        if(i.quantity>=food.stock) throw new apiError(400, `Only ${food.stock} ${food.name} available`);

        //one task research and implementation about the stock update in the fooditem document-to-do

        orderItems.push({
            foodItem: food._id,
            quantity:i.quantity,
            price:food.price
        });
    }


    const order = await Order.create({
        user:userId,
        items:orderItems   
    });

    const populateOrder = await Order.findById(order._id)
    .populate("user", "name email userId") 
    .populate("items.foodItem", "name description price image category");
    
    return res
    .status(200)
    .json(
        new apiResponse(
            201,
            populateOrder,
            "Order Placed Successfully"
        )
    )
}); 

export {makeOrder};