"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useSearchParams } from "next/navigation"; //find id from the parameters
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

export default function Flashcard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);

  const searchParams = useSearchParams();
  const search = searchParams.get("id"); //get the id of the page

  useEffect(() => {
    async function getFlashcard() {
      console.log("getFlashcard called, search:", search, "user:", user);

      if (!search) {
        console.log("Search parameter is missing");
        return;
      }

      if (!user) {
        console.log("User is not loaded yet");
        return;
      }

      if (!user.id) {
        console.log("User ID is not available");
        return;
      }

      try {
        const colRef = collection(
          doc(collection(db, "users"), user.id),
          search
        );
        console.log("Collection reference:", colRef);

        const docs = await getDocs(colRef); //get all the documents in the collection referenced
        console.log("Fetched docs:", docs);

        const flashcards = [];

        docs.forEach((doc) => {
          flashcards.push({ id: doc.id, ...doc.data() });
        });

        console.log("Processed flashcards:", flashcards);
        setFlashcards(flashcards);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    }

    if (user && search) {
      getFlashcard();
    }
  }, [user, search]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev, //copy the previous state
      [id]: !prev[id], //flip the value of the id
    }));
  };

  if (!isLoaded && !isSignedIn) {
    return;
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
      <Typography
        variant={isSmallScreen ? "h4" : "h2"}
        component="h1"
        color="secondary.main"
        gutterBottom
        sx={{ mt: 4 }}
      >
        {search ? search : "Flashcards"}
      </Typography>
      <Box sx={{ mt: 4, width: "80%" }}>
        <Grid container spacing={5}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                onClick={() => handleCardClick(index)}
                sx={{
                  perspective: "1000px",
                  height: "300px",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transition: "transform 0.6s",
                    transformStyle: "preserve-3d",
                    transform: flipped[index]
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 2,
                      boxSizing: "border-box",
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6">{flashcard.front}</Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 2,
                      boxSizing: "border-box",

                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <Typography variant="h6" color="secondary.main">
                      {flashcard.back}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
