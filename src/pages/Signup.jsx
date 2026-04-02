import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from "lucide-react";
import API, { googleLogin, firebasePhoneLogin } from "../services/api";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

let confirmationResultRef = null;

const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  return Math.min(s, 4);
};

const StrengthBar = ({ pw }) => {
  const s = pwStrength(pw);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  if (!pw) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: i <= s ? colors[s] : "var(--border)",
              transition: "all .3s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: colors[s], fontWeight: 600 }}>
        Password strength: {labels[s]}
      </span>
    </div>
  );
};

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneName, setPhoneName] = useState("");
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

  const setField = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Invalid email format";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await API.post("/auth/register", form);

      const res = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const payload = res.data?.data || res.data;
      login(payload);
      toast.success("Account created successfully 🎉");
      navigate(payload.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
          toast.success("Signed up with Google");
          navigate(payload.role === "ADMIN" ? "/admin" : "/");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Google signup failed");
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "signup-recaptcha-container", {
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

      const payload = await firebasePhoneLogin(phone.trim(), phoneName.trim());
      login(payload);

      toast.success("Account created with phone 🎉");
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
              "url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(20,184,166,0.32) 100%)",
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
            Start your
            <br />
            travel
            <br />
            story here.
          </h2>

          <p style={{ fontSize: 16, opacity: 0.82, lineHeight: 1.7, marginBottom: 40 }}>
            Create your SmartStay account to save favourites, manage trips, and enjoy
            faster booking every time.
          </p>

          {[
            ["❤️", "Save hotels you love"],
            ["⚡", "Faster future bookings"],
            ["📱", "Phone or Google sign-up"],
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
        <div style={{ width: "100%", maxWidth: 430 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 34,
              fontWeight: 700,
              marginBottom: 8,
              color: "var(--text)",
            }}
          >
            Create your account
          </h1>

          <p style={{ color: "var(--text2)", marginBottom: 30, fontSize: 15 }}>
            Join SmartStay Vizag and start booking smarter
          </p>

          {!phoneMode ? (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <User size={16} />
                  </span>
                  <input
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Your name"
                    className={`form-control has-icon-l ${errors.name ? "error" : ""}`}
                  />
                </div>
                {errors.name && <div className="form-error">⚠ {errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="you@example.com"
                    className={`form-control has-icon-l ${errors.email ? "error" : ""}`}
                  />
                </div>
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={setField("password")}
                    placeholder="Create password"
                    className={`form-control has-icon-l ${errors.password ? "error" : ""}`}
                    style={{ paddingRight: 42 }}
                  />
                  <span className="input-icon-r" onClick={() => setShowPw((s) => !s)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                <StrengthBar pw={form.password} />
              </div>

              <button
                onClick={handleSignup}
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
                    {" "}Creating account...
                  </>
                ) : (
                  <>
                    Sign Up <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon-l">
                    <User size={16} />
                  </span>
                  <input
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Your name"
                    className="form-control has-icon-l"
                  />
                </div>
              </div>

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
                  setPhone("");
                  setOtp("");
                  setOtpSent(false);
                  setPhoneName("");
                }}
              >
                Back to Email Signup
              </button>

              <div id="signup-recaptcha-container"></div>
            </>
          )}

          <div className="divider-text" style={{ margin: "20px 0" }}>
            or continue with
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleSignup}
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
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}