"use client";
import { Typography, Box } from "@mui/material";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useStat, useEffect } from "react";
import { CollectionReference, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/router";

export default function Flashcards() {
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
