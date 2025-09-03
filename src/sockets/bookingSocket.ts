import { Server, Socket } from "socket.io";

export default function bookingSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Booking socket connected:", socket.id);

    socket.on("joinBookingRoom", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      console.log(`Socket ${socket.id} joined booking_${bookingId}`);
    });
  });
}
