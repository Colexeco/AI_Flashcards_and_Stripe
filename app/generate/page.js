"use client";

import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
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
import {
  doc,
  getDoc,
  setDoc,
  collection,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Generate() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const router = useRouter();

  //just for testing
  /* const sampleFlashcards = [
    {
      id: 1,
      front: "What is React?",
      back: "A common feature that can be easily implemented using Material UI's `Button` component is a customizable button with properties like onClick event handling, variant (contained, outlined, text), color (primary, secondary), and size (small, medium, large).",
    },
    {
      id: 2,
      front: "What is JSX?",
      back: "A syntax extension for JavaScript used with React",
    },
    {
      id: 3,
      front: "What is a component in React?",
      back: "A reusable piece of UI",
    },
  ];
  //for testing
  useEffect(() => {
    setFlashcards(sampleFlashcards);
  }, []); */

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  }
/*
  const handleSubmit = async () => {
    fetch("api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json()) //get the response in json
      .then((data) => setFlashcards(data)); //set the response to the state
  };*/
  const handleSubmit = async () => {
    if (text) {
      fetch("api/generate", {
        method: "POST",
        body: text,
      })
        .then((res) => res.json())
        .then((data) => setFlashcards(data));
    } else if (pdfFile) {
      const formData = new FormData();
      formData.append('file', pdfFile);
  
      fetch("api/generatepdf", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => setFlashcards(data));
    } else {
      alert("Please enter text or upload a PDF file");
    }
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev, //copy the previous state
      [id]: !prev[id], //flip the value of the id
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db); //perform multiple writes as a single atomic operation
    const userDocRef = doc(collection(db, "users"), user.id); //get the user document reference
    const docSnap = await getDoc(userDocRef); //get the user document snapshot

    //collection for the name of the flashcards
    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || []; //get the flashcards array, if it doesnt exist, set it to an empty array
      if (collections.find((f) => f.name === name)) {
        alert("Name already exists");
        return;
      } else {
        collections.push({ name }); //add the new flashcard collection
        batch.set(userDocRef, { flashcards: collections }, { merge: true }); //setting merge to true makes sure we dont overwrite the existing data
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] }); //if the user document doesnt exist, create it
    }

    //collection for the flashcards themselves
    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef); // Firestore auto-generates an ID
      batch.set(cardDocRef, flashcard); //add the flashcard to the batch
    });

    await batch.commit(); //commit the batch
    handleClose();
    router.push("/flashcards");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Generate Flashcards
      </Typography>
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          multiline
          rows={4}
          elevation={6}
          variant="outlined"
          placeholder="Enter text to generate flashcards"
        />
        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          Or upload a PDF file:
        </Typography>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ marginBottom: '1rem' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Generate
        </Button>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4, width: "80%" }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Flashcards Preview
          </Typography>
          <Grid container spacing={3}>
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
          <Box
            sx={{
              mt: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleOpen}
              sx={{ mb: 4 }}
            >
              Save
            </Button>
          </Box>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter a name for your flashcards collection
              </DialogContentText>
              <TextField
                label="Collection Name"
                margin="dense"
                fullWidth
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ mb: 2 }}>
              <Button variant="contained" onClick={saveFlashcards}>
                Save
              </Button>
              <Button variant="contained" onClick={handleClose}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
