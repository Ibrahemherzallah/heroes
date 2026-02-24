import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';



// helper to safely use a string in RegExp
const escapeRegExp = (str = "") =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const login = async (req, res) => {
    const { userEmail, password } = req.body;

    try {
        const normalizedEmail = (userEmail || "").trim();
        console.log("normalized email: >", normalizedEmail, "<");
        const allUsers = await User.find().select("_id email");
        console.log("ALL USERS:", allUsers);
        // 🔍 more tolerant search: case-insensitive exact match
        const user = await User.findOne({
            email: {
                $regex: `^${escapeRegExp(normalizedEmail)}$`,
                $options: "i", // ignore case
            },
        });

        console.log("user is : ", user);

        if (!user || !(await user.comparePassword(password))) {
            return res
                .status(401)
                .json({ error: "خطأ في كلمة المرور أو البريد الإلكتروني" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,      // ✅ correct field
                userName: user.userName,
                isAdmin: user.isAdmin,
                dob: user.dob,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const signup = async (req, res) => {
    const { email, userName, password, dob } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "هذا البريد مستخدم من قبل" });
        }

        const newUser = new User({
            email,
            userName,
            password,
            isAdmin: false,
            // لو جاية من input type="date" فهي string "YYYY-MM-DD"
            dob: dob ? new Date(dob) : undefined,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            message: "تم إنشاء الحساب بنجاح",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                userName: newUser.userName,
                isAdmin: newUser.isAdmin,
                dob: newUser.dob,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('userName email');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req, res) => {
    const { userName, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { userName, email },
            { new: true, runValidators: true }
        ).select('userName email');

        res.status(200).json({ message: 'Profile updated', user: updatedUser });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'كلمات المرور الجديدة غير متطابقة' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });

    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
