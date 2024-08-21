"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import getStripe from "@/utils/get-stripe";
import { CircularProgress, Container, Typography, Box } from "@mui/material";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [loading, setLoading] = useState(true); //loading in beginning
  const [session, setSession] = useState(null); //no session in beginning
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCheckoutSession() {
      if (!session_id) {
        return;
      }
      try {
        const res = await fetch(
          `/api/checkout_sessions?session_id=${session_id}`
        );
        const sessionData = await res.json();

        if (res.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error);
        }
      } catch (error) {
        setError("An error occurred while fetching the session");
      } finally {
        setLoading(false);
      }
    }
    fetchCheckoutSession();
  }, [session_id]);

  if (loading) {
    return (
      <Container maxWidth="100vw" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="100vw" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background",
      }}
    >
      {session.payment_status === "paid" ? (
        <>
          <Typography variant="h5" sx={{ mt: 10 }}>
            Thank you for purchasing a subscription with FlashUI!
          </Typography>
          <Box sx={{ mt: 10 }}>
            <Typography variant="h6">Session ID: {session_id}</Typography>
            <Typography variant="h6">
              Payment Status: {session.payment_status}
            </Typography>
            <Typography variant="h6">
              We have received your payment. You will receive an email with your
              order details shortly.
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h5" sx={{ mt: 10 }}>
            Your payment was not successful. Please try again.
          </Typography>
          <Box sx={{ mt: 10 }}>
            <Typography variant="h6">Session ID: {session_id}</Typography>
            <Typography variant="h6">
              Payment Status: {session.payment_status}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
