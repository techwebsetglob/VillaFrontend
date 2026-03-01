import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "1088929392230-04sd1iq2vo958ed2h4k8hq4225e2nlik.apps.googleusercontent.com";

// Country codes list
const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
];

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    googleLogin,
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
  } = useAuth();

  // Registration form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    password: "",
    confirmPassword: "",
  });

  // OTP verification modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpMethod, setOtpMethod] = useState(""); // 'email' or 'phone'
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (code) => {
    setFormData((prev) => ({ ...prev, countryCode: code }));
  };

  // Send OTP before registration
  const handleSendOTP = async (method) => {
    if (method === "email" && !formData.email) {
      setError("Please enter your email address");
      return;
    }
    if (method === "phone" && !formData.phone) {
      setError("Please enter your phone number");
      return;
    }
    if (!formData.name) {
      setError("Please enter your name");
      return;
    }

    setError("");
    setLoading(true);
    setOtpMethod(method);

    let result;
    if (method === "email") {
      result = await sendEmailOTP(formData.email);
    } else {
      result = await sendPhoneOTP(formData.phone, formData.countryCode);
    }

    if (result.success) {
      setOtpSent(true);
      setShowOTPModal(true);
      setSuccessMessage(`OTP sent to your ${method}! (Dev: ${result.otp})`);
      setTimeout(() => setSuccessMessage(""), 10000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Verify OTP and complete registration
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    setError("");
    setLoading(true);

    let result;
    if (otpMethod === "email") {
      result = await verifyEmailOTP(formData.email, otp, formData.name);
    } else {
      result = await verifyPhoneOTP(
        formData.phone,
        formData.countryCode,
        otp,
        formData.name,
      );
    }

    if (result.success) {
      // Update user profile with additional info
      navigate("/");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Traditional registration with password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
    );

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = JSON.parse(
        atob(credentialResponse.credential.split(".")[1]),
      );
      const result = await googleLogin(
        decoded.sub,
        decoded.email,
        decoded.name,
        decoded.picture,
      );

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Google signup failed. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError("Google signup was unsuccessful. Please try again.");
  };

  const closeOTPModal = () => {
    setShowOTPModal(false);
    setOtp("");
    setOtpSent(false);
    setOtpMethod("");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        style={{
          paddingTop: "80px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          padding: "20px",
        }}>
        <div
          className="card border-0 shadow"
          style={{ maxWidth: "500px", width: "100%", borderRadius: "12px" }}>
          <div className="card-body p-4">
            <Link
              to="/"
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "24px",
                cursor: "pointer",
                textDecoration: "none",
                color: "#666",
              }}>
              &times;
            </Link>

            <h3
              style={{
                textAlign: "center",
                marginBottom: "25px",
                fontSize: "1.8rem",
                fontWeight: "600",
              }}>
              Create Account
            </h3>

            {error && (
              <div
                className="alert alert-danger"
                role="alert"
                style={{ textAlign: "center" }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div
                className="alert alert-success"
                role="alert"
                style={{ textAlign: "center" }}>
                {successMessage}
              </div>
            )}

            {/* Google Sign Up */}
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
              />
            </div>

            <div className="d-flex align-items-center mb-3">
              <div
                style={{ flex: 1, height: "1px", background: "#dee2e6" }}></div>
              <span className="px-3 text-muted">or</span>
              <div
                style={{ flex: 1, height: "1px", background: "#dee2e6" }}></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Your full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email *</label>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="you@example.com"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSendOTP("email")}
                    disabled={loading || !formData.email || !formData.name}>
                    <i className="fas fa-paper-plane"></i> Verify
                  </button>
                </div>
                <small className="text-muted">
                  Click Verify to send OTP to your email
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <div className="input-group">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="form-select"
                    style={{ maxWidth: "90px" }}>
                    {countryCodes.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="9876543210"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSendOTP("phone")}
                    disabled={loading || !formData.phone || !formData.name}>
                    <i className="fas fa-paper-plane"></i> Verify
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading}
                style={{ width: "100%" }}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p
              style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#2c3e50", fontWeight: "600" }}>
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* OTP Verification Modal */}
        {showOTPModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}>
            <div
              className="card"
              style={{ maxWidth: "400px", width: "90%", borderRadius: "12px" }}>
              <div className="card-body p-4">
                <button
                  type="button"
                  className="btn-close"
                  style={{ position: "absolute", top: "15px", right: "15px" }}
                  onClick={closeOTPModal}></button>

                <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
                  <i className="fas fa-shield-alt text-warning me-2"></i>
                  Verify Your {otpMethod === "email" ? "Email" : "Phone"}
                </h4>

                <p className="text-muted text-center mb-4">
                  Enter the 6-digit code sent to your{" "}
                  {otpMethod === "email" ? "email" : "phone"}
                </p>

                <form onSubmit={handleVerifyOTP}>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="form-control text-center fs-4"
                      placeholder="------"
                      maxLength={6}
                      style={{ letterSpacing: "8px" }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent w-100"
                    disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => handleSendOTP(otpMethod)}
                    disabled={loading}>
                    Resend Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
