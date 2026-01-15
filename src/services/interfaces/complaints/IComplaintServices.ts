import {
  CreateComplaintDTO,
  UpdateComplaintByAdminDTO,
} from '../../../dtos/complaints/complaint.dto';
import { ComplaintAdminResponseDTO } from '../../../dtos/complaints/complaintAdminResponse.dto';

import { IComplaint } from '../../../models/complaints/complaintModel';

interface IComplaintService {
  createComplaint(
    data: CreateComplaintDTO,
    userId: string,
    role: 'customer' | 'carOwner'
  ): Promise<IComplaint>;

  getMyComplaints(userId: string, role: 'customer' | 'carOwner'): Promise<IComplaint[] | null>;

  getAllComplaints(): Promise<ComplaintAdminResponseDTO[]>;

  updateComplaintByAdmin(
    complaintId: string,
    data: UpdateComplaintByAdminDTO
  ): Promise<IComplaint | null>;
}

export default IComplaintService;
