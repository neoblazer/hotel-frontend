import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Download, Home, Calendar } from "lucide-react";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingRef = "SL" + Date.now().toString().slice(-6);

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:520, width:"100%", margin:"40px 24px" }}>
        {/* Success Card */}
        <div style={{ background:"white", borderRadius:20, padding:48, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.1)", border:"1px solid #E5E7EB" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#10B981,#34D399)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 8px 24px rgba(16,185,129,0.35)", animation:"scaleIn .5s ease" }}>
            <CheckCircle size={40} color="white"/>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, marginBottom:8 }}>Booking Confirmed!</h1>
          <p style={{ color:"#6B7280", fontSize:16, marginBottom:28 }}>Your reservation is all set. Have a wonderful stay!</p>

          <div style={{ background:"#F9FAFB", border:"1px dashed #D1D5DB", borderRadius:12, padding:20, marginBottom:28, textAlign:"left" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#9CA3AF", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Booking Reference</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"#FF385C", letterSpacing:2 }}>{bookingRef}</div>
            </div>
            {state && (
              <div style={{ borderTop:"1px solid #E5E7EB", paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  ["Hotel", state.hotelName || "Grand Hotel"],
                  ["Room", state.roomName || "Deluxe Room"],
                  ["Check-in", state.checkIn || "—"],
                  ["Check-out", state.checkOut || "—"],
                  ["Nights", state.nights || "1"],
                  ["Total Paid", `₹${(state.amount || 5000).toLocaleString()}`],
                ].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:14, marginBottom:28, fontSize:13, color:"#92400E" }}>
            📧 A confirmation email with your e-ticket has been sent to your registered email address.
          </div>

          <div style={{ display:"flex", gap:12, flexDirection:"column" }}>
            <button onClick={() => navigate("/")} className="btn btn-primary btn-block btn-lg">
              <Home size={18}/> Back to Home
            </button>
            <button onClick={() => navigate("/history")} className="btn btn-outline btn-block">
              <Calendar size={18}/> View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}