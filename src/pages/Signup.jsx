import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 6)           s++;
  if (pw.length >= 10)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  return Math.min(s, 4);
};

const StrengthBar = ({ pw }) => {
  const s = pwStrength(pw);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  if (!pw) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:4, marginBottom:4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:99, background: i<=s ? colors[s] : "#E5E7EB", transition:"all .3s" }}/>
        ))}
      </div>
      <span style={{ fontSize:12, color:colors[s], fontWeight:600 }}>Password strength: {labels[s]}</span>
    </div>
  );
};

export default function Signup() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm]       = useState({ name:"", email:"", password:"" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [agreed, setAgreed]   = useState(false);

  const setField = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters required";
    if (!agreed) e.terms = "You must accept the terms";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // POST /auth/register → ApiResponse<UserResponseDTO>
      await API.post("/auth/register", {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      });
      toast.success("Account created! Please sign in 🎉");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email;
      toast.error(msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}>
      {/* Left visual */}
      <div style={{ position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(https://images.unsplash.com/photo-1551882547-ff40c4a49f67?w=800&q=80)", backgroundSize:"cover", backgroundPosition:"center" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(0,166,153,0.3) 100%)" }}/>
        <div style={{ position:"relative", zIndex:1, color:"white", maxWidth:400, padding:60 }}>
          <Link to="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:"#FF385C", display:"block", marginBottom:44 }}>Stay<span style={{ color:"white" }}>Lux</span></Link>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:900, lineHeight:1.15, marginBottom:20 }}>Start your<br/>journey with<br/>us today.</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:36 }}>
            {["Free account — no credit card required","Access 10,000+ verified hotels","Exclusive member deals & early offers","24/7 dedicated customer support"].map(t => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(16,185,129,0.2)", border:"1.5px solid #10B981", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Check size={12} color="#10B981"/>
                </div>
                <span style={{ fontSize:14, opacity:0.9 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 40px", background:"white", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, marginBottom:8 }}>Create your account</h1>
          <p style={{ color:"#6B7280", marginBottom:32, fontSize:15 }}>Free forever. No credit card needed.</p>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <span className="input-icon-l"><User size={16}/></span>
              <input type="text" value={form.name} onChange={setField("name")} placeholder="Arjun Mehta"
                className={`form-control has-icon-l ${errors.name ? "error" : ""}`}/>
            </div>
            {errors.name && <div className="form-error">⚠ {errors.name}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon-l"><Mail size={16}/></span>
              <input type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com"
                className={`form-control has-icon-l ${errors.email ? "error" : ""}`}/>
            </div>
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon-l"><Lock size={16}/></span>
              <input type={showPw ? "text" : "password"} value={form.password}
                onChange={setField("password")} placeholder="Min. 6 characters"
                className={`form-control has-icon-l ${errors.password ? "error" : ""}`}
                style={{ paddingRight:42 }}/>
              <span className="input-icon-r" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </span>
            </div>
            <StrengthBar pw={form.password}/>
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          {/* Terms */}
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:errors.terms?8:24, cursor:"pointer" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop:3, accentColor:"#FF385C", width:16, height:16, flexShrink:0 }}/>
            <span style={{ fontSize:13, color:"#6B7280", lineHeight:1.6 }}>
              I agree to the <a href="#" style={{ color:"#FF385C", fontWeight:600 }}>Terms of Service</a> and <a href="#" style={{ color:"#FF385C", fontWeight:600 }}>Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <div className="form-error" style={{ marginBottom:16 }}>⚠ {errors.terms}</div>}

          <button onClick={handleSignup} disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading
              ? <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.4)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/> Creating account...</>
              : <>Create Account <ArrowRight size={18}/></>}
          </button>

          <p style={{ textAlign:"center", fontSize:14, color:"#6B7280", marginTop:24 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#FF385C", fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}div[style*="backgroundImage"]{display:none!important}}`}</style>
    </div>
  );
}