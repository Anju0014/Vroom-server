import { IComplaint } from '../../models/complaints/complaintModel';

export const mapComplaintToResponse = (complaint: IComplaint) => ({
  id: complaint._id,
  bookingId: complaint.bookingId,
  raisedBy: complaint.raisedBy,
  raisedByRole: complaint.raisedByRole,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  status: complaint.status,
  priority: complaint.priority,
  adminResponse: complaint.adminResponse || null,
  resolvedAt: complaint.resolvedAt || null,
  createdAt: complaint.createdAt,
  complaintProof: complaint.complaintProof,
  updatedAt: complaint.updatedAt,
});
