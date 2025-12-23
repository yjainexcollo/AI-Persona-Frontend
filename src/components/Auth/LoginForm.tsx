// Login form component with email/password and Google OAuth
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Link,
  Divider,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import AppleIcon from "@mui/icons-material/Apple";
import { useNavigate, useLocation } from "react-router-dom";
import { startProactiveTokenRefresh } from "../../utils/session";
import { env } from "../../lib/config/env";
import AuthLayout from "./AuthLayout";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for registration success message from navigation state
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission and authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const BACKEND_URL = env.BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error for unverified email
        if (
          response.status === 403 &&
          data.error &&
          data.error.includes("Email not verified")
        ) {
          throw new Error(
            "Your email is not verified. Please check your inbox and verify your account before logging in."
          );
        }
        // Handle wrong password error
        if (
          response.status === 401 &&
          data.error &&
          data.error.includes("Invalid email or password")
        ) {
          throw new Error(
            "Wrong password. Please check your password and try again."
          );
        }
        // Handle account locked error
        if (
          response.status === 423 &&
          data.error &&
          data.error.includes("Account is temporarily locked")
        ) {
          throw new Error(
            "Account is temporarily locked due to too many failed attempts. Please wait 15 minutes before trying again."
          );
        }
        throw new Error(data.error || "Login failed");
      }

      // Store the token, user, refreshToken, and workspaceId
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      if (data.data.refreshToken)
        localStorage.setItem("refreshToken", data.data.refreshToken);
      if (data.data.workspaceId)
        localStorage.setItem("workspaceId", data.data.workspaceId);
      if (data.data.workspaceName)
        localStorage.setItem("workspaceName", data.data.workspaceName);

      // Start proactive token refresh to prevent automatic logouts
      startProactiveTokenRefresh();

      // Login successful - redirect to Discovery page
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to Google OAuth
  const handleGoogleLogin = () => {
    const BACKEND_URL = env.BACKEND_URL;
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            color: "#1f2937",
            textAlign: "center",
            fontSize: { xs: "24px", sm: "28px" },
          }}
        >
          Log in
        </Typography>
        <Typography
          sx={{
            color: "#6b7280",
            fontSize: { xs: 14, sm: 15 },
            mb: 3,
            textAlign: "center",
          }}
        >
          Welcome back! Please enter your details
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: 14 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 14 }}>
            {error}
          </Alert>
        )}

        {/* Email Field */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 14,
            mb: 0.75,
            color: "#374151",
          }}
        >
          Email
        </Typography>
        <TextField
          fullWidth
          name="email"
          type="email"
          placeholder="Enter your email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />

        {/* Password Field */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 14,
            mb: 0.75,
            color: "#374151",
          }}
        >
          Password
        </Typography>
        <TextField
          fullWidth
          name="password"
          placeholder="Enter your password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Forgot Password Link */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Link
            component="button"
            type="button"
            onClick={() => navigate("/forgot-password")}
            sx={{
              color: "#3b82f6",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Login Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            bgcolor: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            borderRadius: "10px",
            height: 48,
            mb: 3,
            textTransform: "none",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            "&:hover": {
              bgcolor: "#2563eb",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            "&:disabled": {
              bgcolor: "#e5e7eb",
              color: "#9ca3af",
              cursor: "not-allowed",
            },
          }}
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        {/* Divider */}
        <Divider sx={{ mb: 3 }}>
          <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>
            or continue with
          </Typography>
        </Divider>

        {/* Social Login Buttons */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{
              height: 48,
              borderRadius: "10px",
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f9fafb",
              },
            }}
          >
            <Box
              component="img"
              src="https://th.bing.com/th?q=Google+Login+Logo.png&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.5&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247"
              alt="Google"
              sx={{ width: 20, height: 20, mr: 1.5 }}
            />
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              height: 48,
              borderRadius: "10px",
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f9fafb",
              },
            }}
          >
            <AppleIcon sx={{ fontSize: 20, mr: 1.5 }} />
            Apple
          </Button>
        </Box>

        {/* Register Link */}
        <Typography
          sx={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Don't have an account?{" "}
          <Link
            component="button"
            type="button"
            onClick={() => navigate("/register")}
            sx={{
              color: "#3b82f6",
              fontWeight: 700,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Register
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginForm;
