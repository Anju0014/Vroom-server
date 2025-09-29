import {Router} from "express";
import  ChatController from "../../controllers/implementation/chat/chatController"
import ChatService from "../../services/implementation/chat/chatServices"
import ChatRepository from "../../repositories/implementation/chat/chatRepository";
import authMiddleware from "../../middlewares/authMiddleWare";
const chatRouter=Router();


const chatRepository= new ChatRepository()
const chatService= new ChatService(chatRepository);
const chatController=new ChatController(chatService);

chatRouter.get("/room/:roomId",authMiddleware,(req,res)=>chatController.getChatHistory(req,res))

chatRouter.get("/ownerchats",authMiddleware,(req,res)=>chatController.getOwnerChats(req,res))

export default chatRouter