import express from "express";
import { protectRoute } from "../Middleware/Auth.js";
import { getUsersForSidebar , getMessages,markMessageAsSeen,sedMessage } from "../Controllers/MessageController.js";


const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);   
messageRouter.get('/marks/:id',protectRoute,markMessageAsSeen)
messageRouter.post("/send/:id", protectRoute, sedMessage);      

export default messageRouter;