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
import { CirclePlus } from "lucide-react";

export default function Generate() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [openGenerated, setOpenGenerated] = useState(false);
  const [openUserCreated, setOpenUserCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [userFlashcards, setUserFlashcards] = useState([]);
  const [currentFront, setCurrentFront] = useState("");
  const [currentBack, setCurrentBack] = useState("");

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

  const addFlashcard = () => {
    if (currentFront.trim() === "" || currentBack.trim() === "") {
      alert("Please fill in both front and back of the flashcard");
      return;
    }
    if (userFlashcards.length >= 10) {
      alert("You can only create up to 10 flashcards at a time");
      return;
    }
    setUserFlashcards([
      ...userFlashcards,
      { front: currentFront, back: currentBack },
    ]);
    setCurrentFront("");
    setCurrentBack("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    fetch("api/RAG", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json()) //get the response in json
      .then((data) => {
        setFlashcards(data); //set the response to the state

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error generating flashcards:", error);
        setIsLoading(false);
      });
    setText(""); //clear the text field
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev, //copy the previous state
      [id]: !prev[id], //flip the value of the id
    }));
  };

  const handleOpenGenerated = () => {
    setOpenGenerated(true);
  };

  const handleCloseGenerated = () => {
    setOpenGenerated(false);
  };

  const handleOpenUserCreated = () => {
    setOpenUserCreated(true);
  };

  const handleCloseUserCreated = () => {
    setOpenUserCreated(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }
    const cardsToSave = flashcards.length > 0 ? flashcards : userFlashcards;

    if (cardsToSave.length === 0) {
      alert("Please generate or create at least one flashcard");
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
    cardsToSave.forEach((flashcard) => {
      const cardDocRef = doc(colRef); // Firestore auto-generates an ID
      batch.set(cardDocRef, flashcard); //add the flashcard to the batch
    });

    await batch.commit(); //commit the batch
    handleCloseGenerated();
    handleCloseUserCreated();
    setFlashcards([]);
    setUserFlashcards([]);
    router.push("/flashcards");
  };

  const handleSaveUserFlashcards = () => {
    if (userFlashcards.length === 0) {
      alert("Please create at least one flashcard");
      return;
    }
    handleOpenUserCreated();
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
          placeholder="Enter a UI topic to generate flashcards on it..."
        />
      </Paper>
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        Generate
      </Button>
      {isLoading && (
        <Typography variant="h5" sx={{ mt: 4 }}>
          Generating flashcards...
        </Typography>
      )}

      {!isLoading && flashcards.length > 0 && (
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
          <Dialog open={openGenerated} onClose={handleCloseGenerated}>
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

      <Box
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "80%",
        }}
      >
        <Typography
          variant={isSmallScreen ? "h6" : "h4"}
          component="h2"
          gutterBottom
        >
          Create your own flashcards
        </Typography>
        <Paper sx={{ my: 2, width: "100%" }}>
          <TextField
            value={currentFront}
            onChange={(e) => setCurrentFront(e.target.value)}
            fullWidth
            multiline
            rows={2}
            elevation={6}
            variant="outlined"
            placeholder="Text on the front of the flashcard"
          />
        </Paper>
        <Paper sx={{ my: 2, width: "100%" }}>
          <TextField
            value={currentBack}
            onChange={(e) => setCurrentBack(e.target.value)}
            fullWidth
            multiline
            rows={4}
            elevation={6}
            variant="outlined"
            placeholder="Text on the back of the flashcard"
          />
        </Paper>
        <Button onClick={addFlashcard} disabled={userFlashcards.length >= 10}>
          <CirclePlus />
        </Button>

        {userFlashcards.length > 0 && (
          <Box sx={{ mt: 4, width: "100%" }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Flashcards ({userFlashcards.length}/10)
            </Typography>
            <Grid container spacing={3}>
              {userFlashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      p: 2,
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6">
                      Front: {flashcard.front}
                    </Typography>
                    <Typography variant="body1" color="secondary.main">
                      Back: {flashcard.back}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveUserFlashcards}
              sx={{ mt: 4 }}
              disabled={flashcards.length > 0}
            >
              Save
            </Button>
            <Dialog open={openUserCreated} onClose={handleCloseUserCreated}>
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
                <Button variant="contained" onClick={handleCloseUserCreated}>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Box>
  );
}
