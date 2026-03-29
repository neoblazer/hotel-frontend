import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Wifi, Tv, Coffee, Wind, Car, Dumbbell, Users, ChevronLeft, Star } from "lucide-react";
import { getRoomsByHotel, getHotelById, createBooking } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Fallback mock rooms
const MOCK_ROOMS = [
  { id:1, type:"Deluxe", basePrice:9800, rating:4.7, capacity:2, amenities:["WiFi","AC","TV","Coffee Maker"], imageUrl:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", totalRooms:5, hotelName:"Sample Hotel" },
  { id:2, type:"Suite",  basePrice:16500, rating:4.9, capacity:3, amenities:["WiFi","AC","TV","Minibar","Bathtub"], imageUrl:"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", totalRooms:3, hotelName:"Sample Hotel" },
  { id:3, type:"Standard", basePrice:5200, rating:4.4, capacity:2, amenities:["WiFi","AC","TV"], imageUrl:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80", totalRooms:10, hotelName:"Sample Hotel" },
];

const AMENITY_ICONS = {
  "WiFi": <Wifi size={13}/>, "AC": <Wind size={13}/>, "TV": <Tv size={13}/>,
  "Coffee Maker": <Coffee size={13}/>, "Gym": <Dumbbell size={13}/>, "Parking": <Car size={13}/>,
};

// Handles both string[] amenities and comma-separated string from backend
const parseAmenities = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(a => a.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map(a => a.trim()).filter(Boolean);
  return [];
};

export default function Rooms() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rooms");

  const today = new Date().toISOString().split("T")[0];
  const nights = (checkIn && checkOut)
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // GET /hotels/{id} → ApiResponse<HotelDTO>
        const hotelData = await getHotelById(hotelId);
        setHotel(hotelData);
      } catch {
        setHotel({ id: hotelId, name: "Hotel Details", city: "India", rating: 4.5 });
      }
      try {
        // GET /rooms/hotel/{hotelId} → ApiResponse<List<RoomDTO>>
        const roomData = await getRoomsByHotel(hotelId);
        setRooms(Array.isArray(roomData) && roomData.length ? roomData : MOCK_ROOMS);
      } catch {
        setRooms(MOCK_ROOMS);
      }
      setLoading(false);
    };
    load();
  }, [hotelId]);

  const handleBook = async (room) => {
    if (!isLoggedIn) { toast.warning("Please login to book a room"); navigate("/login"); return; }
    if (!checkIn || !checkOut) { toast.error("Please select check-in and check-out dates"); return; }
    if (nights <= 0) { toast.error("Check-out must be after check-in"); return; }
    if (new Date(checkIn) < new Date(today)) { toast.error("Check-in cannot be in the past"); return; }

    setBookingLoading(true);
    try {
      // POST /bookings — BookingRequestDTO: { checkInDate, checkOutDate, roomId }
      const booking = await createBooking({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomId: room.id,
        guests,
      });
      toast.success("Booking created! Proceeding to payment...");
      setTimeout(() => navigate("/payment", {
        state: {
          bookingId: booking?.id,
          roomId: room.id,
          checkIn,
          checkOut,
          amount: (room.basePrice || room.price) * nights,
          hotelName: hotel?.name,
          roomName: room.type,
          nights,
        }
      }), 600);
    } catch (err) {
      const msg = err?.response?.data?.message || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div style={{ paddingTop:70 }}>
      <div className="skeleton" style={{ height:380, borderRadius:0 }}/>
      <div className="container" style={{ paddingTop:32 }}>
        <div className="skeleton" style={{ height:32, width:"40%", marginBottom:20 }}/>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:200, borderRadius:14 }}/>)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"#F9FAFB" }}>
      {/* Hero */}
      <div style={{ position:"relative", height:360, overflow:"hidden" }}>
        <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80"
          alt={hotel?.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.1) 60%)" }}/>
        <button onClick={() => navigate(-1)}
          style={{ position:"absolute", top:20, left:20, display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.3)", color:"white", padding:"9px 18px", borderRadius:99, fontSize:14, fontWeight:600, cursor:"pointer" }}>
          <ChevronLeft size={16}/> Back
        </button>
        <div className="container" style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%" }}>
          <div style={{ paddingBottom:28 }}>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <span style={{ background:"#FF385C", color:"white", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:99 }}>⭐ {hotel?.rating || 4.5}</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,4vw,42px)", fontWeight:900, color:"white", marginBottom:8 }}>{hotel?.name || "Hotel"}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:16, color:"rgba(255,255,255,0.85)", fontSize:14, flexWrap:"wrap" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><MapPin size={14}/>{hotel?.city}{hotel?.state ? `, ${hotel?.state}` : ""}</span>
              {hotel?.description && <span style={{ opacity:0.7, fontSize:13 }}>{hotel.description.slice(0,60)}...</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom:36 }}>
          {[["rooms","🛏 Rooms"],["overview","ℹ️ Overview"],["amenities","✨ Amenities"]].map(([t,l]) => (
            <div key={t} className={`tab ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)}>{l}</div>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ maxWidth:720 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, marginBottom:16 }}>About {hotel?.name}</h2>
            <p style={{ color:"#6B7280", lineHeight:1.9, fontSize:16 }}>
              {hotel?.description || "Experience world-class hospitality and comfort at this premier property. Every detail is crafted to ensure an exceptional stay for every guest."}
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16, marginTop:32 }}>
              {[["⏰ Check-In","From 2:00 PM"],["⏰ Check-Out","Until 12:00 PM"],["❌ Cancellation","Free (48h before)"],["💳 Payment","Card / UPI / QR"]].map(([k,v]) => (
                <div key={k} style={{ background:"white", borderRadius:12, padding:16, border:"1px solid #E5E7EB" }}>
                  <div style={{ fontSize:12, color:"#9CA3AF", fontWeight:600, marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES TAB */}
        {activeTab === "amenities" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
            {["Free WiFi","Swimming Pool","Fitness Center","Restaurant","24h Room Service","Airport Shuttle","Business Center","Spa & Wellness","Bar & Lounge","Valet Parking","Concierge","Laundry"].map(a => (
              <div key={a} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"white", borderRadius:12, border:"1px solid #E5E7EB" }}>
                <span style={{ color:"#10B981", fontSize:16 }}>✓</span>
                <span style={{ fontSize:14, fontWeight:500 }}>{a}</span>
              </div>
            ))}
          </div>
        )}

        {/* ROOMS TAB */}
        {activeTab === "rooms" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {rooms.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 24px", background:"white", borderRadius:16, border:"1px solid #E5E7EB" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🛏</div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>No rooms found</h3>
                <p style={{ color:"#6B7280" }}>Please check back later or contact the hotel directly.</p>
              </div>
            ) : rooms.map(room => {
              const amenities = parseAmenities(room.amenities);
              const price = room.basePrice || room.price || 0;
              const isSelecting = bookingRoom?.id === room.id;
              return (
                <div key={room.id}
                  style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:16, display:"flex", overflow:"hidden", transition:"box-shadow .2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>

                  {/* Room image */}
                  <div style={{ width:240, flexShrink:0, overflow:"hidden", position:"relative" }}>
                    <img src={room.imageUrl || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"}
                      alt={room.type} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s", minHeight:180 }}
                      onMouseEnter={e => e.target.style.transform="scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform="none"}/>
                  </div>

                  <div style={{ flex:1, padding:24, display:"flex", flexDirection:"column" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, gap:16, flexWrap:"wrap" }}>
                      <div>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                          <span style={{ background:"#EFF6FF", color:"#2563EB", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>{room.type}</span>
                          {room.totalRooms > 0 && room.totalRooms <= 2 && (
                            <span style={{ background:"#FFFBEB", color:"#D97706", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Only {room.totalRooms} left!</span>
                          )}
                        </div>
                        <h3 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>{room.type} Room</h3>
                        <div style={{ display:"flex", gap:16, color:"#6B7280", fontSize:13, flexWrap:"wrap" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Users size={13}/> Up to {room.capacity || 2} guests</span>
                          {room.rating && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Star size={12} color="#FFB400" fill="#FFB400"/> {room.rating}</span>}
                          <span>🛏 {room.totalRooms} room{room.totalRooms !== 1?"s":""} available</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, lineHeight:1 }}>₹{price.toLocaleString()}</div>
                        <div style={{ fontSize:13, color:"#9CA3AF" }}>per night</div>
                        {nights > 0 && (
                          <div style={{ fontSize:13, color:"#10B981", fontWeight:700, marginTop:4 }}>
                            {nights} night{nights>1?"s":""} = ₹{(price*nights).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                        {amenities.map(a => (
                          <span key={a} style={{ display:"flex", alignItems:"center", gap:5, background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:99, padding:"5px 12px", fontSize:12, color:"#374151", fontWeight:500 }}>
                            {AMENITY_ICONS[a] || "✓"} {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Booking form (inline) */}
                    {isSelecting ? (
                      <div style={{ background:"#F9FAFB", borderRadius:12, padding:18, border:"1px solid #E5E7EB", marginTop:"auto" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                          {[
                            ["Check-In", checkIn, v => setCheckIn(v), "date"],
                            ["Check-Out", checkOut, v => setCheckOut(v), "date"],
                            ["Guests", guests, v => setGuests(+v), "number"],
                          ].map(([lbl, val, fn, type]) => (
                            <div key={lbl}>
                              <label style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:6, color:"#374151" }}>{lbl}</label>
                              <input type={type} value={val} min={type==="date"?today:1} max={type==="number"?room.capacity||6:undefined}
                                onChange={e => fn(e.target.value)}
                                style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:14, outline:"none", background:"white" }}
                                onFocus={e => e.target.style.borderColor="#FF385C"} onBlur={e => e.target.style.borderColor="#E5E7EB"}/>
                            </div>
                          ))}
                        </div>
                        {nights > 0 && (
                          <div style={{ background:"#ECFDF5", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#059669", fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                            📅 {nights} night{nights>1?"s":""} · Total: ₹{(price*nights).toLocaleString()} · Tax: ₹{Math.round(price*nights*0.12).toLocaleString()}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:10 }}>
                          <button onClick={() => handleBook(room)} disabled={bookingLoading}
                            style={{ flex:1, padding:"13px", background: bookingLoading?"#9CA3AF":"#FF385C", color:"white", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor: bookingLoading?"not-allowed":"pointer", transition:"background .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            {bookingLoading
                              ? <><span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/> Processing...</>
                              : "✓ Confirm & Pay →"}
                          </button>
                          <button onClick={() => setBookingRoom(null)}
                            style={{ padding:"13px 20px", border:"1.5px solid #E5E7EB", borderRadius:10, background:"white", fontWeight:600, cursor:"pointer", fontSize:14 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop:"auto", paddingTop:16 }}>
                        <button onClick={() => setBookingRoom(room)}
                          style={{ padding:"12px 32px", borderRadius:10, background:"#FF385C", color:"white", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", transition:"all .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#D93050"; e.currentTarget.style.transform="translateY(-1px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="#FF385C"; e.currentTarget.style.transform="none"; }}>
                          Select Dates & Book
                        </button>
                        <span style={{ marginLeft:14, fontSize:13, color:"#10B981", fontWeight:600 }}>✓ Free cancellation</span>
                      </div>
                    )}
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