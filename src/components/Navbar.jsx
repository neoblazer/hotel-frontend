import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Dark mode helper
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}

export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useDarkMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName =
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "User");

  const displayEmail = user?.email || "Signed in user";

  const initials = displayName?.[0]?.toUpperCase() || "U";

  const navBg = transparent ? "transparent" : "var(--surface)";
  const navBorder = transparent ? "none" : "1px solid var(--border)";
  const linkColor = transparent ? "rgba(255,255,255,0.92)" : "var(--text)";
  const logoColor = transparent ? "#ffffff" : "var(--primary)";
  const navStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: navBg,
    backdropFilter: transparent ? "none" : "blur(16px)",
    WebkitBackdropFilter: transparent ? "none" : "blur(16px)",
    borderBottom: navBorder,
    boxShadow: scrolled ? "var(--shadow-sm)" : "none",
    transition: "all .3s var(--ease)",
  };

  const desktopLinks = [
    { label: "Hotels", to: "/hotels" },
    { label: "Destinations", to: "/destinations" },
    { label: "Deals", to: "/deals" },
  ];

  const mobileLinks = [
    { label: "Hotels", to: "/hotels" },
    { label: "Destinations", to: "/destinations" },
    { label: "Deals", to: "/deals" },
    ...(isLoggedIn ? [{ label: "Wishlist", to: "/wishlist" }] : []),
    ...(isLoggedIn ? [{ label: "My Bookings", to: "/history" }] : []),
  ];

  return (
    <nav style={navStyle}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 400,
            color: logoColor,
            letterSpacing: -0.3,
            textDecoration: "none",
            transition: "color .3s",
          }}
        >
          SmartStay{" "}
          <span
            style={{
              color: transparent ? "rgba(255,255,255,0.75)" : "var(--text)",
            }}
          >
            Vizag
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 4 }}
          className="desktop-nav"
        >
          {desktopLinks.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 600,
                color: location.pathname === n.to ? "var(--primary)" : linkColor,
                transition: "all .2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = transparent
                  ? "rgba(255,255,255,0.12)"
                  : "var(--surface2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: transparent ? "rgba(255,255,255,0.15)" : "var(--surface3)",
              color: transparent ? "white" : "var(--text2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s",
            }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Wishlist */}
          {isLoggedIn && (
            <Link
              to="/wishlist"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: transparent ? "rgba(255,255,255,0.15)" : "var(--surface3)",
                color: transparent ? "white" : "var(--text2)",
                transition: "all .2s",
                textDecoration: "none",
              }}
              title="Wishlist"
            >
              <Heart size={17} />
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                style={{
                  padding: "9px 18px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: transparent ? "white" : "var(--text)",
                  border: transparent
                    ? "1.5px solid rgba(255,255,255,0.4)"
                    : "1.5px solid var(--border2)",
                  background: "transparent",
                  transition: "all .2s",
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: "9px 18px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  background: "var(--primary)",
                  boxShadow: "0 4px 14px var(--primary-glow)",
                  transition: "all .2s",
                  textDecoration: "none",
                }}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen((d) => !d)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "6px 12px 6px 6px",
                  border: transparent
                    ? "1.5px solid rgba(255,255,255,0.35)"
                    : "1.5px solid var(--border)",
                  borderRadius: "var(--radius-pill)",
                  background: transparent ? "rgba(255,255,255,0.1)" : "var(--surface)",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary), var(--accent))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {initials}
                </div>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: transparent ? "white" : "var(--text)",
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName.split(" ")[0]}
                </span>

                <ChevronDown
                  size={14}
                  style={{
                    color: transparent ? "rgba(255,255,255,0.7)" : "var(--text3)",
                    transform: dropOpen ? "rotate(180deg)" : "none",
                    transition: "transform .2s",
                  }}
                />
              </button>

              {dropOpen && (
                <div className="dropdown-menu">
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {displayName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      {displayEmail}
                    </div>
                  </div>

                  {isAdmin && (
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/admin");
                        setDropOpen(false);
                      }}
                    >
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </div>
                  )}

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/history");
                      setDropOpen(false);
                    }}
                  >
                    <BookOpen size={15} /> My Bookings
                  </div>

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/wishlist");
                      setDropOpen(false);
                    }}
                  >
                    <Heart size={15} /> Wishlist
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              display: "none",
              padding: 8,
              borderRadius: "var(--radius-sm)",
              color: transparent ? "white" : "var(--text2)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {mobileLinks.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text)",
                display: "block",
                textDecoration: "none",
              }}
            >
              {n.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Admin Panel
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
            <span style={{ fontSize: 14, color: "var(--text2)" }}>
              {dark ? "Dark" : "Light"} Mode
            </span>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                marginLeft: "auto",
                padding: "6px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid var(--border)",
                background: "var(--surface2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
              }}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />} Toggle
            </button>
          </div>

          {!isLoggedIn ? (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Link to="/login" className="btn btn-outline btn-block">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-block">
                Sign Up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-block"
              style={{ marginTop: 12, color: "var(--danger)", borderColor: "var(--danger)" }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}