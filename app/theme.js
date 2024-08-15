"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  palette: {
    background: {
      main: "#241e24",
    },
    primary: {
      main: "#ffd6ff",
    },
    secondary: {
      main: "#c8b6ff",
    },
    tertiary: {
      main: "#e7c6ff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 40,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #ffd6ff",
          backgroundColor: "#241e24", // Use background.main color
          color: "#ffd6ff", // Use primary.main color for text
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#ffd6ff", //primary.main color for text
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
