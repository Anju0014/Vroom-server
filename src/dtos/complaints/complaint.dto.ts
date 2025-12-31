export interface CreateComplaintDTO {
  bookingId: string;
  carId: string;
  title: string;
  description: string;
  category: "car" | "payment" | "app" | "behavior" | "other";
}

export interface UpdateComplaintByAdminDTO {
  status: "open" | "in_review" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  adminResponse?: string;
}
