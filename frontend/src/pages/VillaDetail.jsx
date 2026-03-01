import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const VillaDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [villa, setVilla] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, text: "" });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchVilla();
    fetchReviews();
  }, [slug]);

  const fetchVilla = async () => {
    try {
      const response = await axios.get(`/api/villas/${slug}`);
      setVilla(response.data);
    } catch (error) {
      console.error("Error fetching villa:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (villa?._id) {
        const response = await axios.get(`/api/villas/${villa._id}/reviews`);
        setReviews(response.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (villa?._id) {
      fetchReviews();
    }
  }, [villa?._id]);

  const handleBooking = () => {
    if (!user) {
      navigate(
        "/login?redirect=" + encodeURIComponent(window.location.pathname),
      );
      return;
    }
    navigate(`/booking/${villa._id}`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/villas/${villa._id}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowReviewForm(false);
      setReviewData({ rating: 5, text: "" });
      fetchReviews();
    } catch (error) {
      alert("Failed to submit review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/villas/${villa._id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (error) {
      alert("Failed to delete review");
    }
  };

  // Handle star click for half-star rating
  const handleStarClick = (rating) => {
    if (reviewData.rating === rating) {
      setReviewData({ ...reviewData, rating: rating - 0.5 });
    } else if (reviewData.rating === rating - 0.5) {
      setReviewData({ ...reviewData, rating: rating });
    } else {
      setReviewData({ ...reviewData, rating: rating });
    }
  };

  // Render star icons with half-star support
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starClass = "far fa-star";
      if (interactive) {
        const displayRating = hoverRating || rating;
        if (i <= Math.floor(displayRating)) {
          starClass = "fas fa-star";
        } else if (i - 0.5 <= displayRating) {
          starClass = "fas fa-star-half-alt";
        }
      } else {
        if (i <= Math.floor(rating)) {
          starClass = "fas fa-star";
        } else if (i - 0.5 <= rating) {
          starClass = "fas fa-star-half-alt";
        }
      }

      stars.push(
        <i
          key={i}
          className={`${starClass} ${interactive ? "cursor-pointer" : ""}`}
          style={{
            color: "#FFD700",
            fontSize: interactive ? "1.5rem" : "1rem",
            cursor: interactive ? "pointer" : "inherit",
            transition: "transform 0.2s",
          }}
          onClick={() => interactive && onStarClick && onStarClick(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}></i>,
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p>Loading villa details...</p>
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
          View All Villas
        </Link>
      </div>
    );
  }

  // Amenity icon mapping
  const amenityIcons = {
    "Free WiFi": "fa-wifi",
    "Private Pool": "fa-swimming-pool",
    "Free Parking": "fa-parking",
    "Air Conditioning": "fa-air-conditioner",
    Heating: "fa-temperature-high",
    "Washing Machine": "fa-washing-machine",
    Iron: "fa-iron",
    TV: "fa-tv",
    "Music System": "fa-music",
    "Indoor Games": "fa-gamepad",
    "Books/Magazines": "fa-book",
    "Fully Equipped Kitchen": "fa-utensils",
    Microwave: "fa-blender",
    "Coffee Maker": "fa-coffee-pot",
    Toaster: "fa-toaster",
    Refrigerator: "fa-fridge",
    Barbeque: "fa-fire",
    Garden: "fa-leaf",
    "Sunbed/Lounger": "fa-amenity-sun",
    "Table Tennis": "fa-table-tennis",
    Bicycle: "fa-bicycle",
    "Gym Equipment": "fa-dumbbell",
    "Room Service": "fa-concierge-bell",
    "Host/Manager": "fa-user-tie",
    "Pet Friendly": "fa-paw",
    "First Aid Kit": "fa-pills",
    "Fire Extinguisher": "fa-fire-extinguisher",
    Safe: "fa-lock",
    "Key Card Access": "fa-key",
    "Security Camera": "fa-camera",
  };

  const getAmenityIcon = (amenityName) => {
    return amenityIcons[amenityName] || "fa-check";
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const outdoorAmenities = villa.amenities?.outdoor || [];
  const interiorAmenities = villa.amenities?.interior || [];
  const facilitiesAmenities = villa.amenities?.facilities || [];
  const entertainmentAmenities = villa.amenities?.entertainment || [];
  const allAmenities = [
    ...outdoorAmenities,
    ...interiorAmenities,
    ...facilitiesAmenities,
    ...entertainmentAmenities,
  ];

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Photo Gallery with Bootstrap Carousel */}
      <section className="container py-4">
        <div
          id="villaCarousel"
          className="carousel slide"
          data-bs-ride="carousel">
          {/* Main Image */}
          <div
            className="carousel-inner rounded-3 overflow-hidden"
            style={{ height: "500px" }}>
            {villa.images?.map((image, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
                style={{ height: "500px" }}>
                <img
                  src={image.url || "https://placehold.co/1200x600"}
                  className="d-block w-100"
                  alt={`${villa.title} - Image ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {villa.images?.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#villaCarousel"
                data-bs-slide="prev"
                style={{
                  width: "50px",
                  height: "50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "50%",
                  left: "20px",
                  border: "none",
                }}>
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#villaCarousel"
                data-bs-slide="next"
                style={{
                  width: "50px",
                  height: "50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "50%",
                  right: "20px",
                  border: "none",
                }}>
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {villa.images?.length > 1 && (
          <div className="thumbnail-gallery mt-3 d-flex gap-2 justify-content-center flex-wrap">
            {villa.images.map((image, index) => {
              let imageSrc = image.url;
              if (imageSrc && imageSrc.includes("localhost:5000")) {
                imageSrc = imageSrc.replace("http://localhost:5000", "");
              }

              return (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#villaCarousel"
                  data-bs-slide-to={index}
                  className={`thumbnail-btn ${index === 0 ? "active" : ""}`}
                  aria-label={`Thumbnail ${index + 1}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border:
                      index === 0 ? "2px solid #2c3e50" : "2px solid #ddd",
                    padding: 0,
                    cursor: "pointer",
                    background: "none",
                  }}>
                  <img
                    src={imageSrc}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/80x80?text=No+Image";
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Villa Details */}
      <section className="container" style={{ padding: "40px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "40px",
          }}>
          {/* Left Content */}
          <div>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
              {villa.title}
            </h1>
            <p
              style={{
                color: "#666",
                fontSize: "1.1rem",
                marginBottom: "20px",
              }}>
              <i className="fas fa-map-marker-alt"></i> {villa.location}
            </p>

            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <span>
                <i className="fas fa-users"></i> {villa.capacity} Guests
              </span>
              <span>
                <i className="fas fa-bed"></i> {villa.bedrooms} Bedrooms
              </span>
              <span>
                <i className="fas fa-bath"></i> {villa.baths} Bathrooms
              </span>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "15px" }}>About this villa</h2>
              <p style={{ lineHeight: "1.8", color: "#333" }}>
                {villa.description}
              </p>
            </div>

            {/* Amenities */}
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>Amenities</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                }}>
                {allAmenities.map((amenity, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                    <i
                      className={`fas ${getAmenityIcon(amenity)}`}
                      style={{ color: "#2c3e50" }}></i>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            {villa.houseRules?.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <h2 style={{ marginBottom: "15px" }}>House Rules</h2>
                <ul style={{ paddingLeft: "20px" }}>
                  {villa.houseRules.map((rule, index) => (
                    <li
                      key={index}
                      style={{ marginBottom: "8px", color: "#333" }}>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Reviews</h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn btn-accent">
                    Write a Review
                  </button>
                )}
              </div>

              {/* Average Rating Display */}
              {reviews.length > 0 && (
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                      <div className="display-4 fw-bold text-warning">
                        {calculateAverageRating()}
                      </div>
                      <div>
                        <div className="mb-1">
                          {renderStars(parseFloat(calculateAverageRating()))}
                        </div>
                        <p className="text-muted mb-0">
                          Based on {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showReviewForm && (
                <form
                  onSubmit={submitReview}
                  className="card mb-4 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Write Your Review</h5>

                    {/* Interactive Star Rating */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Rating:{" "}
                        <span className="text-warning fs-5">
                          {reviewData.rating}
                        </span>{" "}
                        / 5
                      </label>
                      <div className="d-flex align-items-center gap-1">
                        {renderStars(reviewData.rating, true, handleStarClick)}
                      </div>
                      <small className="text-muted">
                        Click on a star to rate. Click again for half-star.
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Your Review
                      </label>
                      <textarea
                        value={reviewData.text}
                        onChange={(e) =>
                          setReviewData({ ...reviewData, text: e.target.value })
                        }
                        className="form-control"
                        rows="4"
                        placeholder="Share your experience with this villa..."
                        required></textarea>
                    </div>
                    <button type="submit" className="btn btn-accent">
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  No reviews yet. Be the first to review this villa!
                </div>
              ) : (
                <div className="row">
                  {reviews.map((review) => (
                    <div key={review._id} className="col-12 mb-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <div className="text-warning">
                                {renderStars(review.rating)}
                              </div>
                              <strong className="ms-2">
                                {review.user?.name || "Anonymous"}
                              </strong>
                            </div>
                            {/* Delete button - only for review owner */}
                            {user && user._id === review.user?._id && (
                              <button
                                onClick={() => deleteReview(review._id)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete review">
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <p className="card-text text-secondary mb-0">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Booking */}
          <div
            style={{ position: "sticky", top: "100px", height: "fit-content" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid #e5e5e5",
                }}>
                <span style={{ color: "#666" }}>From</span>
                <div
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: "700",
                    color: "#2c3e50",
                  }}>
                  ₹{villa.price}
                </div>
                <span style={{ color: "#666", fontSize: "0.9rem" }}>
                  per night
                </span>
              </div>

              <button
                onClick={handleBooking}
                className="btn btn-accent"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1.1rem",
                  marginBottom: "15px",
                }}>
                <i className="fas fa-calendar-check"></i> Book Now
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: "0.9rem",
                }}>
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VillaDetail;
