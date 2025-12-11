export const NotificationTemplates = {
  bookingConfirmed: (ownerId: string, bookingId: string, carModel: string) => ({
    userId: ownerId,
    role: "OWNER" as const,
    title: "Booking Confirmed!",
    message: `Your ${carModel} has been successfully booked.`,
    type: "booking_confirmed",
    metadata: { bookingId }
  }),

  bookingRequest: (ownerId: string, carModel: string, bookingId: string) => ({
    userId: ownerId,
    role: "OWNER",
    title: "New Booking Request",
    message: `A customer wants to book your ${carModel}.`,
    type: "booking_request",
    metadata: { bookingId }
  }),
};
