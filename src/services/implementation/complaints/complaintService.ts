
import {CreateComplaintDTO,UpdateComplaintByAdminDTO}  from '../../../dtos/complaints/complaint.dto'



import IComplaintRepository from '../../../repositories/interfaces/complaints/IComplaintRepository';
import IComplaintService  from '../../interfaces/complaints/IComplaintServices';

import { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import logger from '../../../utils/logger';
import { Types } from 'mongoose';

class ComplaintService implements IComplaintService {
  private _complaintRepository: IComplaintRepository;

  constructor(complaintRepository: IComplaintRepository) {
    this._complaintRepository = complaintRepository;
  }


  async createComplaint(
    data: CreateComplaintDTO,
    userId: string,
    role: "customer" | "carOwner"
  ) {
    return await this._complaintRepository.create({
       bookingId: new Types.ObjectId(data.bookingId),
    carId: new Types.ObjectId(data.carId),
    raisedBy: new Types.ObjectId(userId),
    raisedByRole: role,
    title: data.title,
    description: data.description,
    category: data.category,
    status: "open",
    priority: "medium",
    });
  }

  async getMyComplaints(userId: string) {
    return await this._complaintRepository.findByUser(userId);
  }

  async getAllComplaints() {
    return await this._complaintRepository.findAll();
  }

  async updateComplaintByAdmin(
    complaintId: string,
    data: UpdateComplaintByAdminDTO
  ) {
    const update: any = {
      status: data.status,
      priority: data.priority,
      adminResponse: data.adminResponse,
    };

    if (data.status === "resolved") {
      update.resolvedAt = new Date();
    }

    return await this._complaintRepository.updateById(
      complaintId,
      update
    );
  }
}

export default ComplaintService