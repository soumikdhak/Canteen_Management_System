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
         default: "" 
    },

    isAvailable: {
         type: Boolean,
         default: false 
    },

},
{ timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", foodItemSchema);
