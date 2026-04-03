import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PaymentPage from "./pages/PaymentPage";
import BookingSuccess from "./pages/BookingSuccess";
import BookingHistory from "./pages/BookingHistory";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import Destinations from "./pages/Destinations";
import Deals from "./pages/Deals";
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};


function AppInner() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
	  
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/rooms/:hotelId" element={<Rooms />} />

        <Route path="/login"  element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
		<Route path="/destinations" element={<Destinations />} />
		<Route path="/deals" element={<Deals />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={
          <div style={{
            paddingTop:70, minHeight:"100vh",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:16,
            background:"var(--bg)", color:"var(--text)",
          }}>
            <div style={{ fontSize:72 }}>&#127968;</div>
            <h1 style={{ fontFamily:"var(--font-serif)", fontSize:36, fontWeight:400, color:"var(--text)" }}>Page Not Found</h1>
            <p style={{ color:"var(--text2)" }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ padding:"12px 28px", background:"var(--primary)", color:"white", borderRadius:"var(--radius-pill)", fontWeight:700, textDecoration:"none", marginTop:8 }}>Go Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}