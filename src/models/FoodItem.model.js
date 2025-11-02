import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({

    name: { 
        type: String, 
        required: true, 
        trim: true,
        unique: true 
    },

    description: {
         type: String, 
         trim: true 
    },

    price: { 
        type: Number, 
        required: true 
    },

    category: { 
        type: String,
        trim: true 
    },

    image: {
         type: String,
         default: process.env.DEFAULT_FOODITEM_URL ||
         "https://res.cloudinary.com/dkmutafep/image/upload/v1762113987/default_foodItem_cbzdgo.jpg"
    },

    isAvailable: {
         type: Boolean,
         default: false 
    },

},
{ timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", foodItemSchema);
