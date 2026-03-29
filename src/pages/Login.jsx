import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // POST /auth/login → ApiResponse<LoginResponse>
      // LoginResponse = { token, role, user }
      const res = await API.post("/auth/login", { email, password });
      // res.data = ApiResponse wrapper = { success, message, data: { token, role, user } }
      const payload = res.data?.data || res.data;
      login(payload);
      toast.success("Welcome back! 🎉");
      navigate(payload.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 400 || status === 401) {
        toast.error(msg || "Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}>
      {/* Left visual */}
      <div style={{ position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80)", backgroundSize:"cover", backgroundPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(255,56,92,0.35) 100%)" }}/>
        <div style={{ position:"relative", zIndex:1, color:"white", maxWidth:420, padding:60 }}>
          <Link to="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"#FF385C", display:"block", marginBottom:44 }}>Stay<span style={{ color:"white" }}>Lux</span></Link>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900, lineHeight:1.15, marginBottom:20 }}>Your next<br/>adventure<br/>awaits.</h2>
          <p style={{ fontSize:16, opacity:0.75, lineHeight:1.7, marginBottom:40 }}>Join thousands of travellers discovering exceptional stays every day.</p>
          {[["🏨","10,000+ Hotels Across India"],["⭐","4.9 Average Guest Rating"],["🔒","Secure Payments & Booking"]].map(([i,t]) => (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <span style={{ fontSize:20 }}>{i}</span>
              <span style={{ fontSize:15, fontWeight:500, opacity:0.9 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 40px", background:"white", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, marginBottom:8 }}>Welcome back</h1>
          <p style={{ color:"#6B7280", marginBottom:36, fontSize:15 }}>Sign in to access your bookings and favourites</p>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon-l"><Mail size={16}/></span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="you@example.com"
                className={`form-control has-icon-l ${errors.email ? "error" : ""}`}/>
            </div>
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <label className="form-label" style={{ margin:0 }}>Password</label>
              <a href="#" style={{ fontSize:13, color:"#FF385C", fontWeight:600 }}>Forgot password?</a>
            </div>
            <div className="input-wrap">
              <span className="input-icon-l"><Lock size={16}/></span>
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className={`form-control has-icon-l ${errors.password ? "error" : ""}`}
                style={{ paddingRight:42 }}/>
              <span className="input-icon-r" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </span>
            </div>
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          <button onClick={handleLogin} disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop:8 }}>
            {loading
              ? <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.4)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/> Signing in...</>
              : <>Sign In <ArrowRight size={18}/></>}
          </button>

          {/* Demo credentials hint */}
          <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"12px 16px", marginTop:16, fontSize:13 }}>
            <strong style={{ color:"#059669" }}>Demo Admin:</strong> <span style={{ color:"#374151" }}>admin@staylux.com / admin123</span>
          </div>

          <div className="divider-text" style={{ margin:"20px 0" }}>or continue with</div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["🇬","Google"],["📱","Phone"]].map(([i,l]) => (
              <button key={l} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"12px", border:"1.5px solid #E5E7EB", borderRadius:10, background:"white", fontSize:14, fontWeight:600, cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background="white"}>
                <span style={{ fontSize:18 }}>{i}</span> {l}
              </button>
            ))}
          </div>

          <p style={{ textAlign:"center", fontSize:14, color:"#6B7280", marginTop:28 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color:"#FF385C", fontWeight:700 }}>Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}div[style*="backgroundImage"]{display:none!important}}`}</style>
    </div>
  );
}