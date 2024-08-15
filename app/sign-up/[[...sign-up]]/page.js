"use client";
import Navbar from "@/app/components/Navbar";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import { SignUp } from "@clerk/nextjs";

export default function Signup() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background.main",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ textAlign: "center", my: 4 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign Up
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mb: 4 }} color="white">
          Already have an account?{" "}
          <Link href="/sign-in">
            <Typography
              component="span"
              variant="h5"
              sx={{ color: "secondary.main" }}
            >
              Sign In
            </Typography>
          </Link>
        </Typography>
        <SignUp />
      </Box>
    </Box>
  );
}
