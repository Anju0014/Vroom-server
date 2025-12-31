import { Router } from "express";

import ComplaintController from "../../controllers/implementation/complaints/complaintController";
import ComplaintService from "../../services/implementation/complaints/complaintService";
import ComplaintRepository from "../../repositories/implementation/complaint/complaintRepository";
import authMiddleware, {checkBlocked,verifyRole,} from "../../middlewares/authMiddleWare";

const complaintRouter = Router();

const complaintRepository = new ComplaintRepository();
const complaintService = new ComplaintService(complaintRepository);
const complaintController = new ComplaintController(complaintService);



complaintRouter.post("/", authMiddleware,(req, res) => complaintController.createComplaint(req, res));

complaintRouter.get("/",authMiddleware,checkBlocked,(req, res) => complaintController.getMyComplaints(req, res));


complaintRouter.get("/admin",authMiddleware,checkBlocked,verifyRole(["admin"]),(req, res) => complaintController.getAllComplaints(req, res));

complaintRouter.patch("/admin/:id",authMiddleware,checkBlocked,verifyRole(["admin"]),(req, res) => complaintController.updateComplaintByAdmin(req, res));

export default complaintRouter;
