import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TermsAndConditionsDialog from "./TermsAndConditionsDialog";
import { useNavigate } from "react-router-dom";
import { env } from "../../lib/config/env";
import AuthLayout from "./AuthLayout";

interface RegisterFormProps {
  inviteToken?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordFieldRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);

  // Password validation rules
  const passwordRules = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    {
      label: "At least one uppercase letter (A-Z)",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one number (0-9)",
      test: (pw: string) => /\d/.test(pw),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      test: (pw: string) => /[!@#$%^&*]/.test(pw),
    },
  ];

  const allPasswordRulesValid = passwordRules.every((rule) =>
    rule.test(formData.password)
  );

  // Handle clicks outside password field and checklist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordFieldRef.current &&
        checklistRef.current &&
        !passwordFieldRef.current.contains(event.target as Node) &&
        !checklistRef.current.contains(event.target as Node)
      ) {
        setPasswordFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide checklist when all requirements are met
  useEffect(() => {
    if (allPasswordRulesValid && passwordFocused) {
      const timer = setTimeout(() => setPasswordFocused(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [allPasswordRulesValid, passwordFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resendVerification = async (email: string) => {
    const BACKEND_URL = env.BACKEND_URL;
    const response = await fetch(
      `${BACKEND_URL}/api/auth/resend-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to resend verification email");
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms and Conditions");
      return;
    }
    if (!allPasswordRulesValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        // Handle specific validation errors
        if (
          response.status === 400 &&
          data.error &&
          data.error.includes("Validation failed")
        ) {
          throw new Error(data.error);
        }
        // If email is already registered but not verified, trigger resend verification
        if (
          (response.status === 409 || response.status === 400) &&
          data.error &&
          (data.error.toLowerCase().includes("already registered") ||
            data.error.toLowerCase().includes("pending verify"))
        ) {
          try {
            await resendVerification(formData.email);
            setError(
              "Your email is already registered but not verified. We have resent the verification email. Please check your inbox."
            );
          } catch (resendErr) {
            setError(
              resendErr instanceof Error
                ? resendErr.message
                : "Failed to resend verification email."
            );
          }
          return;
        }
        throw new Error(data.error || "Registration failed");
      }
      // Registration successful - redirect to login with email verification message
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please check your email and verify your account before logging in.",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxClick = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    e.preventDefault();
    if (agreed) {
      setAgreed(false);
    } else {
      setTermsOpen(true);
    }
  };

  const handleAgree = () => {
    setAgreed(true);
    setTermsOpen(false);
  };

  const handleClose = () => {
    setTermsOpen(false);
  };

  const isFormValid =
    agreed && allPasswordRulesValid && formData.name && formData.email;

  return (
    <>
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
            Create Account
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: { xs: 14, sm: 15 },
              mb: 3,
              textAlign: "center",
            }}
          >
            Fill your information below or register with your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 14 }}>
              {error}
            </Alert>
          )}

          {/* Full Name Field */}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 14,
              mb: 0.75,
              color: "#374151",
            }}
          >
            Full Name
          </Typography>
          <TextField
            fullWidth
            name="name"
            placeholder="Enter your full name"
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

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
          <Box ref={passwordFieldRef} sx={{ position: "relative" }}>
            <TextField
              fullWidth
              name="password"
              placeholder="Enter your password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
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

            {/* Password Checklist */}
            {passwordFocused && formData.password && (
              <Box
                ref={checklistRef}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  mt: 1,
                  p: 2,
                  bgcolor: "#f8f9fa",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    mb: 1,
                    color: "#374151",
                  }}
                >
                  Password requirements:
                </Typography>
                {passwordRules.map((rule, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.75,
                      gap: 1,
                    }}
                  >
                    {rule.test(formData.password) ? (
                      <CheckCircleIcon
                        sx={{
                          color: "#3b82f6",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{
                          color: "#d1d5db",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: rule.test(formData.password)
                          ? "#3b82f6"
                          : "#6b7280",
                        fontWeight: rule.test(formData.password) ? 600 : 400,
                      }}
                    >
                      {rule.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Terms and Conditions */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onClick={handleCheckboxClick}
                onChange={handleCheckboxClick}
                sx={{
                  p: 0.5,
                  mr: 0.5,
                  mt: -0.5, // Align with first line of text
                  "& .MuiSvgIcon-root": {
                    fontSize: 20,
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: 400,
                }}
              >
                I agree with{" "}
                <Link
                  href="#"
                  underline="always"
                  sx={{
                    color: "#3b82f6",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  Privacy Policy and Terms and Conditions
                </Link>
              </Typography>
            }
            sx={{
              mb: 3,
              alignItems: "flex-start",
            }}
          />

          {/* Sign Up Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isFormValid || loading}
            sx={{
              bgcolor: isFormValid ? "#3b82f6" : "#e5e7eb",
              color: isFormValid ? "#fff" : "#9ca3af",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: "10px",
              height: 48,
              mb: 3,
              textTransform: "none",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              "&:hover": {
                bgcolor: isFormValid ? "#2563eb" : "#e5e7eb",
                boxShadow: isFormValid
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  : "none",
              },
              "&:disabled": {
                bgcolor: "#e5e7eb",
                color: "#9ca3af",
                cursor: "not-allowed",
              },
            }}
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>

          {/* Login Link */}
          <Typography
            sx={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => navigate("/login")}
              sx={{
                color: "#3b82f6",
                fontWeight: 700,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </AuthLayout>

      <TermsAndConditionsDialog
        open={termsOpen}
        onClose={handleClose}
        onAgree={handleAgree}
      />
    </>
  );
};

export default RegisterForm;
