// Get all users except the logged in user
import Message from "../Models/Message.js";
import User from "../Models/User.js";
import cloudinary from "../Lib/Cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Count number of messages not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({ 
        senderId: user._id, 
        receiverId: userId, 
        seen: false 
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error("Error getting users for sidebar:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by creation time

    await Message.updateMany(
      {
        senderId: selectedUserId,
        receiverId: myId,
      },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error getting messages:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking message as seen:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
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
    });

    // Emit the new message to the receiver's socket
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const receiverSocketId = userSocketMap[receiverId];
    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });

  } catch (error) {
    console.error("Error sending message:", error.message);
    res.json({ success: false, message: error.message });
  }
};
