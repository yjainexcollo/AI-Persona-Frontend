import { createTheme } from "@mui/material/styles";

/**
 * Dedicated theme for authentication pages
 * 
 * This theme is ALWAYS in light mode, regardless of system preferences.
 * It ensures auth pages maintain consistent appearance and readability.
 */
const authTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#3b82f6", // Blue for buttons and focus states
            dark: "#2563eb",
        },
        background: {
            default: "#f5f7fa", // Light gray page background
            paper: "#ffffff",   // White card background
        },
        text: {
            primary: "#111827",   // Dark gray for main text
            secondary: "#6b7280", // Medium gray for secondary text
        },
        divider: "#e5e7eb",
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "#ffffff",
                        "& fieldset": {
                            borderColor: "#d1d5db",
                        },
                        "&:hover fieldset": {
                            borderColor: "#9ca3af",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#3b82f6",
                            borderWidth: "2px",
                        },
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                    height: "48px",
                    fontSize: "15px",
                },
                input: {
                    color: "#111827",
                    caretColor: "#3b82f6",
                    "&::placeholder": {
                        color: "#9ca3af",
                        opacity: 1,
                    },
                    // Autofill hardening
                    "&:-webkit-autofill": {
                        WebkitTextFillColor: "#111827",
                        WebkitBoxShadow: "0 0 0px 1000px #fff inset",
                        transition: "background-color 5000s ease-in-out 0s",
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                    "&.Mui-focused": {
                        color: "#3b82f6",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 700,
                },
                contained: {
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    },
                },
            },
        },
    },
});

export default authTheme;
