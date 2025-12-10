import { Request, Response } from 'express';
import { stripe } from '../../../config/stripeConfig';
import { Booking } from '../../../models/booking/bookingModel'; // Adjust path to your Booking model
import { StatusCode } from '../../../constants/statusCode';

export const createPaymentData = async (req: Request, res: Response): Promise<void> => {
  console.log('Received payment intent request:', req.body);
  const { carId, startDate, endDate, totalPrice, customerEmail, bookingId } = req.body;

  // Validate input
  if (!carId || !startDate || !endDate || !totalPrice || !customerEmail || !bookingId) {
    console.log('Missing required fields:', {
      carId,
      startDate,
      endDate,
      totalPrice,
      customerEmail,
      bookingId,
    });
    res.status(400).json({
      error:
        'Missing required fields: carId, startDate, endDate, totalPrice, customerEmail, bookingId',
    });
    return;
  }

  if (!Number.isInteger(totalPrice) || totalPrice <= 0) {
    console.log('Invalid totalPrice:', totalPrice);
    res.status(StatusCode.NOT_FOUND).json({ error: 'Valid totalPrice in rupees is required' });
    return;
  }

  try {
    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'agreementAccepted') {
      console.log('Invalid or non-pending booking:', bookingId);
      res.status(StatusCode.NOT_FOUND).json({ error: 'Invalid or non-pending booking' });
      return;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert rupees to paise
      currency: 'inr',
      payment_method_types: ['card'], // Match frontend PaymentElement
      receipt_email: customerEmail,
      metadata: {
        carId,
        startDate,
        endDate,
        bookingId, // Include bookingId in metadata
        integration_check: 'accept_a_payment',
      },
    });

    console.log('Payment intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    if (err instanceof Error && 'code' in err) {
      const statusCode =
        'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 400;
      console.error('Stripe error:', err.message, 'Code:', (err as any).code);
      res.status(statusCode).json({ error: err.message });
      return;
    }
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
