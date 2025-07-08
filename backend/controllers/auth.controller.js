import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log("user is : ", user);
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'خطأ في كلمة المرور او الإيميل المدخل' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '7d',
        });
        console.log("user is : " , user);
        console.log("token is : " , token);

        res.status(200).json({
            token,
            user: {
                name: user.name,
            },
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signup = async (req, res) => {
    const { email, userName, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Create new user (password is hashed in pre-save hook)
        const newUser = new User({ email, userName, password });
        await newUser.save();

        // Generate token
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                userName: newUser.userName,
            },
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
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
