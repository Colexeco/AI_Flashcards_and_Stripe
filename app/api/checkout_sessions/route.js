import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const formatAmountForStripe = (amount) => {
  Math.round(amount * 100); //multiply by 100 to convert to cents as stripe requires cents
};

export async function POST(req) {
  const params = {
    submit_type: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Pro Subscription",
          },
          unit_amount: formatAmountForStripe(5), //$5 per month
          recurring: { interval: "month", interval_count: 1 }, //charged every month
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`, //redirects to this page after successful payment
    cancel_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
  };
  const checkoutSession = await stripe.checkout.sessions.create(params); //creates a new checkout session

  return NextResponse.json(checkoutSession, { status: 200 }); //status 200 means success
}
