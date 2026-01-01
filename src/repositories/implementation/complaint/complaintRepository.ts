import { Complaint, IComplaint } from "../../../models/complaints/complaintModel";
import  IComplaintRepository  from "../../interfaces/complaints/IComplaintRepository"

 class ComplaintRepository implements IComplaintRepository {

  async create(data: Partial<IComplaint>): Promise<IComplaint> {
    return await Complaint.create(data);
  }

  async findByUser(userId: string): Promise<IComplaint[]> {
    return await Complaint.find({ raisedBy: userId })
      .sort({ createdAt: -1 });
  }

  async findAll(): Promise<IComplaint[]> {
    return await Complaint.find()
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IComplaint | null> {
    return await Complaint.findById(id);
  }

  async updateById(
    id: string,
    update: Partial<IComplaint>
  ): Promise<IComplaint | null> {
    return await Complaint.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );
  }
}
export default ComplaintRepository
