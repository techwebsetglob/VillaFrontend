import { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.6))",
          padding: "40px 0",
          textAlign: "center",
        }}>
        <h2 style={{ fontSize: "2rem", color: "#fff", marginBottom: "8px" }}>
          Get In Touch
        </h2>
        <p style={{ color: "#fff", opacity: 0.8 }}>
          Have a question or need help booking? Reach out and we'll get back to
          you as soon as possible.
        </p>
      </section>

      <section className="container" style={{ padding: "60px 20px 120px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 480px",
            gap: "40px",
          }}>
          {/* Contact Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}>
            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "linear-gradient(180deg, rgba(212,126,48,0.06), rgba(141,90,43,0.06))",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "26px",
                }}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h4 style={{ marginBottom: "6px" }}>Address</h4>
              <p style={{ color: "#444", fontSize: "0.95rem" }}>
                Bright Villas Lonavala
                <br />
                Near Main Road, Lonavala
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "linear-gradient(180deg, rgba(212,126,48,0.06), rgba(141,90,43,0.06))",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "26px",
                }}>
                <i className="fas fa-phone-alt"></i>
              </div>
              <h4 style={{ marginBottom: "6px" }}>Call Us</h4>
              <p style={{ color: "#444", fontSize: "0.95rem" }}>
                +91 8169019090
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "linear-gradient(180deg, rgba(212,126,48,0.06), rgba(141,90,43,0.06))",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "26px",
                }}>
                <i className="fas fa-envelope"></i>
              </div>
              <h4 style={{ marginBottom: "6px" }}>Email</h4>
              <p style={{ color: "#444", fontSize: "0.95rem" }}>
                reservations@brightvillas.in
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  background:
                    "linear-gradient(180deg, rgba(212,126,48,0.06), rgba(141,90,43,0.06))",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "26px",
                }}>
                <i className="fas fa-globe"></i>
              </div>
              <h4 style={{ marginBottom: "6px" }}>Website</h4>
              <p style={{ color: "#444", fontSize: "0.95rem" }}>
                www.brightvillaslonavala.com
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "22px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            }}>
            <h3 style={{ marginBottom: "12px", textAlign: "left" }}>
              Send us a message
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              We'll respond within 24 hours
            </p>

            {submitted && (
              <div
                style={{
                  background: "#d4edda",
                  color: "#155724",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}>
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "28px",
                    border: "2px solid rgba(0,0,0,0.06)",
                    outline: "none",
                  }}
                />
              </div>
              <div className="form-row">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "28px",
                    border: "2px solid rgba(0,0,0,0.06)",
                    outline: "none",
                  }}
                />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "28px",
                    border: "2px solid rgba(0,0,0,0.06)",
                    outline: "none",
                  }}
                />
              </div>
              <div className="form-row">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "2px solid rgba(0,0,0,0.06)",
                    outline: "none",
                  }}></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-accent"
                  style={{ borderRadius: "999px", padding: "12px 28px" }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
