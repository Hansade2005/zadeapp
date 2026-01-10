import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_live_51SX9vD3dj2RERxFr1rm2CXfovXAzlkOx9aL2ciRo94bmSbRkKQo4lRiI8Y2MpC2CetMexpolKnZFcRDPZyY5uPIT00QmTRViwP');

export default stripePromise;