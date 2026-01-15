import {
  CreateComplaintDTO,
  UpdateComplaintByAdminDTO,
} from '../../../dtos/complaints/complaint.dto';

import IComplaintRepository from '../../../repositories/interfaces/complaints/IComplaintRepository';
import IComplaintService from '../../interfaces/complaints/IComplaintServices';

import { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import logger from '../../../utils/logger';
import { Types } from 'mongoose';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';
import {
  ComplaintAdminResponseDTO,
  RaisedByUserDTO,
} from '../../../dtos/complaints/complaintAdminResponse.dto';

class ComplaintService implements IComplaintService {
  private _complaintRepository: IComplaintRepository;

  constructor(complaintRepository: IComplaintRepository) {
    this._complaintRepository = complaintRepository;
  }

  // async createComplaint(
  //   data: CreateComplaintDTO,
  //   userId: string,
  //   role: "customer" | "carOwner"
  // ) {
  //   return await this._complaintRepository.create({
  //      bookingId: new Types.ObjectId(data.bookingId),
  //   raisedBy: new Types.ObjectId(userId),
  //   raisedByRole: role,
  //   title: data.title,
  //   description: data.description,
  //   category: data.category,
  //   status: "open",
  //   priority: "medium",
  //   });
  // }

  async createComplaint(data: CreateComplaintDTO, userId: string, role: 'customer' | 'carOwner') {
    // if (!Types.ObjectId.isValid(data.bookingId)) {
    //   throw new Error("Invalid bookingId");
    // }

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId');
    }

    return await this._complaintRepository.create({
      bookingId: data.bookingId,
      raisedBy: new Types.ObjectId(userId),
      raisedByRole: role,
      title: data.title,
      description: data.description,
      category: data.category,
      complaintProof: data.complaintProof,
      status: 'open',
      priority: 'medium',
    });
  }

  async getMyComplaints(userId: string) {
    return await this._complaintRepository.findByUser(userId);
  }

  // async getAllComplaints() {
  //   return await this._complaintRepository.findAll();
  // }

  async getAllComplaints(): Promise<ComplaintAdminResponseDTO[]> {
    const complaints = await this._complaintRepository.findAll();

    let raisedByUser: RaisedByUserDTO | null = null;

    return Promise.all(
      complaints.map(async (c) => {
        let raisedByUser: RaisedByUserDTO | null = null;

        if (c.raisedByRole === 'customer') {
          const customer = await Customer.findById(c.raisedBy)
            .select('fullName email phoneNumber')
            .lean();

          if (customer) {
            raisedByUser = {
              _id: customer._id.toString(),
              fullName: customer.fullName,
              email: customer.email,
              phoneNumber: customer.phoneNumber,
              role: 'customer',
            };
          }
        }

        if (c.raisedByRole === 'carOwner') {
          const carOwner = await CarOwner.findById(c.raisedBy)
            .select('fullName email phoneNumber')
            .lean();

          if (carOwner) {
            raisedByUser = {
              _id: carOwner._id.toString(),
              fullName: carOwner.fullName,
              email: carOwner.email,
              phoneNumber: carOwner.phoneNumber,
              role: 'carOwner',
            };
          }
        }

        return {
          _id: c._id.toString(),
          bookingId: c.bookingId,
          title: c.title,
          description: c.description,
          category: c.category,
          status: c.status,
          priority: c.priority,
          adminResponse: c.adminResponse,
          resolvedAt: c.resolvedAt,
          createdAt: c.createdAt,
          raisedByRole: c.raisedByRole,
          raisedByUser,
        };
      })
    );
  }

  async updateComplaintByAdmin(complaintId: string, data: UpdateComplaintByAdminDTO) {
    const update: any = {
      status: data.status,
      priority: data.priority,
      adminResponse: data.adminResponse,
    };

    if (data.status === 'resolved') {
      update.resolvedAt = new Date();
    }

    return await this._complaintRepository.updateById(complaintId, update);
  }
}

export default ComplaintService;
