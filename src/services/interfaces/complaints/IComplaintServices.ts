import { CreateComplaintDTO, UpdateComplaintByAdminDTO } from "../../../dtos/complaints/complaint.dto";
import { IComplaint } from "../../../models/complaints/complaintModel";

interface IComplaintService {
  createComplaint(
    data: CreateComplaintDTO,
    userId: string,
    role: "customer" | "carOwner"
  ): Promise<IComplaint>;

  getMyComplaints(
    userId: string,
    role: "customer" | "carOwner"
  ): Promise<IComplaint[]|null>;

  getAllComplaints(): Promise<IComplaint[]>;

  updateComplaintByAdmin(
    complaintId: string,
    data: UpdateComplaintByAdminDTO
  ): Promise<IComplaint|null>;
}

export default IComplaintService;
