import { loadStripe } from "@stripe/stripe-js";
let stripePromise;

//This function ensures that we only create one instance of Stripe, reusing it if it already exists
const getStripe = () => {
  if (!stripePromise) {
    //if stripePromise is not defined, load stripe with the public key
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export default getStripe;
