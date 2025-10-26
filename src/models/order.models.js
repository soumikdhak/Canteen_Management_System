import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
        {
            foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true  },
        }
    ],

    totalAmount: {
         type: Number, 
         required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "paid"], 
        default: "Pending" 
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Preparing", "Completed",],
        default: "Placed" 
    },

    token: { type: String },
},
{
     timestamps: true
}
);

export const Order = mongoose.model("Order", orderSchema);