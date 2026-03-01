import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    login,
    googleLogin,
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
  } = useAuth();

  // Login form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // OTP verification modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpMethod, setOtpMethod] = useState(""); // 'email' or 'phone'
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Phone login specific
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [nameForOTP, setNameForOTP] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Traditional password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Send OTP for OTP-based login
  const handleSendOTP = async (method) => {
    if (method === "email" && !formData.email) {
      setError("Please enter your email address");
      return;
    }
    if (method === "phone" && !phoneNumber) {
      setError("Please enter your phone number");
      return;
    }

    setError("");
    setLoading(true);
    setOtpMethod(method);

    let result;
    if (method === "email") {
      result = await sendEmailOTP(formData.email);
    } else {
      result = await sendPhoneOTP(phoneNumber, countryCode);
    }

    if (result.success) {
      setOtpSent(true);
      setShowOTPModal(true);
      setSuccessMessage(`OTP sent! (Dev: ${result.otp})`);
      setTimeout(() => setSuccessMessage(""), 10000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Verify OTP and login
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
      result = await verifyEmailOTP(formData.email, otp, nameForOTP);
    } else {
      result = await verifyPhoneOTP(phoneNumber, countryCode, otp, nameForOTP);
    }

    if (result.success) {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
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
        const redirect = searchParams.get("redirect") || "/";
        navigate(redirect);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError("Google login was unsuccessful. Please try again.");
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
              Welcome Back
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

            {/* Google Sign In */}
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>

            <div className="d-flex align-items-center mb-3">
              <div
                style={{ flex: 1, height: "1px", background: "#dee2e6" }}></div>
              <span className="px-3 text-muted">or</span>
              <div
                style={{ flex: 1, height: "1px", background: "#dee2e6" }}></div>
            </div>

            {/* Login Form with OTP option */}
            <form onSubmit={handlePasswordLogin}>
              {/* Email with OTP option */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="you@example.com"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSendOTP("email")}
                    disabled={loading || !formData.email}>
                    <i className="fas fa-paper-plane"></i> OTP
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Password"
                />
              </div>

              <div className="mb-3 text-end">
                <Link
                  to="/forgot-password"
                  className="text-decoration-none small">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                disabled={loading}
                style={{ width: "100%" }}>
                {loading ? "Logging in..." : "Login with Password"}
              </button>
            </form>

            {/* Phone OTP Login */}
            <div
              className="mt-4 pt-3"
              style={{ borderTop: "1px solid #dee2e6" }}>
              <p className="text-muted text-center mb-3">
                Or login with Phone OTP
              </p>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <div className="input-group">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-control"
                    placeholder="9876543210"
                  />
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => handleSendOTP("phone")}
                    disabled={loading || !phoneNumber}>
                    <i className="fas fa-paper-plane"></i> Send OTP
                  </button>
                </div>
              </div>
            </div>

            <p
              style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "#2c3e50", fontWeight: "600" }}>
                Sign Up
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
                    {loading ? "Verifying..." : "Verify & Login"}
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

export default Login;
