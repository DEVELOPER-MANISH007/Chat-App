//get all users except the logged in user

import Message from "../Models/Message.js";
import User from "../Models/User.js";
import cloudinary from "../Lib/Cloudinary.js";
// Access io and userSocketMap via req.app

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //Count no of message not seem
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Get all message for selected user

export const getMessages = async (req, res) => {
  try {
    const { id: seletedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: seletedUserId },
        { senderId: seletedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      {
        senderId: seletedUserId,
        receiverId: myId,
      },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// send message to seleceted user

export const sedMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || undefined,
      image: imageUrl,
    })

    //Emit the new message to the receiver's socket
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const receiverSocketId = userSocketMap[receiverId];
    if (io && receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage)
    res.json({ success: true, newMessage });

    
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
