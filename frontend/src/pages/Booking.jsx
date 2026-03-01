import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);
  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialRequests: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user) {
      navigate(
        "/login?redirect=" + encodeURIComponent(window.location.pathname),
      );
      return;
    }
    fetchVilla();
  }, [id, user]);

  const fetchVilla = async () => {
    try {
      const response = await axios.get(`/api/villas`);
      const foundVilla = response.data.villas.find((v) => v._id === id);
      setVilla(foundVilla);

      // Fetch booked dates for this villa
      if (foundVilla?._id) {
        const datesResponse = await axios.get(
          `/api/bookings/villa/${foundVilla._id}/booked-dates`,
        );
        setBookedDates(datesResponse.data.bookedDates || []);
      }
    } catch (error) {
      console.error("Error fetching villa:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a date is booked
  const isDateBooked = (dateStr) => {
    return bookedDates.includes(dateStr);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Generate date string for a given date
  const getDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate check-in date is not booked
    if (name === "checkIn" && value) {
      if (isDateBooked(value)) {
        alert("This date is already booked. Please select another date.");
        return;
      }
      // Check if the next day is booked (can't check in the day before checkout of another booking)
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];
      if (isDateBooked(nextDayStr)) {
        alert(
          "Cannot check in on this date as the next day is already booked.",
        );
        return;
      }
    }

    // Validate check-out date is not booked
    if (name === "checkOut" && value) {
      if (isDateBooked(value)) {
        alert("This date is already booked. Please select another date.");
        return;
      }
    }

    setBooking((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate total price when dates or villa changes
  useEffect(() => {
    if (villa && booking.checkIn && booking.checkOut) {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nightsCount = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
      );
      setNights(nightsCount > 0 ? nightsCount : 0);
      setTotalPrice(nightsCount > 0 ? villa.price * nightsCount : villa.price);
    } else if (villa) {
      setTotalPrice(villa.price);
      setNights(0);
    }
  }, [booking.checkIn, booking.checkOut, villa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/bookings",
        {
          villaId: id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          guestDetails: {
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            specialRequests: booking.specialRequests,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess(true);

      // Open WhatsApp with booking details
      const bookingData = response.data;
      const whatsappMessage = `Hello! I just booked ${villa.title}.\nBooking ID: ${bookingData._id}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nGuests: ${booking.guests}\nTotal Price: ₹${bookingData.totalPrice}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=918669379419&text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        logout();
        navigate(
          "/login?redirect=" + encodeURIComponent(window.location.pathname),
        );
        return;
      }
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!villa) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2>Villa not found</h2>
        <Link
          to="/villas"
          className="btn btn-accent"
          style={{ marginTop: "20px" }}>
          View Villas
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <i
            className="fas fa-check-circle"
            style={{
              fontSize: "4rem",
              color: "#10b981",
              marginBottom: "20px",
            }}></i>
          <h2>Booking Submitted Successfully!</h2>
          <p style={{ margin: "20px 0", color: "#666" }}>
            Your booking request has been submitted. The villa owner will
            contact you soon. WhatsApp has been opened with your booking
            details.
          </p>
          <Link to="/dashboard" className="btn btn-accent">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px" }}>
      <section
        className="container"
        style={{ padding: "50px 20px", maxWidth: "1200px" }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "10px",
            textAlign: "center",
          }}>
          Complete Your Booking
        </h2>
        <p style={{ color: "#666", marginBottom: "30px", textAlign: "center" }}>
          Fill in your details to book {villa.title}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
          }}>
          {/* Booking Form */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(212,126,48,0.08), rgba(141,90,43,0.08))",
              borderRadius: "18px",
              padding: "30px",
              border: "2px solid rgba(212,126,48,0.2)",
            }}>
            <h3
              style={{
                marginBottom: "20px",
                color: "#000000",
                fontWeight: "700",
              }}>
              <i className="fas fa-edit"></i> Booking Details
            </h3>

            {error && (
              <div
                style={{
                  background: "#fee",
                  color: "#c00",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label
                  style={{
                    color: "#000000",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={booking.name}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    width: "100%",
                    color: "#000000",
                  }}
                />
              </div>
              <div className="form-row">
                <label
                  style={{
                    color: "#000000",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={booking.email}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    width: "100%",
                    color: "#000000",
                  }}
                />
              </div>
              <div className="form-row">
                <label
                  style={{
                    color: "#000000",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={booking.phone}
                  onChange={handleChange}
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    width: "100%",
                    color: "#000000",
                  }}
                />
              </div>

              {/* Custom Calendar for Date Selection */}
              <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <h4
                  style={{
                    marginBottom: "12px",
                    fontSize: "1rem",
                    color: "#333",
                  }}>
                  <i className="fas fa-calendar-alt"></i> Select Dates (Click on
                  Calendar)
                </h4>

                {/* Color Legend */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "12px",
                    fontSize: "0.75rem",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#4a5568",
                        borderRadius: "2px",
                      }}></span>
                    <span style={{ color: "#666" }}>Past</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "2px",
                      }}></span>
                    <span style={{ color: "#666" }}>Selected</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#ef4444",
                        borderRadius: "2px",
                      }}></span>
                    <span style={{ color: "#666" }}>Booked</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "2px",
                      }}></span>
                    <span style={{ color: "#666" }}>Available</span>
                  </div>
                </div>

                {/* Month Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: "#d47e30",
                      padding: "4px 8px",
                    }}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#333",
                      fontSize: "0.9rem",
                    }}>
                    {currentMonth.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: "#d47e30",
                      padding: "4px 8px",
                    }}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "2px",
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                    padding: "10px",
                    borderRadius: "8px",
                  }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        style={{
                          padding: "6px 2px",
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          color: "#666",
                          backgroundColor: "#fff",
                        }}>
                        {day}
                      </div>
                    ),
                  )}
                  {generateCalendarDays()}
                </div>

                {/* Selected Dates Display */}
                {booking.checkIn && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "0.85rem",
                      color: "#3b82f6",
                      fontWeight: "600",
                    }}>
                    <i className="fas fa-check-circle"></i> Check-in:{" "}
                    {booking.checkIn}
                    {booking.checkOut && (
                      <span> | Check-out: {booking.checkOut}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="form-row">
                <label
                  style={{
                    color: "#000000",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={booking.guests}
                  onChange={handleChange}
                  min="1"
                  max={villa.capacity}
                  required
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    width: "100%",
                    color: "#000000",
                  }}
                />
              </div>
              <div className="form-row">
                <label
                  style={{
                    color: "#000000",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "8px",
                  }}>
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={booking.specialRequests}
                  onChange={handleChange}
                  rows="3"
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    width: "100%",
                    color: "#000000",
                  }}></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-accent"
                style={{ width: "100%", padding: "14px" }}>
                <i className="fas fa-check-circle"></i> Book Now
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(212,126,48,0.08), rgba(141,90,43,0.08))",
              borderRadius: "18px",
              padding: "30px",
              border: "2px solid rgba(212,126,48,0.2)",
            }}>
            <h3
              style={{
                marginBottom: "20px",
                color: "#1a1a1a",
                fontWeight: "700",
              }}>
              <i className="fas fa-info-circle"></i> Booking Summary
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <img
                src={villa.images?.[0]?.url || "https://placehold.co/400x300"}
                alt={villa.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              />
              <h4
                style={{
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "1.2rem",
                }}>
                {villa.title}
              </h4>
              <p style={{ color: "#333", fontWeight: "500" }}>
                <i className="fas fa-map-marker-alt"></i> {villa.location}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                color: "#1a1a1a",
                fontWeight: "500",
              }}>
              <span>Price per night</span>
              <span style={{ fontWeight: "700", color: "#2c3e50" }}>
                ₹{villa.price}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                color: "#1a1a1a",
                fontWeight: "500",
              }}>
              <span>Number of nights</span>
              <span style={{ fontWeight: "700", color: "#2c3e50" }}>
                {nights > 0 ? nights : "Select dates"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                color: "#1a1a1a",
                fontWeight: "500",
              }}>
              <span>Guests</span>
              <span style={{ fontWeight: "700", color: "#2c3e50" }}>
                {booking.guests}
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e5e5",
                paddingTop: "15px",
                marginTop: "15px",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "#1a1a1a",
                }}>
                <span>Total</span>
                <span style={{ color: "#2c3e50" }}>₹{totalPrice}</span>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <a
                href={`tel:+91899360889`}
                className="btn btn-outline"
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  display: "block",
                  textAlign: "center",
                }}>
                <i className="fab fa-whatsapp"></i> Contact via WhatsApp
              </a>
              <Link
                to={`/villa/${villa.slug}`}
                className="btn btn-accent"
                style={{
                  width: "100%",
                  display: "block",
                  textAlign: "center",
                }}>
                <i className="fas fa-arrow-left"></i> Back to Villa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Generate calendar days
  function generateCalendarDays() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: "8px 4px" }}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const isPast = date < today;
      const isBooked = bookedDates.includes(dateStr);
      const isCheckIn = booking.checkIn === dateStr;
      const isCheckOut = booking.checkOut === dateStr;
      const isInRange =
        booking.checkIn &&
        booking.checkOut &&
        date > new Date(booking.checkIn) &&
        date < new Date(booking.checkOut);

      let backgroundColor = "transparent";
      let color = "#333";
      let cursor = "pointer";
      let fontWeight = "400";

      if (isPast) {
        backgroundColor = "#4a5568";
        color = "#fff";
        cursor = "not-allowed";
      } else if (isBooked) {
        backgroundColor = "#ef4444";
        color = "#fff";
        cursor = "not-allowed";
      } else if (isCheckIn || isCheckOut) {
        backgroundColor = "#3b82f6";
        color = "#fff";
        fontWeight = "600";
      } else if (isInRange) {
        backgroundColor = "#93c5fd";
        color = "#1e40af";
      }

      days.push(
        <div
          key={day}
          onClick={() => {
            if (!isPast && !isBooked) {
              if (!booking.checkIn || (booking.checkIn && booking.checkOut)) {
                setBooking((prev) => ({
                  ...prev,
                  checkIn: dateStr,
                  checkOut: "",
                }));
              } else if (dateStr > booking.checkIn) {
                setBooking((prev) => ({ ...prev, checkOut: dateStr }));
              } else {
                setBooking((prev) => ({
                  ...prev,
                  checkIn: dateStr,
                  checkOut: "",
                }));
              }
            }
          }}
          style={{
            padding: "8px 4px",
            fontSize: "0.85rem",
            backgroundColor,
            color,
            cursor,
            fontWeight,
            borderRadius: "4px",
            transition: "all 0.2s",
          }}>
          {day}
        </div>,
      );
    }

    return days;
  }
};

export default Booking;
