import { Typography, Box } from "@mui/material";
import React from "react";

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
