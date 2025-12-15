import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
        {
            foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true  },
        }
    ],

    totalAmount: {
         type: Number, 
    },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid"], 
        default: "Pending" 
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Preparing", "Served","Cancelled"],
        default: "Placed" 
    },

    token: { 
      type: Number, 
      default: 0 
    },
},
{
     timestamps: true
}
);

orderSchema.pre("save", function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  next();
});

orderSchema.pre("save", async function (next) {
  // Only assign token if it doesn't exist already
  if (!this.token || this.token === 0) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Count how many orders exist for today
    const todaysCount = await mongoose.model("Order").countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Assign token as (count + 1)
    this.token = todaysCount + 1;
  }

  next();
});



export const Order = mongoose.model("Order", orderSchema);
