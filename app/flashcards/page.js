"use client"
import { Typography, Box } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        Loading...
      </Typography>
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
      <Typography variant="h2" component="h1" gutterBottom sx={{ mt: 4 }}>
        Flashcards{" "}
      </Typography>
    </Box>
  );
}
