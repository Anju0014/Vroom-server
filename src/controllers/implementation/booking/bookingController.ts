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
