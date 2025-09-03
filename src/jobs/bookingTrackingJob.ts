import cron from "node-cron";
import { Booking } from "../models/booking/bookingModel";
import { sendTrackingEmail} from "../utils/emailconfirm"


cron.schedule("0 0 * * *", async () => {
  console.log("Running daily booking job...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfDay = new Date(tomorrow.setHours(0,0,0,0));
  const endOfDay = new Date(tomorrow.setHours(23,59,59,999));

  const bookings = await Booking.find({
    startDate: { $gte: startOfDay, $lte: endOfDay },
    status: "confirmed"
  }).populate("userId", "name email");

  for (const booking of bookings) {
    await sendTrackingEmail(booking.userId.email, booking.trackingUrl);
  }
});
