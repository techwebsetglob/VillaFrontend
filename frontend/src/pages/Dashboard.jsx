import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh" }}>
      <section className="container" style={{ padding: "40px 20px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>My Dashboard</h2>

        {/* User Info */}
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
          }}>
          <h3>Welcome, {user?.name}!</h3>
          <p style={{ color: "#666" }}>{user?.email}</p>
          <p style={{ color: "#666" }}>{user?.phone}</p>
        </div>

        {/* My Bookings */}
        <div>
          <h3 style={{ marginBottom: "20px" }}>My Bookings</h3>

          {bookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f9f9f9",
                borderRadius: "12px",
              }}>
              <p style={{ marginBottom: "20px", color: "#666" }}>
                You haven't made any bookings yet.
              </p>
              <Link to="/villas" className="btn btn-accent">
                Browse Villas
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}>
                    <img
                      src={
                        booking.villa?.images?.[0]?.url ||
                        "https://placehold.co/150x100"
                      }
                      alt={booking.villa?.title}
                      style={{
                        width: "150px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div>
                      <h4>{booking.villa?.title}</h4>
                      <p style={{ color: "#666" }}>
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {booking.villa?.location}
                      </p>
                      <p style={{ color: "#666" }}>
                        <i className="fas fa-calendar"></i>{" "}
                        {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p style={{ color: "#666" }}>
                        <i className="fas fa-users"></i> {booking.guests} Guests
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#2c3e50",
                        marginBottom: "10px",
                      }}>
                      ₹{booking.totalPrice}
                    </div>
                    <span
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        background:
                          booking.status === "confirmed"
                            ? "#d4edda"
                            : booking.status === "cancelled"
                              ? "#f8d7da"
                              : "#fff3cd",
                        color:
                          booking.status === "confirmed"
                            ? "#155724"
                            : booking.status === "cancelled"
                              ? "#721c24"
                              : "#856404",
                        textTransform: "capitalize",
                      }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
