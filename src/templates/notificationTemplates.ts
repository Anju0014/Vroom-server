// export const NotificationTemplates = {
//   bookingConfirmed: (ownerId: string, bookingId: string, carModel: string,startDate:Date,endDate:Date) => ({
//     userId: ownerId,
//     role: "OWNER" as const,
//     title: "Booking Confirmed!",
//     message: `Your ${carModel} has been successfully booked for${startDate} to ${endDate} .`,
//     type: "booking_confirmed",
//     metadata: { bookingId }
//   }),

//   bookingRequest: (ownerId: string, carModel: string, bookingId: string) => ({
//     userId: ownerId,
//     role: "OWNER",
//     title: "New Booking Request",
//     message: `A customer wants to book your ${carModel}.`,
//     type: "booking_request",
//     metadata: { bookingId }
//   }),

// };

export const NotificationTemplates = {

  /* =========================CUSTOMER NOTIFICATIONS ========================= */

  bookingConfirmed: (customerId: string,bookingId: string,carModel: string,startDate: Date,endDate: Date) => ({
    userId: customerId,
    role: "CUSTOMER" as const,
    title: "Booking Confirmed 🎉",
    message: `Your booking for ${carModel} is confirmed from ${startDate.toDateString()} to ${endDate.toDateString()}.`,
    type: "booking_confirmed",
    metadata: { bookingId }
  }),

  bookingRejected: (customerId: string,bookingId: string,carModel: string,reason?: string) => ({
    userId: customerId,
    role: "CUSTOMER" as const,
    title: "Booking Rejected ❌",
    message: `Your booking for ${carModel} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
    type: "booking_rejected",
    metadata: { bookingId }
  }),

  paymentSuccess: (customerId: string,bookingId: string,amount: number) => ({
    userId: customerId,
    role: "CUSTOMER" as const,
    title: "Payment Successful 💳",
    message: `Your payment of ₹${amount} was successful.`,
    type: "payment_success",
    metadata: { bookingId, amount }
  }),

  tripReminder: (customerId: string,bookingId: string,carModel: string,reminderType: "START" | "END",date: Date) => ({
    userId: customerId,
    role: "CUSTOMER" as const,
    title: reminderType === "START" ? "Trip Starting Soon 🚗" : "Trip Ending Soon ⏰",
    message:
      reminderType === "START"
        ? `Your trip with ${carModel} starts on ${date.toDateString()}.`
        : `Your trip with ${carModel} ends on ${date.toDateString()}.`,
    type: "trip_reminder",
    metadata: { bookingId, reminderType }
  }),


  /* ========================= CAR OWNER NOTIFICATIONS========================= */

  bookingRequest: (ownerId: string,carModel: string, bookingId: string) => ({
    userId: ownerId,
    role: "OWNER" as const,
    title: "New Booking Request 📩",
    message: `A customer wants to book your ${carModel}.`,
    type: "booking_request",
    metadata: { bookingId }
  }),

  adminCarApproval: ( ownerId: string, carId: string, carModel: string, status: "APPROVED" | "REJECTED", reason?: string ) => ({
    userId: ownerId,
    role: "OWNER" as const,
    title:
      status === "APPROVED"
        ? "Car Approved ✅"
        : "Car Rejected ❌",
    message:
      status === "APPROVED"
        ? `Your car ${carModel} has been approved by admin.`
        : `Your car ${carModel} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
    type: "car_verification",
    metadata: { carId, status }
  }),

  bookingCanceledByCustomer: ( ownerId: string, bookingId: string, carModel: string ) => ({
    userId: ownerId,
    role: "OWNER" as const,
    title: "Booking Cancelled 🚫",
    message: `A customer has cancelled the booking for ${carModel}.`,
    type: "booking_cancelled",
    metadata: { bookingId }
  }),

  paymentCredited: (ownerId: string,bookingId: string,amount: number) => ({
    userId: ownerId,
    role: "OWNER" as const,
    title: "Payment Credited 💰",
    message: `₹${amount} has been credited to your wallet for a completed booking.`,
    type: "payment_credited",
    metadata: { bookingId, amount }
  }),

  /* ========================= ADMIN NOTIFICATIONS ========================= */

  newCarForApproval: (adminId: string,carId: string,ownerName: string) => ({
    userId: adminId,
    role: "ADMIN" as const,
    title: "New Car Awaiting Approval 🚘",
    message: `${ownerName} has listed a new car for approval.`,
    type: "car_approval_pending",
    metadata: { carId }
  }),
   newCarOwnerForApproval: (adminId: string,ownerId: string,ownerName: string) => ({
    userId: adminId,
    role: "ADMIN" as const,
    title: "New Car Owner is  Awaiting Approval 🚘",
    message: `${ownerName} has listed for approval.`,
    type: "carowner_approval_pending",
    metadata: { ownerId}
  }),

  newDisputeReported: (adminId: string,disputeId: string,bookingId: string) => ({
    userId: adminId,
    role: "ADMIN" as const,
    title: "New Dispute Reported ⚠️",
    message: `A dispute has been reported for booking ID ${bookingId}.`,
    type: "dispute_reported",
    metadata: { disputeId, bookingId }
  }),

  highPriorityBookingIssue: (adminId: string,bookingId: string,issue: string) => ({
    userId: adminId,
    role: "ADMIN" as const,
    title: "High Priority Booking Issue 🚨",
    message: `Issue detected for booking ${bookingId}: ${issue}`,
    type: "high_priority_issue",
    metadata: { bookingId, issue }
  }),
};

