import React from "react";
import { Box, ThemeProvider } from "@mui/material";
import authTheme from "../../authTheme";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout component for authentication pages (Login, Register, etc.)
 * Provides consistent centered card layout with proper spacing and background
 * 
 * IMPORTANT: This component wraps all auth pages with a forced LIGHT theme,
 * ensuring auth UI remains consistent regardless of system dark mode preference.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={authTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: { xs: 2, sm: 3 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 440, md: 480 },
            bgcolor: "background.paper",
            borderRadius: { xs: 3, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            px: { xs: 3, sm: 4, md: 5 },
            py: { xs: 4, sm: 5, md: 6 },
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AuthLayout;
