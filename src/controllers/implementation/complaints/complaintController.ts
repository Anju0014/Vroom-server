import { Response, Request } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { StatusCode } from '../../../constants/statusCode';

import IComplaintController from '../../interfaces/complaints/IComplaintController';
import IComplaintService from '../../../services/interfaces/complaints/IComplaintServices';
import { MESSAGES } from '../../../constants/message';
import logger from '../../../utils/logger';
import { mapComplaintToResponse } from '../../../dtos/complaints/complaintResponse.dto';

class ComplaintController implements IComplaintController {
  private _complaintService: IComplaintService;

  constructor(_complaintService: IComplaintService) {
    this._complaintService = _complaintService;
  }

  async createComplaint(req: CustomRequest, res: Response) {
    const { userId, role } = req;

      if (!userId || !role) {
         res.status(StatusCode.UNAUTHORIZED).json({
          message: "Unauthorized",
        });
        return
      }
    if (role === "admin") {
     res.status(StatusCode.FORBIDDEN).json({
      message: "Admins cannot create complaints",
    });
    return
  }

      const complaint = await this._complaintService.createComplaint(
        req.body,
        userId,
        role
      );

     res.status(StatusCode.CREATED).json({
      message: "Complaint created successfully",
      complaint: mapComplaintToResponse(complaint),
    });
    return
  }


   async getMyComplaints(req: CustomRequest, res: Response) {
    const {userId,role} = req;
      if (!userId || !role) {
        res.status(StatusCode.UNAUTHORIZED).json({
          message: "Unauthorized",
        });
         return
      }
      if (role === "admin") {
     res.status(StatusCode.FORBIDDEN).json({
      message: "Admins cannot create complaints",
    });
     return
  }

    const complaints =
      await this._complaintService.getMyComplaints(userId,role);

     res.status(StatusCode.OK).json(complaints);
      return
  }


  async getAllComplaints(req: Request, res: Response) {
    const complaints =
      await this._complaintService.getAllComplaints();

   res.status(StatusCode.OK).json(complaints);
    return
  }


  async updateComplaintByAdmin(
    req: Request,
    res: Response
  ) {
    const { id } = req.params;

    const updatedComplaint =
      await this._complaintService.updateComplaintByAdmin(
        id,
        req.body
      );

   res.status(StatusCode.OK).json({
      message: "Complaint updated successfully",
      updatedComplaint,
    });
     return
  }
}

export default ComplaintController