import { Router } from 'express';
import { createPaymentData } from '../../controllers/implementation/stripe/stripeController';

const router = Router();

router.post('/create-payment-intent', createPaymentData);

export default router;
