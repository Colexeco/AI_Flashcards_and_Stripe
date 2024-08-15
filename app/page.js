"use client";
import {
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Container,
  TextField
} from "@mui/material";
import getStripe from "@/utils/get-stripe";
import { DefaultRightContent } from "./components/Navbar";
import Navbar from "./components/Navbar";
import icons from "./icons";
import Image from "next/image";
import Head from "next/head";
import Features from "./components/Features";
import dollarIcon from "@/public/icons/dollar.png";
import { useState } from "react"

export default function Home() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [message, setMessage] = useState(""); // User input

  const sendMessage = async () => {
    const route = "api/generate";
    const newUserMessage = { role: "user", content: message };
    try {
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserMessage),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader(); // Read the response as a stream
      const decoder = new TextDecoder(); // Decode the stream as text
      let assistantResponse = { role: "assistant", content: "" };

      while (true) {
        // Read the stream until it's done
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true }); // Decode the chunk of text
        assistantResponse.content += text;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
      <Navbar rightContent={<DefaultRightContent />} />
      <Head>
        <title>Flashcards Saas</title>
        <meta property="description" content="Flashcards created with AI" />
      </Head>

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
        {/* Floating Icons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { xs: 2, sm: 4, md: 6 },
            mb: 4,
          }}
        >
          {icons.map((icon, index) => (
            <Box
              key={index}
              width={isSmallScreen ? 60 : 130}
              height={isSmallScreen ? 60 : 130}
              sx={{
                borderRadius: "50%",
                borderColor: "white",
                borderWidth: 2,
                borderStyle: "solid",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `float ${
                  2 + index * 0.5
                }s ease-in-out infinite alternate`, //animation named float, duration is 2 to 3.5 seconds based on index of icon
                "@keyframes float": {
                  "0%": {
                    transform: "translateY(-10px)", // Move up 10px
                  },
                  "100%": {
                    transform: "translateY(10px)", // Move down 10px
                  },
                },
              }}
            >
              <Image
                src={icon.src}
                alt={icon.alt}
                width={isSmallScreen ? 30 : 100}
                height={isSmallScreen ? 30 : 100}
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>

        {/* Main Content */}
        <Typography
          variant={isSmallScreen ? "h3" : "h2"}
          align="center"
          color="secondary.main"
          sx={{
            fontWeight: "bold",
            transform: "translateZ(0)",
            transition: "transform 0.7s ease-out",
            "&:hover": {
              transform: "translateY(-10px) translateZ(0)",
            },
            mb: 2,
          }}
        >
          FlashUI
        </Typography>
        <Typography
          variant={isSmallScreen ? "h6" : "h4"}
          align="center"
          color="tertiary.main"
        >
          Supercharge Your UI Learning with AI-Powered Flashcards
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 6 }}>
          Get Started
        </Button>

        {/* Features */}
        <Features />

        {/* Pricing*/}
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            py: 8,
          }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            color="secondary.main"
            sx={{ mb: 4 }}
          >
            Pricing
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h4">
                Get Started with FlashUI for Only $1/Month
              </Typography>
              <Typography variant="h5" color="white">
                Only for a limited time
              </Typography>
              <Typography variant="h6" color="tertiary.main" sx={{ mt: 4 }}>
                &quot;Simple, Affordable, Effective&quot;
              </Typography>
              <Typography variant="body1" color="white">
                For just $1 a month, gain access to all the powerful features of
                FlashUI. Enhance your UI skills without breaking the bank.
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 6 }}>
                Get Started
              </Button>
              <Button variant="contained" color="primary" sx={{ mt: 6 }} onClick={sendMessage}>
                Test RAG
              </Button>
              <TextField
                placeholder="Message..."
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
              />
            </Box>

            <Box
              width={isSmallScreen ? 100 : 130}
              height={isSmallScreen ? 100 : 130}
              sx={{
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={dollarIcon}
                alt={"price"}
                width={isSmallScreen ? 80 : 100}
                height={isSmallScreen ? 80 : 100}
                style={{ objectFit: "cover" }}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
