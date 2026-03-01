import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Avatar upload modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });

    fetchUserBookings();
  }, [user]);

  const fetchUserBookings = async () => {
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

  // Handle avatar upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPG, PNG, WebP, or GIF)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedImage) return;

    setAvatarUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await axios.post("/api/auth/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user context with new avatar
      if (updateUser) {
        updateUser({ ...user, avatar: response.data.avatar });
      }

      setProfileData({ ...profileData, avatar: response.data.avatar });
      setShowAvatarModal(false);
      setSelectedImage(null);
      setProfileMessage({
        type: "success",
        text: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setProfileMessage({ type: "danger", text: "Failed to upload image" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setProfileLoading(true);

    const result = await updateProfile(profileData);

    if (result.success) {
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } else {
      setProfileMessage({ type: "danger", text: result.message });
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "danger", text: "Passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "danger",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setPasswordLoading(true);

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
    );

    if (result.success) {
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordMessage({ type: "danger", text: result.message });
    }
    setPasswordLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: "bg-success",
      pending: "bg-warning",
      cancelled: "bg-danger",
      completed: "bg-info",
    };
    return statusClasses[status] || "bg-secondary";
  };

  if (!user) {
    return null;
  }

  return (
    <div
      style={{ paddingTop: "80px", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowAvatarModal(false)}>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}>
              <h3 style={{ margin: 0 }}>Update Profile Photo</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}>
                &times;
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "10px",
                  display: "block",
                }}>
                Select Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                style={{ marginBottom: "15px" }}
              />

              {selectedImage && (
                <div style={{ marginTop: "15px" }}>
                  <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                    Selected: {selectedImage.name}
                  </p>
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={handleUploadAvatar}
                    disabled={avatarUploading}
                    style={{ width: "100%" }}>
                    {avatarUploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              )}

              {!selectedImage && (
                <div
                  style={{
                    border: "2px dashed #ddd",
                    borderRadius: "8px",
                    padding: "40px",
                    textAlign: "center",
                    color: "#666",
                  }}>
                  <i
                    className="fas fa-cloud-upload-alt"
                    style={{ fontSize: "3rem", marginBottom: "10px" }}></i>
                  <p>Click "Select Image" to choose a photo from your device</p>
                  <p style={{ fontSize: "12px" }}>
                    JPG, PNG, WebP or GIF (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container py-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{ position: "relative" }}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "#2c3e50",
                        color: "white",
                        fontSize: "2.5rem",
                      }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h5 className="mb-1">{user.name}</h5>
                <p className="text-muted small mb-3">{user.email}</p>
                <span
                  className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-3">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                  style={{ border: "none" }}>
                  <i className="fas fa-user me-2"></i> My Profile
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === "bookings" ? "active" : ""}`}
                  onClick={() => setActiveTab("bookings")}
                  style={{ border: "none" }}>
                  <i className="fas fa-calendar-alt me-2"></i> My Bookings
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => setActiveTab("password")}
                  style={{ border: "none" }}>
                  <i className="fas fa-lock me-2"></i> Change Password
                </button>
                <button
                  className="list-group-item list-group-item-action text-danger"
                  onClick={handleLogout}
                  style={{ border: "none" }}>
                  <i className="fas fa-sign-out-alt me-2"></i> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">Edit Profile</h4>

                  {profileMessage.text && (
                    <div className={`alert alert-${profileMessage.type}`}>
                      {profileMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit}>
                    {/* Profile Photo Section */}
                    <div className="mb-4">
                      <label className="form-label">Profile Photo</label>
                      <div className="d-flex align-items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Current Profile"
                            className="rounded-circle"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "80px",
                              height: "80px",
                              background: "#2c3e50",
                              color: "white",
                              fontSize: "2rem",
                            }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-accent"
                          onClick={() => setShowAvatarModal(true)}>
                          <i className="fas fa-camera me-2"></i>
                          Update Profile Photo
                        </button>
                      </div>
                      <small className="text-muted d-block mt-2">
                        Click the button above to upload a new profile photo
                      </small>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={profileData.email}
                          disabled
                        />
                        <small className="text-muted">
                          Email cannot be changed
                        </small>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+91"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={profileLoading}>
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">My Bookings</h4>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No bookings yet</p>
                      <Link to="/villas" className="btn btn-accent">
                        Browse Villas
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="col-12 mb-3">
                          <div className="card border">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h5 className="mb-1">
                                    {booking.villa?.title || "Villa"}
                                  </h5>
                                  <p className="text-muted mb-2">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {booking.villa?.location || "Location"}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Check-in:</strong>{" "}
                                    {new Date(
                                      booking.checkIn,
                                    ).toLocaleDateString()}
                                    <span className="mx-2">|</span>
                                    <strong>Check-out:</strong>{" "}
                                    {new Date(
                                      booking.checkOut,
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="mb-0">
                                    <strong>Guests:</strong> {booking.guests} |
                                    <strong> Total:</strong> ₹
                                    {booking.totalPrice}
                                  </p>
                                </div>
                                <span
                                  className={`badge ${getStatusBadge(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">Change Password</h4>

                  {passwordMessage.text && (
                    <div className={`alert alert-${passwordMessage.type}`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={passwordLoading}>
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
