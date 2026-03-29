import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, X, RefreshCw } from "lucide-react";
import { getMyBookings, cancelBooking, getBookingSummary } from "../services/api";
import { useToast } from "../context/ToastContext";

// Backend BookingDTO: { id, hotelName, roomType, checkInDate, checkOutDate, totalPrice, status }
// Backend BookingSummaryDTO: { totalBookings, activeBookings, cancelledBookings, totalSpent }

const MOCK_BOOKINGS = [
  { id:1, hotelName:"The Grand Hyatt", roomType:"Deluxe", checkInDate:"2025-05-10", checkOutDate:"2025-05-13", totalPrice:29400, status:"CONFIRMED" },
  { id:2, hotelName:"Taj Holiday Village", roomType:"Suite", checkInDate:"2025-04-02", checkOutDate:"2025-04-05", totalPrice:19500, status:"CANCELLED" },
  { id:3, hotelName:"ITC Windsor", roomType:"Standard", checkInDate:"2025-06-20", checkOutDate:"2025-06-22", totalPrice:11000, status:"PENDING" },
];

const HOTEL_IMAGES = {
  "Grand Hyatt":    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&q=70",
  "Taj":            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&q=70",
  "ITC":            "https://images.unsplash.com/photo-1551882547-ff40c4a49f67?w=300&q=70",
  "default":        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70",
};

const getImg = (name = "") => {
  for (const [k, v] of Object.entries(HOTEL_IMAGES)) {
    if (name.includes(k)) return v;
  }
  return HOTEL_IMAGES.default;
};

const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
};

export default function BookingHistory() {
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ totalBookings:0, activeBookings:0, cancelledBookings:0, totalSpent:0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // GET /bookings/my → ApiResponse<List<BookingDTO>>
      const data = await getMyBookings();
      setBookings(Array.isArray(data) && data.length ? data : MOCK_BOOKINGS);
    } catch {
      setBookings(MOCK_BOOKINGS);
    }
    try {
      // GET /bookings/summary → ApiResponse<BookingSummaryDTO>
      const sum = await getBookingSummary();
      if (sum) setSummary(sum);
    } catch {
      // compute locally from bookings
    }
    setLoading(false);
  };

  // Compute summary locally as fallback
  const computedSummary = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status !== "CANCELLED").length,
    cancelledBookings: bookings.filter(b => b.status === "CANCELLED").length,
    totalSpent: bookings.filter(b => b.status !== "CANCELLED").reduce((s,b) => s + (b.totalPrice||0), 0),
  };
  const disp = summary.totalBookings > 0 ? summary : computedSummary;

  const cancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      // PUT /bookings/cancel/{id}
      await cancelBooking(id);
      toast.success("Booking cancelled successfully");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel. Please try again.");
    } finally {
      setCancelling(null); }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);

  const statCards = [
    { label:"Total Bookings", value: disp.totalBookings, icon:"📋", bg:"#EFF6FF", color:"#2563EB" },
    { label:"Active",         value: disp.activeBookings, icon:"✅", bg:"#ECFDF5", color:"#059669" },
    { label:"Cancelled",      value: disp.cancelledBookings, icon:"❌", bg:"#FFF1F2", color:"#FF385C" },
    { label:"Total Spent",    value:`₹${(disp.totalSpent||0).toLocaleString()}`, icon:"💰", bg:"#FFFBEB", color:"#D97706" },
  ];

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"#F9FAFB" }}>
      <div className="container" style={{ paddingTop:40, paddingBottom:64 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, marginBottom:4 }}>My Bookings</h1>
            <p style={{ color:"#6B7280", fontSize:15 }}>Track and manage all your reservations</p>
          </div>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", border:"1.5px solid #E5E7EB", borderRadius:99, background:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            <RefreshCw size={15}/> Refresh
          </button>
        </div>

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:16, marginBottom:32 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background:"white", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:13, color:"#6B7280", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="tabs" style={{ marginBottom:28 }}>
          {["ALL","CONFIRMED","PENDING","CANCELLED"].map(f => {
            const cnt = f==="ALL" ? bookings.length : bookings.filter(b=>b.status===f).length;
            return (
              <div key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)} style={{ fontSize:13 }}>
                {f} ({cnt})
              </div>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:130, borderRadius:14 }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 24px", background:"white", borderRadius:16, border:"1px solid #E5E7EB" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🏨</div>
            <h3 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>No bookings {filter !== "ALL" ? `with status "${filter}"` : "yet"}</h3>
            <p style={{ color:"#6B7280", marginBottom:24 }}>Start exploring amazing hotels and make your first booking!</p>
            <button onClick={() => navigate("/hotels")} className="btn btn-primary">Explore Hotels</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {filtered.map(b => {
              const nights = nightsBetween(b.checkInDate, b.checkOutDate);
              return (
                <div key={b.id}
                  style={{ background:"white", borderRadius:16, border:"1px solid #E5E7EB", display:"flex", overflow:"hidden", transition:"box-shadow .2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>

                  <img src={getImg(b.hotelName)} alt={b.hotelName}
                    style={{ width:130, objectFit:"cover", flexShrink:0 }}/>

                  <div style={{ flex:1, padding:20 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10, gap:12, flexWrap:"wrap" }}>
                      <div>
                        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{b.hotelName}</h3>
                        <div style={{ fontSize:13, color:"#6B7280" }}>
                          Room Type: <strong>{b.roomType}</strong>
                        </div>
                      </div>
                      <span className={`status status-${b.status?.toLowerCase()}`}>{b.status}</span>
                    </div>

                    <div style={{ display:"flex", gap:20, fontSize:13, color:"#374151", marginBottom:14, flexWrap:"wrap" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Calendar size={13} color="#9CA3AF"/> {b.checkInDate} → {b.checkOutDate}
                      </span>
                      {nights > 0 && <span style={{ color:"#6B7280" }}>{nights} night{nights>1?"s":""}</span>}
                      <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:"#111827" }}>
                        ₹{(b.totalPrice||0).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      <button onClick={() => navigate("/hotels")}
                        style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #E5E7EB", background:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                        Find Similar
                      </button>
                      {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                        <button onClick={() => cancel(b.id)} disabled={cancelling === b.id}
                          style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #FECACA", background:"#FFF1F2", color:"#EF4444", fontSize:13, fontWeight:600, cursor: cancelling===b.id?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, opacity: cancelling===b.id?0.6:1 }}>
                          <X size={13}/> {cancelling===b.id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}
                      {b.status === "PENDING" && (
                        <button onClick={() => navigate("/payment", { state: { bookingId: b.id, amount: b.totalPrice, hotelName: b.hotelName, roomName: b.roomType, checkIn: b.checkInDate, checkOut: b.checkOutDate, nights } })}
                          style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#FF385C", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                          💳 Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}