import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Set base URL for production - uses environment variable or fallback to render backend
const baseURL =
  import.meta.env?.VITE_API_URL || "https://villabackend.onrender.com";
axios.defaults.baseURL = baseURL;
console.log("API Base URL:", baseURL);

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const googleLogin = async (googleId, email, name, avatar) => {
    try {
      const response = await axios.post("/api/auth/google", {
        googleId,
        email,
        name,
        avatar,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Google login failed",
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        phone,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reset email",
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reset password",
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("/api/auth/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/auth/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password",
      };
    }
  };

  const sendEmailOTP = async (email) => {
    try {
      const response = await axios.post("/api/auth/send-email-otp", { email });
      return {
        success: true,
        message: response.data.message,
        otp: response.data.otp,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send email OTP",
      };
    }
  };

  const verifyEmailOTP = async (email, otp, name) => {
    try {
      const response = await axios.post("/api/auth/verify-email-otp", {
        email,
        otp,
        name,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid or expired OTP",
      };
    }
  };

  const sendPhoneOTP = async (phone, countryCode) => {
    try {
      const response = await axios.post("/api/auth/send-phone-otp", {
        phone,
        countryCode,
      });
      return {
        success: true,
        message: response.data.message,
        otp: response.data.otp,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send phone OTP",
      };
    }
  };

  const verifyPhoneOTP = async (phone, countryCode, otp, name) => {
    try {
      const response = await axios.post("/api/auth/verify-phone-otp", {
        phone,
        countryCode,
        otp,
        name,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid or expired OTP",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        register,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        sendEmailOTP,
        verifyEmailOTP,
        sendPhoneOTP,
        verifyPhoneOTP,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
