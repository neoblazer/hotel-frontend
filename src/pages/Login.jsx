import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from "lucide-react";
import API, { googleLogin, firebasePhoneLogin } from "../services/api";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

let confirmationResultRef = null;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    if (window.google) return;

    const existing = document.getElementById("google-gsi-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const validate = () => {
    const e = {};

    if (!email) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Invalid email format";
    }

    if (!password) {
      e.password = "Password is required";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const payload = res.data?.data || res.data;

      login(payload);
      toast.success("Welcome back! 🎉");
      navigate(payload.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 400 || status === 401) {
        toast.error(msg || "Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!window.google?.accounts?.id) {
      toast.error("Google Sign-In is not ready yet");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setLoading(true);
          const payload = await googleLogin(response.credential);
          login(payload);
          toast.success("Signed in with Google");
          navigate(payload.role === "ADMIN" ? "/admin" : "/");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Google sign-in failed");
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Enter your phone number");
      return;
    }

    try {
      setPhoneLoading(true);
      const appVerifier = setupRecaptcha();
      confirmationResultRef = await signInWithPhoneNumber(auth, phone.trim(), appVerifier);
      setOtpSent(true);
      toast.success("OTP sent");
    } catch (err) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }

    if (!confirmationResultRef) {
      toast.error("OTP session expired. Please request OTP again.");
      return;
    }

    try {
      setPhoneLoading(true);

      await confirmationResultRef.confirm(otp.trim());

      const payload = await firebasePhoneLogin(phone.trim());
      login(payload);

      toast.success("Signed in with phone");
      navigate(payload.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "OTP verification failed");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: window.innerWidth <= 900 ? "1fr" : "1fr 1fr",
      }}
    >
      {/* Left visual */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: window.innerWidth <= 900 ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(14,165,233,0.35) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, color: "white", maxWidth: 420, padding: 60 }}>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 900,
              color: "white",
              display: "block",
              marginBottom: 44,
              textDecoration: "none",
            }}
          >
            SmartStay <span style={{ color: "var(--primary)" }}>Vizag</span>
          </Link>

          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Your next
            <br />
            stay
            <br />
            awaits.
          </h2>

          <p style={{ fontSize: 16, opacity: 0.82, lineHeight: 1.7, marginBottom: 40 }}>
            Sign in to manage bookings, save favourites, and enjoy a smooth hotel booking
            experience with SmartStay Vizag.
          </p>

          {[
            ["🏨", "Premium hotels and comfortable stays"],
            ["⭐", "Trusted guest experiences"],
            ["🔒", "Secure booking and payment flow"],
          ].map(([icon, text]) => (
            <div
              key={text}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.95 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
          background: "var(--surface)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 34,
              fontWeight: 700,
              marginBottom: 8,
              color: "var(--text)",
            }}
          >
            Welcome back
          </h1>

          <p style={{ color: "var(--text2)", marginBottom: 36, fontSize: 15 }}>
            Sign in to access your bookings and favourites
          </p>

          {!phoneMode ? (
            <>
              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="you@example.com"
                    className={`form-control has-icon-l ${errors.email ? "error" : ""}`}
                  />
                </div>
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>

              {/* Password */}
              <div className="form-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <label className="form-label" style={{ margin: 0 }}>
                    Password
                  </label>
                  <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>
                    Secure login
                  </span>
                </div>

                <div className="input-wrap">
                  <span className="input-icon-l">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className={`form-control has-icon-l ${errors.password ? "error" : ""}`}
                    style={{ paddingRight: 42 }}
                  />
                  <span className="input-icon-r" onClick={() => setShowPw((p) => !p)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 8 }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,.4)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    {" "}Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <Smartphone size={16} />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91XXXXXXXXXX"
                    className="form-control has-icon-l"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="form-group">
                  <label className="form-label">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="form-control"
                    maxLength={6}
                  />
                </div>
              )}

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={phoneLoading}
                  className="btn btn-primary btn-block btn-lg"
                >
                  {phoneLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  disabled={phoneLoading}
                  className="btn btn-primary btn-block btn-lg"
                >
                  {phoneLoading ? "Verifying..." : "Verify OTP"}
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline btn-block"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setPhoneMode(false);
                  setOtp("");
                  setOtpSent(false);
                  setPhone("");
                }}
              >
                Back to Email Login
              </button>

              <div id="recaptcha-container"></div>
            </>
          )}

          <div className="divider-text" style={{ margin: "20px 0" }}>
            or continue with
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <span style={{ fontSize: 18 }}>🇬</span> Google
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPhoneMode(true)}
              disabled={phoneLoading}
            >
              <span style={{ fontSize: 18 }}>📱</span> Phone
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)", marginTop: 28 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}