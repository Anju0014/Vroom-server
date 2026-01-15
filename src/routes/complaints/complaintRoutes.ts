import { Router } from 'express';

import ComplaintController from '../../controllers/implementation/complaints/complaintController';
import ComplaintService from '../../services/implementation/compliants/complaintServices';
import ComplaintRepository from '../../repositories/implementation/complaints/complaintRepository';
import authMiddleware, { checkBlocked, verifyRole } from '../../middlewares/authMiddleWare';

const complaintRouter = Router();

const complaintRepository = new ComplaintRepository();
const complaintService = new ComplaintService(complaintRepository);
const complaintController = new ComplaintController(complaintService);

complaintRouter.post('/', authMiddleware, (req, res) =>
  complaintController.createComplaint(req, res)
);

complaintRouter.get('/', authMiddleware, (req, res) =>
  complaintController.getMyComplaints(req, res)
);

complaintRouter.get('/admin', authMiddleware, (req, res) =>
  complaintController.getAllComplaints(req, res)
);

complaintRouter.patch('/admin/:id', authMiddleware, verifyRole(['admin']), (req, res) =>
  complaintController.updateComplaintByAdmin(req, res)
);

export default complaintRouter;
