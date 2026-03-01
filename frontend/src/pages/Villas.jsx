import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const Villas = ({ villas: initialVillas, setVillas }) => {
  const [villas, setLocalVillas] = useState(initialVillas || []);
  const [loading, setLoading] = useState(!initialVillas?.length);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    location: "",
    guests: "",
    bedrooms: "",
  });

  useEffect(() => {
    if (initialVillas?.length) {
      setLocalVillas(initialVillas);
    } else {
      fetchVillas();
    }
  }, [initialVillas]);

  // Read URL parameters from Home page search and apply filters
  useEffect(() => {
    const locationParam = searchParams.get("location");
    const guestsParam = searchParams.get("guests");

    if (locationParam || guestsParam) {
      const newFilters = { ...filters };
      if (locationParam) newFilters.location = locationParam;
      if (guestsParam) newFilters.guests = guestsParam;
      setFilters(newFilters);

      // Apply filters immediately
      applyFiltersFromParams(locationParam, guestsParam);
    }
  }, [searchParams]);

  const fetchVillas = async () => {
    try {
      const response = await axios.get("/api/villas");
      setLocalVillas(response.data.villas);
    } catch (error) {
      console.error("Error fetching villas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.guests) params.append("guests", filters.guests);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);

      const response = await axios.get(`/api/villas?${params.toString()}`);
      setLocalVillas(response.data.villas);
    } catch (error) {
      console.error("Error filtering villas:", error);
    }
  };

  const applyFiltersFromParams = async (location, guests) => {
    try {
      const params = new URLSearchParams();
      if (location) params.append("location", location);
      if (guests) params.append("guests", guests);

      const response = await axios.get(`/api/villas?${params.toString()}`);
      setLocalVillas(response.data.villas);
    } catch (error) {
      console.error("Error filtering villas:", error);
    }
  };

  return (
    <section className="villa-grid-section">
      <div className="container">
        <div style={{ padding: "30px 0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Our Luxury Villas
          </h2>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "30px",
            }}>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "1px solid #e5e5e5",
                minWidth: "180px",
              }}>
              <option value="">All Locations</option>
              <option value="Lonavala">Lonavala</option>
              <option value="Hills">Hills</option>
              <option value="Valley">Valley</option>
            </select>

            <select
              name="guests"
              value={filters.guests}
              onChange={handleFilterChange}
              style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "1px solid #e5e5e5",
                minWidth: "180px",
              }}>
              <option value="">Guests</option>
              <option value="2">2 Guests</option>
              <option value="4">4 Guests</option>
              <option value="6">6 Guests</option>
              <option value="10">10+ Guests</option>
            </select>

            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "1px solid #e5e5e5",
                minWidth: "180px",
              }}>
              <option value="">Bedrooms</option>
              <option value="2">2+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="6">6+ Bedrooms</option>
            </select>

            <button onClick={applyFilters} className="btn btn-accent">
              <i className="fas fa-search"></i> Search
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading villas...</p>
          </div>
        ) : (
          <div className="villa-grid">
            {villas.map((villa) => (
              <div key={villa._id} className="villa-grid-card">
                {villa.badges?.[0] && (
                  <div className="villa-badge">{villa.badges[0]}</div>
                )}
                <div className="villa-grid-image">
                  <img
                    src={
                      villa.images?.[0]?.url || "https://placehold.co/400x300"
                    }
                    alt={villa.title}
                  />
                </div>
                <div className="villa-grid-content">
                  <div className="villa-grid-header">
                    <h3 className="villa-grid-title">{villa.title}</h3>
                    <p className="villa-grid-location">
                      <i className="fas fa-map-marker-alt"></i> {villa.location}
                    </p>
                  </div>

                  <div className="villa-grid-stats">
                    <div className="villa-stat">
                      <i className="fas fa-users"></i>
                      <span>{villa.capacity} Guests</span>
                    </div>
                    <div className="villa-stat">
                      <i className="fas fa-bed"></i>
                      <span>{villa.bedrooms} Beds</span>
                    </div>
                    <div className="villa-stat">
                      <i className="fas fa-bath"></i>
                      <span>{villa.baths} Bath</span>
                    </div>
                  </div>

                  <div className="villa-grid-price">
                    <span className="villa-old-price">{villa.oldPrice}</span>
                    <span className="villa-current-price">{villa.price}/-</span>
                    <span className="villa-price-label">Per Night Onwards</span>
                  </div>

                  <div className="villa-grid-actions">
                    <Link
                      to={`/villa/${villa.slug}`}
                      className="villa-action-btn primary">
                      View Details
                    </Link>
                    <Link
                      to={`/booking/${villa._id}`}
                      className="villa-action-btn">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {villas.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3>No villas found</h3>
            <p>Try adjusting your filters to find more villas.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Villas;
