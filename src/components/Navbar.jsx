import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Heart, LogOut, LayoutDashboard, BookOpen, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  const isHome = location.pathname === "/" || location.pathname === "/hotels";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate("/"); };

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
    background: transparent ? "transparent" : "rgba(255,255,255,0.97)",
    backdropFilter: transparent ? "none" : "blur(14px)",
    borderBottom: transparent ? "none" : "1px solid rgba(0,0,0,0.07)",
    boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "none",
    transition: "all .3s cubic-bezier(.4,0,.2,1)",
  };

  const linkColor = transparent ? "rgba(255,255,255,0.88)" : "#374151";
  const logoColor = transparent ? "#fff" : "#FF385C";

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:70 }}>

        {/* Logo */}
        <Link to="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:logoColor, letterSpacing:-0.5, textDecoration:"none", transition:"color .3s" }}>
          Stay<span style={{ color: transparent ? "rgba(255,255,255,0.7)" : "#111827" }}>Lux</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }} className="desktop-nav">
          {[{label:"Hotels", to:"/hotels"},{label:"Destinations", to:"/hotels"},{label:"Deals", to:"/hotels"}].map(n => (
            <Link key={n.to+n.label} to={n.to} style={{
              padding:"8px 14px", borderRadius:8, fontSize:14, fontWeight:600,
              color: location.pathname === n.to ? "#FF385C" : linkColor,
              transition:"all .2s", textDecoration:"none"
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >{n.label}</Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isLoggedIn && (
            <Link to="/wishlist" style={{ display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38, borderRadius:"50%", background: transparent ? "rgba(255,255,255,0.15)" : "#F3F4F6", color: transparent ? "white" : "#374151", transition:"all .2s" }}>
              <Heart size={17} />
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{ padding:"9px 18px", borderRadius:99, fontSize:14, fontWeight:600, color: transparent ? "white" : "#374151", border: transparent ? "1.5px solid rgba(255,255,255,0.4)" : "1.5px solid #E5E7EB", background:"transparent", transition:"all .2s" }}>Login</Link>
              <Link to="/signup" style={{ padding:"9px 18px", borderRadius:99, fontSize:14, fontWeight:700, color:"white", background:"#FF385C", boxShadow:"0 4px 14px rgba(255,56,92,0.35)", transition:"all .2s" }}>Sign Up</Link>
            </>
          ) : (
            <div ref={dropRef} style={{ position:"relative" }}>
              <button onClick={() => setDropOpen(d => !d)} style={{
                display:"flex", alignItems:"center", gap:9, padding:"6px 12px 6px 6px",
                border: transparent ? "1.5px solid rgba(255,255,255,0.35)" : "1.5px solid #E5E7EB",
                borderRadius:99, background: transparent ? "rgba(255,255,255,0.1)" : "white",
                cursor:"pointer", transition:"all .2s",
              }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#FF385C,#FF6B8A)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13 }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize:14, fontWeight:600, color: transparent ? "white" : "#111827", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name?.split(" ")[0] || "User"}</span>
                <ChevronDown size={14} style={{ color: transparent ? "rgba(255,255,255,0.7)" : "#9CA3AF", transform: dropOpen ? "rotate(180deg)" : "none", transition:"transform .2s" }} />
              </button>

              {dropOpen && (
                <div className="dropdown-menu" style={{ right:0 }}>
                  <div style={{ padding:"12px 16px", borderBottom:"1px solid #E5E7EB" }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>{user?.name}</div>
                    <div style={{ fontSize:12, color:"#9CA3AF" }}>{user?.email}</div>
                  </div>
                  {isAdmin && <div className="dropdown-item" onClick={() => { navigate("/admin"); setDropOpen(false); }}><LayoutDashboard size={15}/> Admin Dashboard</div>}
                  <div className="dropdown-item" onClick={() => { navigate("/history"); setDropOpen(false); }}><BookOpen size={15}/> My Bookings</div>
                  <div className="dropdown-item" onClick={() => { navigate("/wishlist"); setDropOpen(false); }}><Heart size={15}/> Wishlist</div>
                  <div className="dropdown-divider"/>
                  <div className="dropdown-item danger" onClick={handleLogout}><LogOut size={15}/> Sign Out</div>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} style={{ display:"none", padding:8, borderRadius:8, color: transparent ? "white" : "#374151" }} className="mobile-menu-btn">
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ background:"white", borderTop:"1px solid #E5E7EB", padding:20, display:"flex", flexDirection:"column", gap:4 }}>
          {[{label:"Hotels", to:"/hotels"},{label:"Wishlist", to:"/wishlist"},{label:"My Bookings", to:"/history"}].map(n => (
            <Link key={n.to} to={n.to} style={{ padding:"12px 16px", borderRadius:10, fontSize:15, fontWeight:600, color:"#374151", display:"block" }}>{n.label}</Link>
          ))}
          {isAdmin && <Link to="/admin" style={{ padding:"12px 16px", borderRadius:10, fontSize:15, fontWeight:600, color:"#374151" }}>Admin Panel</Link>}
          {!isLoggedIn ? (
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <Link to="/login" className="btn btn-outline btn-block">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-block">Sign Up</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn btn-outline btn-block" style={{ marginTop:12, color:"#EF4444", borderColor:"#EF4444" }}>Sign Out</button>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px) {
          .desktop-nav { display:none!important; }
          .mobile-menu-btn { display:flex!important; }
        }
      `}</style>
    </nav>
  );
}