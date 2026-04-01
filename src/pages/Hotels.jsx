import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Search, SlidersHorizontal, X, Map, Grid } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getHotels, searchHotels } from "../services/api";
import { useToast } from "../context/ToastContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fallback mock data when backend is not running
const MOCK = [
  { id:1, name:"The Grand Hyatt", city:"Mumbai", state:"Maharashtra", rating:4.8, imageUrl:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", price:9800 },
  { id:2, name:"Taj Holiday Village", city:"Goa", state:"Goa", rating:4.6, imageUrl:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", price:6500 },
  { id:3, name:"The Oberoi", city:"Delhi", state:"Delhi", rating:4.9, imageUrl:"https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80", price:12000 },
  { id:4, name:"ITC Windsor", city:"Bangalore", state:"Karnataka", rating:4.5, imageUrl:"https://images.unsplash.com/photo-1551882547-ff40c4a49f67?w=600&q=80", price:5500 },
  { id:5, name:"Park Hyatt", city:"Hyderabad", state:"Telangana", rating:4.7, imageUrl:"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80", price:7800 },
  { id:6, name:"Jaipur Palace Resort", city:"Jaipur", state:"Rajasthan", rating:4.4, imageUrl:"https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=600&q=80", price:4200 },
];

// Approximate coords for map
const CITY_COORDS = {
  Mumbai:    { lat:19.0760, lng:72.8777 },
  Goa:       { lat:15.4989, lng:73.8278 },
  Delhi:     { lat:28.6139, lng:77.2090 },
  Bangalore: { lat:12.9716, lng:77.5946 },
  Hyderabad: { lat:17.3850, lng:78.4867 },
  Jaipur:    { lat:26.9124, lng:75.7873 },
  Chennai:   { lat:13.0827, lng:80.2707 },
  Kolkata:   { lat:22.5726, lng:88.3639 },
};

const StarRow = ({ r }) => (
  <span style={{ color:"#FFB400", fontSize:13 }}>
    {"★".repeat(Math.floor(r || 0))}{"☆".repeat(5 - Math.floor(r || 0))}
  </span>
);

export default function Hotels() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [maxPrice, setMaxPrice] = useState(25000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("favorites") || "[]"));
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHotels();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}
      );
    }
  }, [page]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      // Backend returns Page<HotelDTO> — shape: { content:[], totalPages, totalElements... }
      const data = await getHotels({ page, size: 12 });
      if (data && data.content) {
        setHotels(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setHotels(data);
      } else {
        setHotels(MOCK);
      }
    } catch {
      setHotels(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      if (minRating > 0) params.rating = minRating;
      const data = await searchHotels(params);
      const list = data?.content || (Array.isArray(data) ? data : MOCK);
      setHotels(list);
    } catch {
      setHotels(MOCK.filter(h => !city || h.city.toLowerCase().includes(city.toLowerCase())));
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return +(R*(2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))).toFixed(1);
  };

  const toggleWish = (hotel, e) => {
    e?.stopPropagation();
    const isIn = wishlist.some(f => f.id === hotel.id);
    const updated = isIn ? wishlist.filter(f => f.id !== hotel.id) : [...wishlist, hotel];
    setWishlist(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    toast[isIn ? "info" : "success"](isIn ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  // Client-side filter + sort on top of backend results
  let filtered = hotels
    .filter(h => !city || h.city?.toLowerCase().includes(city.toLowerCase()))
    .filter(h => (h.rating || 0) >= minRating)
    .filter(h => (h.price || 0) <= maxPrice)
    .map(h => {
      const coords = CITY_COORDS[h.city];
      const distance = (userLocation && coords)
        ? getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
        : null;
      return { ...h, distance, lat: coords?.lat, lng: coords?.lng };
    });

  if (sortBy === "price-asc") filtered.sort((a,b) => (a.price||0)-(b.price||0));
  else if (sortBy === "price-desc") filtered.sort((a,b) => (b.price||0)-(a.price||0));
  else if (sortBy === "rating") filtered.sort((a,b) => (b.rating||0)-(a.rating||0));
  else if (sortBy === "distance") filtered.sort((a,b) => (a.distance??9999)-(b.distance??9999));

  const mapCenter = userLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      {/* Sticky search/filter bar */}
      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"14px 0", position:"sticky", top:70, zIndex:100, boxShadow:"var(--shadow-sm)" }}>
        <div className="container" style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:180, position:"relative" }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", pointerEvents:"none" }}/>
            <input value={city} onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search by city..."
              style={{ width:"100%", padding:"10px 16px 10px 36px", border:"1.5px solid var(--border)", borderRadius:99, fontSize:14, outline:"none", background:"var(--surface)", color:"var(--text)" }}
              onFocus={e=>e.target.style.borderColor="var(--primary)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
          </div>

          <button onClick={handleSearch} style={{ padding:"10px 20px", background:"var(--primary)", color:"white", border:"none", borderRadius:99, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            Search
          </button>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding:"10px 16px", border:"1.5px solid var(--border)", borderRadius:99, fontSize:14, outline:"none", background:"var(--surface)", color:"var(--text)", cursor:"pointer" }}>
            <option value="rating">⭐ Top Rated</option>
            <option value="price-asc">💰 Price: Low → High</option>
            <option value="price-desc">💎 Price: High → Low</option>
            {userLocation && <option value="distance">📍 Nearest First</option>}
          </select>

          <button onClick={() => setFiltersOpen(o => !o)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", border:"1.5px solid", borderColor: filtersOpen?"var(--primary)":"var(--border)", borderRadius:99, background: filtersOpen?"var(--surface2)":"var(--surface)", fontSize:14, fontWeight:600, cursor:"pointer", color: filtersOpen?"var(--primary)":"var(--text2)" }}>
            <SlidersHorizontal size={15}/> Filters
          </button>

          <div style={{ display:"flex", border:"1.5px solid var(--border)", borderRadius:99, overflow:"hidden" }}>
            {[["grid","⊞ Grid"],["map","🗺 Map"]].map(([v,l]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{ padding:"9px 16px", background: viewMode===v?"var(--text)":"var(--surface)", color: viewMode===v?"white":"var(--text2)", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all .2s" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="container" style={{ paddingTop:14 }}>
            <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:12, padding:20, display:"flex", gap:32, flexWrap:"wrap", alignItems:"flex-end" }}>
              <div style={{ minWidth:200 }}>
                <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:8, color:"var(--text)" }}>Max Price: ₹{maxPrice.toLocaleString()}</label>
                <input type="range" min={500} max={30000} step={500} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ width:"100%" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text3)", marginTop:4 }}><span>₹500</span><span>₹30,000</span></div>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:8, color:"var(--text)" }}>Min Rating</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[0,3,4,4.5].map(r => (
                    <button key={r} onClick={() => setMinRating(r)} style={{ padding:"7px 14px", borderRadius:99, border:"1.5px solid", borderColor: minRating===r?"var(--primary)":"var(--border)", background: minRating===r?"var(--surface2)":"var(--surface)", color: minRating===r?"var(--primary)":"var(--text2)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                      {r===0 ? "All" : r+"★"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { setMaxPrice(25000); setMinRating(0); setCity(""); setSortBy("rating"); loadHotels(); }}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:99, border:"1.5px solid var(--border)", background:"var(--surface)", color:"var(--text)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                <X size={13}/> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container" style={{ paddingTop:28, paddingBottom:64 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <p style={{ fontSize:15, color:"var(--text2)" }}>
            Showing <strong style={{ color:"var(--text)" }}>{filtered.length}</strong> hotel{filtered.length !== 1 ? "s" : ""}
            {city ? ` in "${city}"` : ""}
          </p>
        </div>

        {/* MAP VIEW */}
        {viewMode === "map" && (
          <div style={{ height:580, borderRadius:18, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.12)", marginBottom:32, border:"1px solid var(--border)" }}>
            <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={5} style={{ height:"100%", width:"100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap"/>
              {filtered.filter(h => h.lat && h.lng).map(h => (
                <Marker key={h.id} position={[h.lat, h.lng]}>
                  <Popup>
                    <div style={{ textAlign:"center", minWidth:160, fontFamily:"DM Sans,sans-serif" }}>
                      <img src={h.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=60"} style={{ width:"100%", height:80, objectFit:"cover", borderRadius:6, marginBottom:8 }}/>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{h.name}</div>
                      <div style={{ fontSize:12, color:"var(--text2)", marginBottom:6 }}>📍 {h.city}, {h.state}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center" }}>
                        <span style={{ fontWeight:700, fontSize:14, color:"var(--primary)" }}>₹{(h.price||2000).toLocaleString()}/night</span>
                        <span style={{ color:"#FFB400", fontSize:13 }}>★ {h.rating || "—"}</span>
                      </div>
                      <button onClick={() => navigate(`/rooms/${h.id}`)} style={{ width:"100%", padding:"7px", background:"var(--primary)", color:"white", border:"none", borderRadius:6, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        Book Now
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <>
            {loading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:24 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ borderRadius:14, overflow:"hidden", border:"1px solid var(--border)", background:"var(--surface)" }}>
                    <div className="skeleton" style={{ height:220 }}/>
                    <div style={{ padding:18 }}>
                      <div className="skeleton" style={{ height:12, width:"50%", marginBottom:10 }}/>
                      <div className="skeleton" style={{ height:18, width:"80%", marginBottom:12 }}/>
                      <div className="skeleton" style={{ height:12, width:"40%" }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 24px", background:"var(--surface)", borderRadius:16, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontSize:22, fontWeight:700, marginBottom:8, color:"var(--text)" }}>No hotels found</h3>
                <p style={{ color:"var(--text2)", marginBottom:20 }}>Try adjusting your filters or search a different city</p>
                <button onClick={() => { setCity(""); loadHotels(); }} className="btn btn-primary btn-sm">Clear Search</button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:24 }}>
                {filtered.map((hotel, idx) => {
                  const isFav = wishlist.some(f => f.id === hotel.id);
                  return (
                    <div key={hotel.id} onClick={() => navigate(`/rooms/${hotel.id}`)}
                      style={{ borderRadius:14, overflow:"hidden", background:"var(--surface)", border:"1px solid var(--border)", cursor:"pointer", transition:"all .25s", animation:`fadeUp .4s ease both`, animationDelay:`${idx*0.04}s` }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                      <div style={{ position:"relative", height:220, overflow:"hidden" }}>
                        <img src={hotel.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"} alt={hotel.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s" }}
                          onMouseEnter={e => e.target.style.transform="scale(1.07)"}
                          onMouseLeave={e => e.target.style.transform="none"}/>
                        <button onClick={e => toggleWish(hotel, e)}
                          style={{ position:"absolute", top:10, right:10, width:36, height:36, borderRadius:"50%", background:"var(--surface)", border:"1px solid var(--border)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"transform .2s", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}
                          onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
                          onMouseLeave={e => e.currentTarget.style.transform="none"}>
                          {isFav ? "❤️" : "🤍"}
                        </button>
                        {hotel.rating >= 4.8 && (
                          <span style={{ position:"absolute", top:10, left:10, background:"var(--primary)", color:"white", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99 }}>⭐ Top Rated</span>
                        )}
                      </div>
                      <div style={{ padding:18 }}>
                        <div style={{ fontSize:12, color:"var(--text2)", display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                          <MapPin size={11}/> {hotel.city}{hotel.state ? `, ${hotel.state}` : ""}
                          {hotel.distance != null && <span style={{ marginLeft:"auto", color:"var(--primary)", fontWeight:600, fontSize:11 }}>📍 {hotel.distance}km</span>}
                        </div>
                        <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--text)" }}>{hotel.name}</h3>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                          <StarRow r={hotel.rating}/>
                          <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{hotel.rating || "—"}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:14, borderTop:"1px solid var(--border)" }}>
                          <div>
                            <span style={{ fontSize:11, color:"var(--text3)" }}>from </span>
                            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"var(--text)" }}>₹{(hotel.price || 2000).toLocaleString()}</span>
                            <span style={{ fontSize:12, color:"var(--text2)" }}>/night</span>
                          </div>
                          <span style={{ fontSize:12, color:"#10B981", fontWeight:600 }}>✓ Free cancel</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:40, flexWrap:"wrap" }}>
                <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
                  style={{ padding:"9px 18px", border:"1.5px solid var(--border)", borderRadius:99, background:"var(--surface)", color:"var(--text)", fontSize:14, fontWeight:600, cursor:"pointer", opacity: page===0?0.4:1 }}>← Prev</button>
                {Array.from({ length: totalPages }, (_,i) => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{ padding:"9px 16px", border:"1.5px solid", borderColor: page===i?"var(--primary)":"var(--border)", borderRadius:99, background: page===i?"var(--surface2)":"var(--surface)", color: page===i?"var(--primary)":"var(--text2)", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                    {i+1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}
                  style={{ padding:"9px 18px", border:"1.5px solid var(--border)", borderRadius:99, background:"var(--surface)", color:"var(--text)", fontSize:14, fontWeight:600, cursor:"pointer", opacity: page===totalPages-1?0.4:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}