import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({

    name: { 
        type: String, 
        required: true, 
        trim: true 
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
         type: String 
    },

    isAvailable: {
         type: Boolean,
         default: true 
    },

},
{ timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", foodItemSchema);
