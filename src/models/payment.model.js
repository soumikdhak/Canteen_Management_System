import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

    order: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Order", 
        required: true 
    },

    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },

    amount: { 
        type: Number, 
        required: true 
    },

    paymentMethod: { 
        type: String, 
        enum: ["Card", "UPI", "Wallet"], 
        required: true 
    },

    transactionId: { 
        type: String, 
        required: true, 
        unique: true 
    },

    status: { 
        type: String, 
        enum: ["success", "Failed"], 
        default: "Pending" 
    },
},
{ 
    timestamps: true 
}
);

export const Payment = mongoose.model("Payment", paymentSchema);