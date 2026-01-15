import { IComplaint } from '../../../models/complaints/complaintModel';

interface IComplaintRepository {
  create(data: Partial<IComplaint>): Promise<IComplaint>;

  findByUser(userId: string): Promise<IComplaint[]>;

  findAll(): Promise<IComplaint[]>;

  findById(id: string): Promise<IComplaint | null>;

  updateById(id: string, update: Partial<IComplaint>): Promise<IComplaint | null>;
}
export default IComplaintRepository;
