"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  palette: {
    background: {
      default: "#241e24",
    },
    foreground: {
      main: "#473b47",
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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: "#241e24",
          color: "#ffd6ff",
          border: "1px solid #ffd6ff",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#ffd6ff",
            },
            "&:hover fieldset": {
              borderColor: "#ffd6ff",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#ffd6ff",
          "&.Mui-focused": {
            color: "#ffd6ff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          color: "#ffd6ff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffd6ff",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffd6ff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffd6ff",
          },
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
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: "#ffd6ff", //primary.main color for text
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
