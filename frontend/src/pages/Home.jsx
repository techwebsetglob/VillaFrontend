import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = ({ villas, loading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [royaltyIndex, setRoyaltyIndex] = useState(0);

  const heroImages = [
    "images/mountain sky villa/IMG-20250708-WA0099.jpg",
    "images/vrundavan villa/IMG-20250516-WA0034.jpg",
    "images/mountain sky villa/IMG-20250708-WA0115.jpg",
    "images/vrundavan villa/IMG-20250517-WA0091.jpg",
    "images/mountain sky villa/IMG-20250708-WA0126.jpg",
  ];

  const royaltyImages = [
    "images/mountain sky villa/IMG-20250708-WA0099.jpg",
    "images/mountain sky villa/IMG-20250708-WA0115.jpg",
    "images/mountain sky villa/IMG-20250708-WA0135.jpg",
    "images/vrundavan villa/IMG-20250516-WA0034.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoyaltyIndex((prev) => (prev + 1) % royaltyImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const amenities = [
    { icon: "fa-wifi", label: "FREE WIFI" },
    { icon: "fa-fire", label: "BARBEQUE PROVISION" },
    { icon: "fa-concierge-bell", label: "CONCIERGE SERVICE" },
    { icon: "fa-utensils", label: "KITCHEN" },
    { icon: "fa-clipboard-check", label: "REGULAR INSPECTION" },
    { icon: "fa-bed", label: "CLEAN LINEN" },
    { icon: "fa-music", label: "MUSIC SYSTEM" },
    { icon: "fa-user-tie", label: "DEDICATED HOST MANAGER" },
    { icon: "fa-umbrella-beach", label: "GAZEBO" },
    { icon: "fa-swimming-pool", label: "PRIVATE POOL" },
    { icon: "fa-gamepad", label: "INDOOR GAMES" },
    { icon: "fa-hat-chef", label: "CHEF SERVICE" },
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      date: "January 2025",
      text: "Absolutely stunning villa! The infinity pool with mountain views was breathtaking. Our family had the most memorable vacation.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      location: "Pune, Maharashtra",
      date: "December 2024",
      text: "Perfect getaway for our anniversary! The villa exceeded our expectations with its modern amenities and beautiful garden.",
      rating: 5,
    },
    {
      name: "Amit Patel",
      location: "Bangalore, Karnataka",
      date: "November 2024",
      text: "Hosted a corporate retreat here and everyone loved it! The spacious villa accommodated our entire team comfortably.",
      rating: 5,
    },
    {
      name: "Sneha Desai",
      location: "Delhi",
      date: "October 2024",
      text: "What a wonderful experience! The kids loved the pool and the adults enjoyed the peaceful surroundings.",
      rating: 5,
    },
    {
      name: "Vikram Singh",
      location: "Ahmedabad, Gujarat",
      date: "September 2024",
      text: "Exceptional service and stunning property! Celebrated my birthday here and it was unforgettable.",
      rating: 5,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams({
      location: formData.get("location"),
      checkin: formData.get("checkin"),
      guests: formData.get("guests"),
    });
    window.location.href = `/villas?${params.toString()}`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-ekostay">
        <div className="hero-slideshow">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url('${img}')` }}></div>
          ))}
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-brand">
            <span className="brand-letter">B</span>
            <span className="brand-letter">R</span>
            <span className="brand-letter">I</span>
            <span className="brand-letter">G</span>
            <span className="brand-letter">H</span>
            <span className="brand-letter">T</span>
            <span className="brand-space"> </span>
            <span className="brand-letter">V</span>
            <span className="brand-letter">I</span>
            <span className="brand-letter">L</span>
            <span className="brand-letter">L</span>
            <span className="brand-letter">A</span>
            <span className="brand-letter">S</span>
          </h1>
          <h2 className="hero-subtitle">
            Where every property feels like home
          </h2>

          <div className="search-widget-modern">
            <form className="row g-3 align-items-end" onSubmit={handleSearch}>
              <div className="col-md-3">
                <label className="form-label fw-bold">Villa / Location</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-map-marker-alt text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search location..."
                    name="location"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Date</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-calendar text-muted"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control border-start-0"
                    name="checkin"
                    required
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Guests</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-users text-muted"></i>
                  </span>
                  <select
                    className="form-select border-start-0"
                    name="guests"
                    required>
                    <option value="">Select Guests</option>
                    <option value="2">2 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6 Guests</option>
                    <option value="8">8 Guests</option>
                    <option value="10">10+ Guests</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-primary w-100 py-2">
                  <i className="fas fa-search"></i> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-badges container">
        <div className="trust-grid">
          <div className="trust-item">
            <i className="fas fa-check-circle"></i>
            <span>Verified Properties</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-star"></i>
            <span>4.8 Average Rating</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-clock"></i>
            <span>24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="stats-section container">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number" data-target="50">
              50
            </div>
            <div className="stat-label">Luxury Villas</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="5000">
              5000
            </div>
            <div className="stat-label">Happy Guests</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="10">
              10
            </div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="4.8">
              4.8
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="featured-properties">
        <div className="section-header-featured">
          <h2>FEATURED PROPERTIES</h2>
        </div>

        <div className="villa-carousel-wrapper">
          <div className="villa-carousel">
            {loading ? (
              <p style={{ color: "#fff" }}>Loading...</p>
            ) : (
              villas.map((villa) => (
                <div key={villa._id} className="villa-circle">
                  <img
                    src={
                      villa.images?.[0]?.url || "https://placehold.co/400x400"
                    }
                    alt={villa.title}
                  />
                  <div className="villa-overlay">
                    <h3 className="villa-name">{villa.title}</h3>
                    <p className="villa-location">{villa.location}</p>
                    <div className="villa-details">
                      <div className="villa-detail-item">
                        <i className="fas fa-users"></i>
                        <span>{villa.capacity}</span>
                      </div>
                      <div className="villa-detail-item">
                        <i className="fas fa-bed"></i>
                        <span>{villa.bedrooms}</span>
                      </div>
                      <div className="villa-detail-item">
                        <i className="fas fa-bath"></i>
                        <span>{villa.baths}</span>
                      </div>
                    </div>
                    <p className="villa-price">{villa.price} /-</p>
                  </div>
                  <Link
                    to={`/villa/${villa.slug}`}
                    style={{ position: "absolute", inset: 0 }}></Link>
                </div>
              ))
            )}
          </div>
          <button className="villa-nav-btn prev">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="villa-nav-btn next">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="view-all-container">
          <Link to="/villas" className="btn btn-accent btn-large">
            <i className="fas fa-arrow-right"></i> View All Villas
          </Link>
        </div>
      </section>

      {/* Quality Villas */}
      <section className="quality-villas container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            gap: "40px",
            alignItems: "center",
          }}>
          <Link
            to="/villa/vrundavan-villa"
            className="royalty-card d-block text-decoration-none">
            <div className="royalty-carousel">
              <img
                id="royaltyImage"
                className="royalty-image"
                src="/images/vrundavan villa/IMG-20250516-WA0034.jpg"
                alt="Vrundavan Villa Lonavala"
              />
              <div className="royalty-overlay">
                <div className="royalty-badge">
                  <i className="fas fa-crown"></i>
                </div>
                <h3>Vrundavan Villa</h3>
                <p>Experience luxury living at its finest</p>
              </div>
            </div>
          </Link>

          <div>
            <h2>
              Experience Unmatched Comfort at Our Family & Friend Friendly
              Villas
            </h2>
            <p className="quality-lead">
              We offer private pools, spacious living spaces, stunning mountain
              views, and modern amenities for unforgettable escapes. Browse our
              collection and book your dream villa today.
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link to="/villas" className="btn btn-accent">
                View All Villas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section with Bootstrap */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">What Our Guests Are Saying</h2>
            <p className="text-muted">
              Real stories from travelers who made memories at our villas
            </p>
          </div>

          <div className="row g-4">
            {reviews.map((review, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm review-card-hover">
                  <div className="card-body p-4">
                    <div className="mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-warning"></i>
                      ))}
                    </div>
                    <p className="card-text mb-4">"{review.text}"</p>
                    <div className="d-flex align-items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${review.name}&background=2c3e50&color=fff&size=60`}
                        alt={review.name}
                        className="rounded-circle me-3"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <div>
                        <h6 className="mb-0 fw-bold">{review.name}</h6>
                        <small className="text-muted">{review.location}</small>
                        <div>
                          <small className="text-muted">{review.date}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Link to="/villas" className="btn btn-primary btn-lg px-5">
              <i className="fas fa-home me-2"></i> Book Your Dream Villa Today
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="standard-amenities-section">
        <div className="container">
          <div className="amenities-layout">
            <div className="amenities-content">
              <h2 className="amenities-title">STANDARD AMENITIES</h2>
              <p className="amenities-description">
                Experience luxury living at its finest in our private villas.
                Our standard amenities include spacious bedrooms, fully-equipped
                kitchens, private pools, and stunning views. Enjoy the
                convenience of concierge service, high-speed Wi-Fi, and daily
                housekeeping.
              </p>

              <div className="amenities-grid">
                {amenities.map((amenity, index) => (
                  <div key={index} className="amenity-box">
                    <div className="amenity-icon-box">
                      <i className={`fas ${amenity.icon}`}></i>
                    </div>
                    <p className="amenity-label">{amenity.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="amenities-image-wrapper">
              <div className="amenities-circular-image">
                <img
                  src="images/mountain sky villa/IMG-20250708-WA0115.jpg"
                  alt="Luxury Villa Interior"
                  className="amenities-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
