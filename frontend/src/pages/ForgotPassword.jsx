import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(result.message);
      // In production, the token would be sent via email
      // For demo purposes, we'll use a simulated flow
      setOtpSent(true);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // Use the OTP as the reset token
    const result = await resetPassword(otp, newPassword);

    if (result.success) {
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        paddingTop: "80px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
      }}>
      <div
        className="card border-0 shadow"
        style={{
          position: "relative",
          maxWidth: "450px",
          width: "100%",
          borderRadius: "12px",
        }}>
        <div className="card-body p-4">
          <Link
            to="/login"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
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
              marginBottom: "10px",
              fontSize: "1.8rem",
              fontWeight: "600",
            }}>
            {otpSent ? "Reset Password" : "Forgot Password"}
          </h3>

          <p className="text-center text-muted mb-4">
            {otpSent
              ? "Enter the reset code sent to your email and your new password"
              : "Enter your email address and we'll send you a reset code"}
          </p>

          {error && (
            <div
              className="alert alert-danger"
              role="alert"
              style={{ textAlign: "center" }}>
              {error}
            </div>
          )}

          {success && (
            <div
              className="alert alert-success"
              role="alert"
              style={{ textAlign: "center" }}>
              {success}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                className="btn btn-accent w-100"
                disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <div className="mb-3">
                <label className="form-label">Reset Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="form-control"
                  placeholder="Enter reset code"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control"
                  placeholder="Confirm password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-accent w-100"
                disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "#2c3e50", fontWeight: "600" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
