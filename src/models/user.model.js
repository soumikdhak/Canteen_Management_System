import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentCode: { type: String, required: true, unique: true, trim: true },
  department: { type: String, trim: true },
  batch: { type: Number },
  balance: { type: Number, default: 0 },
  orderhistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

const staffSchema = new mongoose.Schema({
  age: Number,
  address: { type: String, trim: true },
  position: { type: String, trim: true },
  salary: { type: Number, default: 0 },
  shift: { type: String, enum: ["Morning", "Evening"], default: "Morning" },
  joiningDate: Date,
});

const adminSchema = new mongoose.Schema({
  designation: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    userId: {
      type: String,
      unique: true,
      default: function () {
        const cleanName = this.name
          ? this.name.replace(/\s+/g, "_").toLowerCase()
          : "user";
        const now = new Date();
        const formattedDate = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
        return `${cleanName}_${formattedDate}`;
      },
    },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["Admin", "Staff", "Student"], default: "Student" },
    phoneNumber: { type: String, trim: true },
    refreshToken: String,

    studentInfo: { type: studentSchema, default: {} },
    staffInfo: { type: staffSchema, default: {} },
    adminInfo: { type: adminSchema, default: {} },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
