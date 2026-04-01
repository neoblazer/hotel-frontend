import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home, Calendar } from "lucide-react";   // ← removed unused Download

export default function BookingSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingRef = "SMV" + Date.now().toString().slice(-6);

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:520, width:"100%", margin:"40px 24px" }}>
        <div style={{ background:"var(--surface)", borderRadius:20, padding:48, textAlign:"center", boxShadow:"var(--shadow-xl)", border:"1px solid var(--border)" }}>

          {/* Icon */}
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#10B981,#34D399)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 8px 24px rgba(16,185,129,0.35)", animation:"scaleIn .5s ease" }}>
            <CheckCircle size={40} color="white"/>
          </div>

          <h1 style={{ fontFamily:"var(--font-serif)", fontSize:32, fontWeight:400, marginBottom:8, color:"var(--text)" }}>Booking Confirmed!</h1>
          <p style={{ color:"var(--text2)", fontSize:16, marginBottom:28 }}>Your reservation is all set. Have a wonderful stay!</p>

          {/* Ref number */}
          <div style={{ background:"var(--surface2)", border:"1px dashed var(--border2)", borderRadius:12, padding:20, marginBottom:28, textAlign:"left" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:12, color:"var(--text3)", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Booking Reference</div>
              <div style={{ fontFamily:"var(--font-serif)", fontSize:28, fontWeight:400, color:"var(--primary)", letterSpacing:2 }}>{bookingRef}</div>
            </div>
            {state && (
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  ["Hotel",     state.hotelName  || "Grand Hotel"],
                  ["Room",      state.roomName   || "Deluxe Room"],
                  ["Check-in",  state.checkIn    || "—"],
                  ["Check-out", state.checkOut   || "—"],
                  ["Nights",    state.nights     || "1"],
                  ["Total Paid",`₹${(state.amount || 5000).toLocaleString()}`],
                ].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize:11, color:"var(--text3)", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{v}</div>
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