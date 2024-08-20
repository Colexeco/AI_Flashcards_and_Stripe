"use client";
import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return; // If user is not signed in, do nothing
      const docRef = doc(collection(db, "users"), user.id); // Get the user's document reference
      const docSnap = await getDoc(docRef); // Get the user's document

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || []; // Get the user's flashcards, if it doesn't exist, set it to an empty array
        console.log(collections);
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] }); // If the user's document doesn't exist, create it
      }
    }
    getFlashcards();
  }, [user]); // Run this effect whenever the user object changes

  if (!isLoaded && !isSignedIn) {
    return;
  }

  const handleCardClick = (id) => {
    router.push(`/flashcards?id=${id}`);
  };

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
        My Flashcards
      </Typography>
      <Container maxWidth="100vw">
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                onClick={() => handleCardClick(flashcard.name)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "foreground.main",
                  borderRadius: 10,
                  height: {
                    xs: "100px",
                    sm: "100px",
                    md: "200px",
                    lg: "200px",
                  },
                  cursor: "pointer",
                }}
              >
                <Typography variant="h4">{flashcard.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
