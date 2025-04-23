//  async getbookedDatesCars (req:Request, res:Response):Promise<void>{
//   const { carId } = req.params;

//   try {
//     const bookings = await Booking.find({
//       carId,
//       status: 'confirmed'
//     }, 'startDate endDate');

//     const bookedRanges = bookings.map(b => ({
//       start: b.startDate,
//       end: b.endDate
//     }));

//     res.json({ bookedRanges });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// }

//  async createBooking (req:Request, res:Response): Promise<void>  {
//   const { carId, userId, startDate, endDate } = req.body;

//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (start >= end) {
//      res.status(400).json({ message: 'Invalid date range' });
//      return
//   }

//   const existing = await Booking.findOne({
//     carId,
//     status: 'confirmed',
//     startDate: { $lte: end },
//     endDate: { $gte: start }
//   });

//   if (existing) {
//      res.status(409).json({ message: 'Car already booked in that range' });
//      return
//   }

//   const car = await Car.findById(carId);
//   const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//   const totalPrice = days * car.pricePerDay;

//   const booking = await Booking.create({
//     carId,
//     userId,
//     startDate: start,
//     endDate: end,
//     totalPrice
//   });

//   res.status(201).json({ message: 'Booking confirmed', booking });
// }





import { Request, Response } from 'express';
import  {Booking}  from '../../../models/booking/bookingModel'; // Your booking model (e.g., MongoDB schema)

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  console.log('Received booking request:', req.body);
  const { carId, userId, carOwnerId, startDate, endDate, totalPrice, paymentIntentId } = req.body;

  // Validate input
  if (!carId || !userId || !carOwnerId || !startDate || !endDate || !totalPrice || !paymentIntentId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Verify payment intent (optional, for security)
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   res.status(400).json({ error: 'Payment not successful' });
    //   return;
    // }

    // Create booking
    const booking = new Booking({
      carId,
      userId,
      carOwnerId,
      startDate,
      endDate,
      totalPrice,
      paymentIntentId,
      status: 'confirmed',
    });

    await booking.save();
    res.json({ bookingId: booking._id, message: 'Booking created successfully' });
  } catch (err: any) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};




export const confirmBooking = async (bookingId: string, paymentIntentId: string) => {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'pending') {
      throw new Error('Invalid or non-pending booking');
    }
  
    booking.status = 'confirmed';
    booking.paymentIntentId = paymentIntentId;
    await booking.save();
  
    return { success: true, bookingId };
  };



  export const cancelBooking = async (bookingId: string) => {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'pending') {
      throw new Error('Invalid or non-pending booking');
    }
  
    // Option 1: Update status to 'failed'
    booking.status = 'failed';
    await booking.save();
  
    // Option 2: Delete booking
    // await Booking.deleteOne({ _id: bookingId });
  
    return { success: true };
  };



























// Create Pending Booking
// export const createPendingBooking = async (req: Request, res: Response): Promise<void> => {
//   const { carId, userId, carOwnerId, startDate, endDate, totalPrice } = req.body as BookingData;

//   if (!carId || !userId || !carOwnerId || !startDate || !endDate || !totalPrice) {
//     res.status(400).json({ error: 'Missing required fields' });
//     return;
//   }

//   try {
//     // Validate car
//     const car = await Car.findById(carId);
//     if (!car) {
//       res.status(400).json({ error: 'Car not found' });
//       return;
//     }

//     // Add logic to check car availability for the given dates (e.g., no overlapping bookings)
//     const conflictingBooking = await Booking.findOne({
//       carId,
//       status: { $in: ['pending', 'confirmed'] },
//       $or: [
//         { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
//         { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
//       ],
//     });

//     if (conflictingBooking) {
//       res.status(400).json({ error: 'Car is not available for the selected dates' });
//       return;
//     }

//     // Create booking
//     const booking = await Booking.create({
//       carId,
//       userId,
//       carOwnerId,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       totalPrice,
//       status: 'pending',
//     });

//     res.json({ bookingId: booking._id.toString() });
//   } catch (err) {
//     console.error('Error creating booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Confirm Booking
// export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
//   const { bookingId } = req.params;
//   const { paymentIntentId } = req.body;

//   if (!paymentIntentId) {
//     res.status(400).json({ error: 'Missing paymentIntentId' });
//     return;
//   }

//   try {
//     const booking = await Booking.findById(bookingId);
//     if (!booking || booking.status !== 'pending') {
//       res.status(400).json({ error: 'Invalid or non-pending booking' });
//       return;
//     }

//     booking.status = 'confirmed';
//     booking.paymentIntentId = paymentIntentId;
//     await booking.save();

//     res.json({ success: true, bookingId });
//   } catch (err) {
//     console.error('Error confirming booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Cancel Booking
// export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
//   const { bookingId } = req.params;

//   try {
//     const booking = await Booking.findById(bookingId);
//     if (!booking || booking.status !== 'pending') {
//       res.status(400).json({ error: 'Invalid or non-pending booking' });
//       return;
//     }

//     // Option 1: Update status to 'failed'
//     booking.status = 'failed';
//     await booking.save();

//     // Option 2: Delete booking (uncomment if preferred)
//     // await Booking.deleteOne({ _id: bookingId });

//     res.json({ success: true });
//   } catch (err) {
//     console.error('Error cancelling booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };