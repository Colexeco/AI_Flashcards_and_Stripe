"use client";
import {
  Container,
  Toolbar,
  Typography,
  AppBar,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Head from "next/head";

export default function Home() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Head>
        <title>Flashcards Saas</title>
        <meta property="description" content="Flashcards created with AI" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography
            variant={isSmallScreen ? "h6" : "subtitle1"}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Flashcards Saas
          </Typography>
          <SignedOut>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: { sm: 2, md: 4 },
              }}
            >
              <Button color="inherit" size={isSmallScreen ? "small" : "medium"}>
                Log In
              </Button>
              <Button color="inherit" size={isSmallScreen ? "small" : "medium"}>
                Sign Up
              </Button>
            </Box>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} align="center">
          Welcome to Flashcards Saas
        </Typography>
        <Typography variant={isSmallScreen ? "h6" : "h4"} align="center">
          Create flashcards with AI
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 4 }}>
          Get Started
        </Button>
      </Box>
    </Box>
  );
}
