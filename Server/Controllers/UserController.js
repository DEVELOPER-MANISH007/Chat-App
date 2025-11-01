import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../Lib/Utils.js";
import cloudinary from "../Lib/Cloudinary.js";
// Signup a new user

export const signup = async (req, res) => {
  try {
    const { email, password, fullName, bio } = req.body;
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }
    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      return res.json({ success: false, message: "Incorrect Password" });
    }
    const token = generateToken(userData._id);
    res.json({
      success: true,
      userData,
      token,
      message: "User Logged In Successfully",
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Controller to update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;
    let updatedUser;
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio, profilePic: upload.secure_url },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true }
      );
    }
    res.json({
      success: true,
      userData: updatedUser,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
