import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  fullName: {
    type: String,
    required: true,
  },
  
  profilePic: {
    type: String,
    required: false,
    default: "",
  },
  bio: {
    type: String,
  },
},{timestamps: true});

const User = mongoose.model("user", userSchema);
export default User;