// import { Router } from 'express';
// import { createCheckoutSession } from '../../controllers/implementation/stripe/stripeController';

// import { createPaymentData } from '../../controllers/implementation/stripe/stripeController';
// const router = Router();

// // router.post('/create-checkout-session', createCheckoutSession);
// router.post('/create-payment-intent',createPaymentData)
// export default router;



import { Router } from 'express';
import { createPaymentData } from '../../controllers/implementation/stripe/stripeController';

const router = Router();

router.post('/create-payment-intent', createPaymentData);

export default router;