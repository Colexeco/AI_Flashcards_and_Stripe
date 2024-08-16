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
  InputLabel
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
  const [file, setFile] = useState(null);
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

  async function handleFileUpload(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Check if the result has the expected structure
        if (result.flashcards && result.flashcards.length > 0) {
            console.log(result.flashcards[0]); // Safely access the first flashcard
        } else {
            throw new Error('No flashcards found in the response');
        }
    } catch (error) {
        console.error('Error uploading file:', error.message);
    }
}



  const handleSubmit = async () => {

    fetch('api/generate',{
       method:'POST',
       body:text,
    }).then((res) => res.json())
    .then((data) => setFlashcards(data))
   }

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

    const batch = writeBatch(db); //perform multiple writes as a single atomic operation, so we dont spend too much money
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
        gutterBottom
        sx={{ mt: 4 }}
      >
        Generate Flashcards
      </Typography>
      <Paper sx={{ my: 2, width: "80%" }}>
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
      </Paper>
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        Generate
      </Button>
      {/* New File Upload Section */}
      <Paper sx={{ my: 2, width: "80%" }}>
        <InputLabel htmlFor="file-upload">Upload PDF</InputLabel>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Button
          variant="contained"
          onClick={handleFileUpload}
          sx={{ mt: 2 }}
          disabled={!file}
        >
          Upload and Generate from PDF
        </Button>
      </Paper>

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
