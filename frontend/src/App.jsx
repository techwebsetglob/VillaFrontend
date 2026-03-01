import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Set base URL for all API calls - Point to Render backend
axios.defaults.baseURL = "https://villabackend.onrender.com";

import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Villas from "./pages/Villas";
import VillaDetail from "./pages/VillaDetail";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";

function App({ isAdmin = false }) {
  const { loading: authLoading } = useAuth();
  const [villas, setVillas] = useState([]);
  const [featuredVillas, setFeaturedVillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      fetchVillas();
      fetchFeaturedVillas();
    }
  }, [isAdmin]);

  const fetchVillas = async () => {
    try {
      const response = await axios.get("/api/villas");
      setVillas(response.data.villas);
    } catch (error) {
      console.error("Error fetching villas:", error);
    }
  };

  const fetchFeaturedVillas = async () => {
    try {
      const response = await axios.get("/api/villas/featured");
      setFeaturedVillas(response.data);
    } catch (error) {
      console.error("Error fetching featured villas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Admin Panel - Simplified layout without Navbar/Footer
  if (isAdmin) {
    return (
      <div className="admin-app">
        <Admin />
      </div>
    );
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Regular User App - With Navbar/Footer
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={<Home villas={featuredVillas} loading={loading} />}
          />
          <Route
            path="/villas"
            element={<Villas villas={villas} setVillas={setVillas} />}
          />
          <Route path="/villa/:slug" element={<VillaDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
