import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';



// helper to safely use a string in RegExp
const escapeRegExp = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const login = async (req, res) => {
    const { identifier, password } = req.body;
    // identifier = email OR phone

    try {
        const normalized = (identifier || "").trim();

        const user = await User.findOne({
            $or: [
                {
                    email: {
                        $regex: `^${escapeRegExp(normalized)}$`,
                        $options: "i",
                    },
                },
                {
                    phone: normalized,
                },
            ],
        });

        if (!user || !(await user.comparePassword(password))) {
            return res
                .status(401)
                .json({ error: "خطأ في بيانات تسجيل الدخول" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "30d",
        });

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                userName: user.userName,
                role: user.role,
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
    const { phone, userName, password, dob } = req.body;

    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: "هذا الرقم مستخدم من قبل" });
        }

        const newUser = new User({
            userName,
            password,
            isAdmin: false,
            phone,
            points: 0,
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
                userName: newUser.userName,
                isAdmin: newUser.isAdmin,
                dob: newUser.dob,
                role: 'user',
                phone: newUser.phone
            }
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
    try {
        const { userName, phone, dob } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: "المستخدم غير موجود" });
        }

        user.userName = userName || user.userName;
        user.phone = phone || user.phone;
        user.dob = dob || user.dob;

        await user.save();

        res.json({
            message: "تم تحديث البيانات بنجاح",
            user: {
                _id: user._id,
                userName: user.userName,
                phone: user.phone,
                dob: user.dob,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "حدث خطأ أثناء تحديث البيانات" });
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const createWholesaler = async (req, res) => {
    try {
        const { userName, phone, password } = req.body;

        const normalizedPhone = phone.trim();

        const existingUser = await User.findOne({ phone: normalizedPhone });

        if (existingUser) {
            return res.status(400).json({
                message: "رقم الهاتف مستخدم بالفعل",
            });
        }

        const user = new User({
            userName,
            phone: normalizedPhone,
            password,
            role: "wholesaler",
        });

        await user.save();

        res.status(201).json(user);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "رقم الهاتف مستخدم بالفعل",
            });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

// controllers/userController.js

export const updateWholesaler = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, phone, password, dob } = req.body;

        const wholesaler = await User.findById(id);

        if (!wholesaler || wholesaler.role !== "wholesaler") {
            return res.status(404).json({
                message: "تاجر الجملة غير موجود",
            });
        }

        // Normalize phone
        const normalizedPhone = phone?.trim();

        // Check if phone already exists (for another user)
        if (normalizedPhone && normalizedPhone !== wholesaler.phone) {
            const existingUser = await User.findOne({
                phone: normalizedPhone,
                _id: { $ne: id },
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "رقم الهاتف مستخدم بالفعل",
                });
            }

            wholesaler.phone = normalizedPhone;
        }

        if (userName) wholesaler.userName = userName;
        if (dob) wholesaler.dob = dob;

        // Only update password if provided
        if (password && password.trim() !== "") {
            wholesaler.password = password; // assuming hashing middleware exists
        }

        await wholesaler.save();

        res.status(200).json({
            message: "تم تحديث تاجر الجملة بنجاح",
            wholesaler,
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting admin
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "لا يمكن حذف الأدمن" });
        }

        await User.findByIdAndDelete(id);

        res.json({ message: "تم حذف المستخدم بنجاح" });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};