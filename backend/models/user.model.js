// models/User.ts (or .js)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        isSuperAdmin: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        dob: {
            type: Date,
            required: false,
        },
        points: {
            type: Number,
            required: false,
        },
        role: {
            type: String,
            required: true,
            enum: ["admin", "user", "wholesaler", "cashier"],
            default: 'user',
        },
        orderHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;