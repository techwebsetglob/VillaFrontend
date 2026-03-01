import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [villas, setVillas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Villa Form State
  const [showVillaForm, setShowVillaForm] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [villaForm, setVillaForm] = useState({
    title: "",
    location: "",
    description: "",
    price: "",
    oldPrice: "",
    capacity: "",
    bedrooms: "",
    baths: "",
    isAvailable: true,
  });

  // Price/Discount Form State
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    price: "",
    oldPrice: "",
    discount: "",
    discountType: "percentage",
    discountStartDate: "",
    discountEndDate: "",
  });
  const [pricingVillaId, setPricingVillaId] = useState(null);

  // Image Upload State
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingImages, setEditingImages] = useState(false);
  const [currentVillaForImages, setCurrentVillaForImages] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [dashboardRes, villasRes, bookingsRes, usersRes, contactsRes] =
        await Promise.all([
          axios.get("/api/admin/dashboard", { headers }),
          axios.get("/api/admin/villas", { headers }),
          axios.get("/api/admin/bookings", { headers }),
          axios.get("/api/admin/users", { headers }),
          axios.get("/api/admin/contacts", { headers }),
        ]);

      setDashboardData(dashboardRes.data);
      setVillas(villasRes.data);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate occupancy
  const getOccupancyStats = () => {
    const totalVillas = villas.length;
    const now = new Date();

    // Calculate occupied days in current month
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let occupiedDays = 0;
    let totalCapacity = 0;

    bookings.forEach((booking) => {
      if (booking.status === "confirmed") {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);

        // Check if booking overlaps with current month
        if (
          (checkIn.getMonth() === currentMonth &&
            checkIn.getFullYear() === currentYear) ||
          (checkOut.getMonth() === currentMonth &&
            checkOut.getFullYear() === currentYear)
        ) {
          const startDay = Math.max(1, checkIn.getDate());
          const endDay = Math.min(daysInMonth, checkOut.getDate());
          occupiedDays += Math.max(0, endDay - startDay + 1);
        }
      }
    });

    const occupancyRate =
      totalVillas > 0
        ? Math.round((occupiedDays / (totalVillas * daysInMonth)) * 100)
        : 0;

    return {
      totalVillas,
      occupiedDays,
      totalCapacity: totalVillas * 30,
      occupancyRate,
    };
  };

  // ===== VILLA CRUD =====
  const handleVillaSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const villaData = {
        ...villaForm,
        price: Number(villaForm.price),
        oldPrice: Number(villaForm.oldPrice) || 0,
        capacity: Number(villaForm.capacity),
        bedrooms: Number(villaForm.bedrooms),
        baths: Number(villaForm.baths),
        isAvailable: villaForm.isAvailable,
      };

      if (editingVilla) {
        await axios.put(`/api/admin/villas/${editingVilla._id}`, villaData, {
          headers,
        });
      } else {
        await axios.post("/api/admin/villas", villaData, { headers });
      }

      setShowVillaForm(false);
      setEditingVilla(null);
      resetVillaForm();
      fetchData();
    } catch (error) {
      alert("Error saving villa: " + error.message);
    }
  };

  const resetVillaForm = () => {
    setVillaForm({
      title: "",
      location: "",
      description: "",
      price: "",
      oldPrice: "",
      capacity: "",
      bedrooms: "",
      baths: "",
      isAvailable: true,
    });
  };

  const handleDeleteVilla = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this villa? This will also delete all images from Cloudinary.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/villas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      alert("Villa deleted successfully");
    } catch (error) {
      alert("Error deleting villa: " + error.message);
    }
  };

  const handleEditVilla = (villa) => {
    setEditingVilla(villa);
    setVillaForm({
      title: villa.title,
      location: villa.location,
      description: villa.description,
      price: villa.price,
      oldPrice: villa.oldPrice || "",
      capacity: villa.capacity,
      bedrooms: villa.bedrooms,
      baths: villa.baths,
      isAvailable: villa.isAvailable !== false,
    });
    setShowVillaForm(true);
  };

  // ===== PRICE & DISCOUNT =====
  const openPricingForm = (villa) => {
    setPricingVillaId(villa._id);
    setPricingForm({
      price: villa.price,
      oldPrice: villa.oldPrice || "",
      discount: villa.discount || "",
      discountType: villa.discountType || "percentage",
      discountStartDate: villa.discountStartDate
        ? villa.discountStartDate.split("T")[0]
        : "",
      discountEndDate: villa.discountEndDate
        ? villa.discountEndDate.split("T")[0]
        : "",
    });
    setShowPricingForm(true);
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `/api/admin/villas/${pricingVillaId}/price`,
        {
          price: Number(pricingForm.price),
          oldPrice: Number(pricingForm.oldPrice) || 0,
        },
        { headers },
      );

      alert("Price updated successfully");
      setShowPricingForm(false);
      fetchData();
    } catch (error) {
      alert("Error updating price: " + error.message);
    }
  };

  const handleDiscountUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `/api/admin/villas/${pricingVillaId}/discount`,
        {
          discount: Number(pricingForm.discount) || 0,
          discountType: pricingForm.discountType,
          discountStartDate: pricingForm.discountStartDate || null,
          discountEndDate: pricingForm.discountEndDate || null,
        },
        { headers },
      );

      alert("Discount updated successfully");
      setShowPricingForm(false);
      fetchData();
    } catch (error) {
      alert("Error updating discount: " + error.message);
    }
  };

  // ===== IMAGE MANAGEMENT =====
  const openImageManager = (villa) => {
    setCurrentVillaForImages(villa);
    setEditingImages(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleImageUpload = async () => {
    if (selectedImages.length === 0) {
      alert("Please select images first");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      await axios.post(
        `/api/admin/villas/${currentVillaForImages._id}/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Images uploaded successfully");
      setSelectedImages([]);
      setEditingImages(false);
      fetchData();
    } catch (error) {
      alert("Error uploading images: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/admin/villas/${currentVillaForImages._id}/images/${imageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Image deleted successfully");
      fetchData();

      const updatedVilla = villas.find(
        (v) => v._id === currentVillaForImages._id,
      );
      if (updatedVilla) {
        setCurrentVillaForImages(updatedVilla);
      }
    } catch (error) {
      alert("Error deleting image: " + error.message);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/villas/${currentVillaForImages._id}/images/${imageId}/primary`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Primary image updated");
      fetchData();
    } catch (error) {
      alert("Error setting primary image: " + error.message);
    }
  };

  // ===== BOOKING & USER =====
  const handleBookingStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (error) {
      alert("Error updating booking");
    }
  };

  const handleUserRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/users/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (error) {
      alert("Error updating user");
    }
  };

  const getDisplayPrice = (villa) => {
    if (!villa.discount || villa.discount === 0) {
      return villa.price;
    }

    const now = new Date();
    const startDate = villa.discountStartDate
      ? new Date(villa.discountStartDate)
      : null;
    const endDate = villa.discountEndDate
      ? new Date(villa.discountEndDate)
      : null;

    if (startDate && now < startDate) return villa.price;
    if (endDate && now > endDate) return villa.price;

    if (villa.discountType === "percentage") {
      return Math.round(villa.price * (1 - villa.discount / 100));
    } else {
      return Math.max(0, villa.price - villa.discount);
    }
  };

  const occupancyStats = getOccupancyStats();

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <div
      style={{ paddingTop: "80px", minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "250px",
            background: "#2c3e50",
            minHeight: "calc(100vh - 80px)",
            padding: "20px",
            color: "#fff",
          }}>
          <h3
            style={{
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
            Admin Dashboard
          </h3>
          <nav>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  style={{
                    background:
                      activeTab === "dashboard" ? "#3498db" : "transparent",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </button>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setActiveTab("villas")}
                  style={{
                    background:
                      activeTab === "villas" ? "#3498db" : "transparent",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}>
                  <i className="fas fa-home"></i> Villas
                </button>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setActiveTab("bookings")}
                  style={{
                    background:
                      activeTab === "bookings" ? "#3498db" : "transparent",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}>
                  <i className="fas fa-calendar"></i> Bookings
                </button>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setActiveTab("users")}
                  style={{
                    background:
                      activeTab === "users" ? "#3498db" : "transparent",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}>
                  <i className="fas fa-users"></i> Users
                </button>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  style={{
                    background:
                      activeTab === "inquiries" ? "#3498db" : "transparent",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}>
                  <i className="fas fa-envelope"></i> Inquiries
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "30px" }}>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <h2 style={{ marginBottom: "30px" }}>Dashboard Overview</h2>

              {/* Stats Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginBottom: "40px",
                }}>
                <div
                  style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div>
                      <p style={{ color: "#666", margin: "0" }}>Total Users</p>
                      <h2
                        style={{
                          fontSize: "36px",
                          margin: "10px 0 0 0",
                          color: "#2c3e50",
                        }}>
                        {users.length}
                      </h2>
                    </div>
                    <div
                      style={{
                        background: "#e8f5e9",
                        padding: "15px",
                        borderRadius: "50%",
                      }}>
                      <i
                        className="fas fa-users"
                        style={{ fontSize: "28px", color: "#4caf50" }}></i>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div>
                      <p style={{ color: "#666", margin: "0" }}>Total Villas</p>
                      <h2
                        style={{
                          fontSize: "36px",
                          margin: "10px 0 0 0",
                          color: "#2c3e50",
                        }}>
                        {villas.length}
                      </h2>
                    </div>
                    <div
                      style={{
                        background: "#e3f2fd",
                        padding: "15px",
                        borderRadius: "50%",
                      }}>
                      <i
                        className="fas fa-home"
                        style={{ fontSize: "28px", color: "#2196f3" }}></i>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div>
                      <p style={{ color: "#666", margin: "0" }}>
                        Total Bookings
                      </p>
                      <h2
                        style={{
                          fontSize: "36px",
                          margin: "10px 0 0 0",
                          color: "#2c3e50",
                        }}>
                        {bookings.length}
                      </h2>
                    </div>
                    <div
                      style={{
                        background: "#fff3e0",
                        padding: "15px",
                        borderRadius: "50%",
                      }}>
                      <i
                        className="fas fa-calendar-check"
                        style={{ fontSize: "28px", color: "#ff9800" }}></i>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div>
                      <p style={{ color: "#666", margin: "0" }}>
                        Total Revenue
                      </p>
                      <h2
                        style={{
                          fontSize: "36px",
                          margin: "10px 0 0 0",
                          color: "#2c3e50",
                        }}>
                        ₹
                        {dashboardData?.stats?.totalRevenue?.toLocaleString() ||
                          0}
                      </h2>
                    </div>
                    <div
                      style={{
                        background: "#fce4ec",
                        padding: "15px",
                        borderRadius: "50%",
                      }}>
                      <i
                        className="fas fa-rupee-sign"
                        style={{ fontSize: "28px", color: "#e91e63" }}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupancy Stats */}
              <div
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginBottom: "40px",
                }}>
                <h3 style={{ marginBottom: "20px" }}>Monthly Occupancy</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                  }}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                    }}>
                    <p style={{ color: "#666", margin: "0" }}>
                      Occupied Days This Month
                    </p>
                    <h2
                      style={{
                        fontSize: "32px",
                        margin: "10px 0 0 0",
                        color: "#2c3e50",
                      }}>
                      {occupancyStats.occupiedDays}
                    </h2>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                    }}>
                    <p style={{ color: "#666", margin: "0" }}>Available Days</p>
                    <h2
                      style={{
                        fontSize: "32px",
                        margin: "10px 0 0 0",
                        color: "#2c3e50",
                      }}>
                      {occupancyStats.totalCapacity -
                        occupancyStats.occupiedDays}
                    </h2>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                    }}>
                    <p style={{ color: "#666", margin: "0" }}>Occupancy Rate</p>
                    <h2
                      style={{
                        fontSize: "32px",
                        margin: "10px 0 0 0",
                        color:
                          occupancyStats.occupancyRate > 50
                            ? "#4caf50"
                            : "#ff9800",
                      }}>
                      {occupancyStats.occupancyRate}%
                    </h2>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}>
                <h3 style={{ marginBottom: "20px" }}>Recent Bookings</h3>
                <div style={{ display: "grid", gap: "15px" }}>
                  {(dashboardData?.recentBookings || []).map((booking) => (
                    <div
                      key={booking._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                      }}>
                      <div>
                        <strong>
                          {booking.villa?.title || "Unknown Villa"}
                        </strong>
                        <p
                          style={{
                            margin: "5px 0 0 0",
                            color: "#666",
                            fontSize: "14px",
                          }}>
                          {booking.user?.name || "Unknown User"} |{" "}
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            padding: "5px 12px",
                            borderRadius: "20px",
                            background:
                              booking.status === "confirmed"
                                ? "#d4edda"
                                : "#fff3cd",
                            fontSize: "12px",
                          }}>
                          {booking.status}
                        </span>
                        <p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>
                          ₹{booking.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.recentBookings ||
                    dashboardData.recentBookings.length === 0) && (
                    <p
                      style={{
                        color: "#666",
                        textAlign: "center",
                        padding: "20px",
                      }}>
                      No recent bookings
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Villas Tab */}
          {activeTab === "villas" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "30px",
                }}>
                <h2>Manage Villas</h2>
                <button
                  onClick={() => {
                    setShowVillaForm(true);
                    setEditingVilla(null);
                    resetVillaForm();
                  }}
                  className="btn btn-accent">
                  <i className="fas fa-plus"></i> Add Villa
                </button>
              </div>

              {/* Villa Form Modal */}
              {showVillaForm && (
                <div
                  style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    position: "relative",
                  }}>
                  <button
                    onClick={() => {
                      setShowVillaForm(false);
                      setEditingVilla(null);
                    }}
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}>
                    &times;
                  </button>
                  <h3>{editingVilla ? "Edit Villa" : "Add New Villa"}</h3>
                  <form
                    onSubmit={handleVillaSubmit}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                      marginTop: "20px",
                    }}>
                    <input
                      type="text"
                      placeholder="Title"
                      value={villaForm.title}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, title: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={villaForm.location}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, location: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <textarea
                      placeholder="Description"
                      value={villaForm.description}
                      onChange={(e) =>
                        setVillaForm({
                          ...villaForm,
                          description: e.target.value,
                        })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        gridColumn: "span 2",
                        minHeight: "80px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={villaForm.price}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, price: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Old Price (₹)"
                      value={villaForm.oldPrice}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, oldPrice: e.target.value })
                      }
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={villaForm.capacity}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, capacity: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Bedrooms"
                      value={villaForm.bedrooms}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, bedrooms: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Baths"
                      value={villaForm.baths}
                      onChange={(e) =>
                        setVillaForm({ ...villaForm, baths: e.target.value })
                      }
                      required
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                      <input
                        type="checkbox"
                        checked={villaForm.isAvailable}
                        onChange={(e) =>
                          setVillaForm({
                            ...villaForm,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                      Available for booking
                    </label>
                    <div
                      style={{
                        gridColumn: "span 2",
                        display: "flex",
                        gap: "10px",
                      }}>
                      <button type="submit" className="btn btn-accent">
                        {editingVilla ? "Update" : "Add"} Villa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVillaForm(false)}
                        className="btn btn-outline">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Pricing Form Modal */}
              {showPricingForm && (
                <div
                  style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    position: "relative",
                  }}>
                  <button
                    onClick={() => setShowPricingForm(false)}
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}>
                    &times;
                  </button>
                  <h3>Update Pricing</h3>

                  <form
                    onSubmit={handlePriceUpdate}
                    style={{
                      marginBottom: "20px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #eee",
                    }}>
                    <h4 style={{ marginBottom: "15px" }}>Base Price</h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                      }}>
                      <input
                        type="number"
                        placeholder="New Price (₹)"
                        value={pricingForm.price}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            price: e.target.value,
                          })
                        }
                        required
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Old Price (₹)"
                        value={pricingForm.oldPrice}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            oldPrice: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-accent"
                        style={{ gridColumn: "span 2" }}>
                        Update Price
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleDiscountUpdate}>
                    <h4 style={{ marginBottom: "15px" }}>Discount Settings</h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                      }}>
                      <input
                        type="number"
                        placeholder="Discount Value"
                        value={pricingForm.discount}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            discount: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      />
                      <select
                        value={pricingForm.discountType}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            discountType: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                      <input
                        type="date"
                        value={pricingForm.discountStartDate}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            discountStartDate: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      />
                      <input
                        type="date"
                        value={pricingForm.discountEndDate}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            discountEndDate: e.target.value,
                          })
                        }
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-accent"
                        style={{ gridColumn: "span 2" }}>
                        Update Discount
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Image Manager Modal */}
              {editingImages && currentVillaForImages && (
                <div
                  style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    position: "relative",
                  }}>
                  <button
                    onClick={() => setEditingImages(false)}
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}>
                    &times;
                  </button>
                  <h3>Manage Images - {currentVillaForImages.title}</h3>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "20px",
                      background: "#f9f9f9",
                      borderRadius: "8px",
                    }}>
                    <h4>Upload New Images</h4>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      ref={fileInputRef}
                      style={{ marginTop: "10px" }}
                    />
                    {selectedImages.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <p>{selectedImages.length} image(s) selected</p>
                        <button
                          onClick={handleImageUpload}
                          className="btn btn-accent"
                          disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload Images"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <h4>Existing Images</h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "15px",
                        marginTop: "15px",
                      }}>
                      {(currentVillaForImages.images || []).map((img, idx) => (
                        <div
                          key={img._id || idx}
                          style={{
                            position: "relative",
                            border: img.isPrimary
                              ? "3px solid #3498db"
                              : "1px solid #ddd",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}>
                          <img
                            src={img.url}
                            alt={`Villa ${idx}`}
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          {img.isPrimary && (
                            <span
                              style={{
                                position: "absolute",
                                top: "5px",
                                left: "5px",
                                background: "#3498db",
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}>
                              Primary
                            </span>
                          )}
                          <div
                            style={{
                              padding: "8px",
                              display: "flex",
                              gap: "5px",
                            }}>
                            {!img.isPrimary && (
                              <button
                                onClick={() => handleSetPrimaryImage(img._id)}
                                style={{
                                  flex: 1,
                                  padding: "5px",
                                  background: "#3498db",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}>
                                Set Primary
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteImage(img._id)}
                              style={{
                                flex: 1,
                                padding: "5px",
                                background: "#e74c3c",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(!currentVillaForImages.images ||
                      currentVillaForImages.images.length === 0) && (
                      <p style={{ color: "#666", marginTop: "15px" }}>
                        No images uploaded yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Villas List */}
              <div style={{ display: "grid", gap: "15px" }}>
                {villas.map((villa) => (
                  <div
                    key={villa._id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}>
                        <img
                          src={
                            villa.images?.[0]?.url ||
                            "https://placehold.co/100x60"
                          }
                          alt={villa.title}
                          style={{
                            width: "100px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                        <div>
                          <h4>{villa.title}</h4>
                          <p style={{ color: "#666" }}>{villa.location}</p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}>
                            <span
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#2c3e50",
                              }}>
                              ₹{getDisplayPrice(villa)}
                            </span>
                            {villa.oldPrice > 0 && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#999",
                                }}>
                                ₹{villa.oldPrice}
                              </span>
                            )}
                            {villa.discount > 0 && (
                              <span
                                style={{
                                  background: "#e74c3c",
                                  color: "#fff",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}>
                                {villa.discount}% OFF
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "5px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              background: villa.isAvailable
                                ? "#d4edda"
                                : "#f8d7da",
                              color: villa.isAvailable ? "#155724" : "#721c24",
                            }}>
                            {villa.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}>
                        <button
                          onClick={() => openImageManager(villa)}
                          className="btn btn-outline"
                          style={{ padding: "8px 16px" }}>
                          <i className="fas fa-image"></i> Images
                        </button>
                        <button
                          onClick={() => openPricingForm(villa)}
                          className="btn btn-outline"
                          style={{ padding: "8px 16px" }}>
                          <i className="fas fa-tag"></i> Price/Discount
                        </button>
                        <button
                          onClick={() => handleEditVilla(villa)}
                          className="btn btn-outline"
                          style={{ padding: "8px 16px" }}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVilla(villa._id)}
                          className="btn btn-outline"
                          style={{
                            padding: "8px 16px",
                            color: "#e74c3c",
                            borderColor: "#e74c3c",
                          }}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              <h2 style={{ marginBottom: "30px" }}>Manage Bookings</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}>
                      <div>
                        <h4>{booking.villa?.title}</h4>
                        <p style={{ color: "#666" }}>
                          Guest: {booking.guestDetails?.name}
                        </p>
                        <p style={{ color: "#666" }}>
                          Check-in:{" "}
                          {new Date(booking.checkIn).toLocaleDateString()} |
                          Check-out:{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                        <p>₹{booking.totalPrice}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
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
                            textTransform: "capitalize",
                          }}>
                          {booking.status}
                        </span>
                        <div style={{ marginTop: "10px" }}>
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleBookingStatus(booking._id, "confirmed")
                                }
                                className="btn btn-accent"
                                style={{
                                  padding: "6px 12px",
                                  marginRight: "5px",
                                }}>
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  handleBookingStatus(booking._id, "cancelled")
                                }
                                className="btn btn-outline"
                                style={{ padding: "6px 12px" }}>
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 style={{ marginBottom: "30px" }}>Manage Users</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                {users.map((u) => (
                  <div
                    key={u._id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div>
                      <h4>{u.name}</h4>
                      <p style={{ color: "#666" }}>{u.email}</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}>
                      <span
                        style={{
                          padding: "6px 16px",
                          borderRadius: "20px",
                          background:
                            u.role === "admin" ? "#3498db" : "#ecf0f1",
                          color: u.role === "admin" ? "#fff" : "#333",
                          textTransform: "capitalize",
                        }}>
                        {u.role}
                      </span>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleUserRole(u._id, "admin")}
                          className="btn btn-outline"
                          style={{ padding: "6px 12px" }}>
                          Make Admin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div>
              <h2 style={{ marginBottom: "30px" }}>Inquiries</h2>
              <div style={{ display: "grid", gap: "15px" }}>
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}>
                          <h4 style={{ margin: 0 }}>{contact.name}</h4>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              background: "#e3f2fd",
                              color: "#1976d2",
                              fontSize: "12px",
                            }}>
                            {contact.email}
                          </span>
                        </div>
                        <p style={{ color: "#666", marginBottom: "10px" }}>
                          {contact.message}
                        </p>
                        <p
                          style={{
                            color: "#999",
                            fontSize: "12px",
                            margin: 0,
                          }}>
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                        {contact.phone && (
                          <p
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginTop: "5px",
                            }}>
                            📞 {contact.phone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this inquiry?",
                            )
                          ) {
                            try {
                              const token = localStorage.getItem("token");
                              await axios.delete(
                                `/api/admin/contacts/${contact._id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              fetchData();
                              alert("Inquiry deleted successfully");
                            } catch (error) {
                              alert("Error deleting inquiry");
                            }
                          }
                        }}
                        className="btn btn-outline"
                        style={{
                          padding: "8px 16px",
                          color: "#e74c3c",
                          borderColor: "#e74c3c",
                        }}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div
                    style={{
                      background: "#fff",
                      padding: "40px",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}>
                    <p style={{ color: "#666" }}>No inquiries yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
