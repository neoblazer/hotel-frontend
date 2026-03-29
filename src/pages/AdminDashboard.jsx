import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
  Users, Hotel, BedDouble, BookOpen, DollarSign,
  Plus, Edit2, Trash2, Search, LayoutDashboard, LogOut, X
} from "lucide-react";
import {
  getAdminStats, getAllBookings, getAllUsers,
  deleteUser, addHotel, deleteHotel, getAllHotels
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

// Fallback mock data
const MOCK_STATS = { totalUsers:248, totalHotels:42, totalRooms:387, totalBookings:1290, totalRevenue:9840000 };
const MOCK_BOOKINGS = [
  { id:1, userName:"Arjun Mehta",  hotelName:"Grand Hyatt Mumbai",  roomType:"Deluxe",  checkIn:"2025-06-01", checkOut:"2025-06-04", amount:29400, status:"CONFIRMED" },
  { id:2, userName:"Priya Sharma", hotelName:"Taj Holiday Village", roomType:"Suite",   checkIn:"2025-06-10", checkOut:"2025-06-13", amount:49500, status:"PENDING" },
  { id:3, userName:"Ravi Kumar",   hotelName:"ITC Bangalore",       roomType:"Standard",checkIn:"2025-05-20", checkOut:"2025-05-22", amount:10400, status:"CANCELLED" },
  { id:4, userName:"Sneha Patel",  hotelName:"The Leela Delhi",     roomType:"Presidential", checkIn:"2025-07-01", checkOut:"2025-07-03", amount:84000, status:"CONFIRMED" },
];
const MOCK_USERS = [
  { id:1, name:"Arjun Mehta",  email:"arjun@email.com",       role:"USER",  bookings:8,  joined:"Jan 2025" },
  { id:2, name:"Priya Sharma", email:"priya@email.com",       role:"USER",  bookings:3,  joined:"Feb 2025" },
  { id:3, name:"Admin User",   email:"admin@staylux.com",     role:"ADMIN", bookings:0,  joined:"Dec 2024" },
];
const MONTHLY = [
  { month:"Jan", revenue:620000, bookings:82 }, { month:"Feb", revenue:580000, bookings:74 },
  { month:"Mar", revenue:750000, bookings:98 }, { month:"Apr", revenue:820000, bookings:110 },
  { month:"May", revenue:910000, bookings:124 },{ month:"Jun", revenue:1050000, bookings:138 },
];
const PIE_DATA = [{ name:"Confirmed", value:68 }, { name:"Pending", value:18 }, { name:"Cancelled", value:14 }];
const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

const getAllHotelsFn = () => API.get("/hotels?size=100").then(r => r.data?.data?.content || r.data?.data || []);

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats]           = useState(MOCK_STATS);
  const [bookings, setBookings]     = useState(MOCK_BOOKINGS);
  const [users, setUsers]           = useState(MOCK_USERS);
  const [hotels, setHotels]         = useState([]);
  const [activeSection, setSection] = useState("overview");
  const [search, setSearch]         = useState("");
  const [hotelModal, setHotelModal] = useState(false);
  const [newHotel, setNewHotel]     = useState({ name:"", city:"", state:"", description:"", rating:"" });

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    // Stats
    try { const s = await getAdminStats(); if (s) setStats(s); } catch {}
    // Bookings — GET /bookings (admin only)
    try {
      const b = await getAllBookings();
      if (Array.isArray(b) && b.length) setBookings(b);
    } catch {}
    // Users — GET /users (admin only)
    try {
      const u = await getAllUsers();
      if (Array.isArray(u) && u.length) setUsers(u);
    } catch {}
    // Hotels
    try {
      const h = await getAllHotelsFn();
      if (Array.isArray(h) && h.length) setHotels(h);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const handleAddHotel = async () => {
    if (!newHotel.name || !newHotel.city) { toast.error("Name and city are required"); return; }
    try {
      await API.post("/hotels", { ...newHotel, rating: newHotel.rating ? parseFloat(newHotel.rating) : null });
      toast.success("Hotel added successfully!");
      setHotelModal(false);
      setNewHotel({ name:"", city:"", state:"", description:"", rating:"" });
      loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add hotel");
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel? This cannot be undone.")) return;
    try {
      await API.delete(`/hotels/${id}`);
      setHotels(p => p.filter(h => h.id !== id));
      toast.success("Hotel deleted");
    } catch { toast.error("Failed to delete hotel"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(p => p.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const filteredBookings = bookings.filter(b =>
    !search || b.userName?.toLowerCase().includes(search.toLowerCase()) || b.hotelName?.toLowerCase().includes(search.toLowerCase())
  );

  const NAV = [
    { id:"overview", icon:<LayoutDashboard size={17}/>, label:"Overview" },
    { id:"bookings", icon:<BookOpen size={17}/>,       label:"Bookings", badge: bookings.filter(b=>b.status==="PENDING").length },
    { id:"hotels",   icon:<Hotel size={17}/>,          label:"Hotels" },
    { id:"users",    icon:<Users size={17}/>,          label:"Users" },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", minHeight:"100vh" }}>

      {/* SIDEBAR */}
      <aside style={{ background:"#111827", color:"white", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflow:"hidden" }}>
        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#FF385C" }}>
            Stay<span style={{ color:"white" }}>Lux</span>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4, letterSpacing:1.5, textTransform:"uppercase" }}>Admin Console</div>
        </div>

        <nav style={{ padding:"16px 12px", flex:1, overflowY:"auto" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", padding:"8px 12px 10px", marginBottom:4 }}>Navigation</div>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setSection(n.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10,
              cursor:"pointer", marginBottom:2, transition:"all .2s", fontSize:14, fontWeight:600,
              background: activeSection===n.id ? "rgba(255,56,92,0.15)" : "transparent",
              borderLeft: `3px solid ${activeSection===n.id ? "#FF385C" : "transparent"}`,
              color: activeSection===n.id ? "white" : "rgba(255,255,255,0.55)",
            }}>
              {n.icon} {n.label}
              {n.badge > 0 && (
                <span style={{ marginLeft:"auto", background:"#FF385C", color:"white", fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:99, animation:"badgePop .3s ease" }}>
                  {n.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:8, borderRadius:10, background:"rgba(255,255,255,0.05)" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#FF385C,#D93050)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:14, flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Admin"}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Administrator</div>
            </div>
          </div>
          <div onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, borderRadius:8, transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color="white"; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.5)"; e.currentTarget.style.background="transparent"; }}>
            <LogOut size={15}/> Sign Out
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ background:"#F4F6F9", overflowY:"auto" }}>
        <div style={{ padding:32 }}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, marginBottom:4 }}>
              {NAV.find(n => n.id === activeSection)?.label || "Dashboard"}
            </h1>
            <p style={{ color:"#6B7280", fontSize:14 }}>
              {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <>
              {/* Stat Cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:28 }}>
                {[
                  { label:"Users",    value:stats.totalUsers,                            icon:<Users size={20}/>,     bg:"#EFF6FF", color:"#2563EB", change:"+12%" },
                  { label:"Hotels",   value:stats.totalHotels,                           icon:<Hotel size={20}/>,     bg:"#FFF7ED", color:"#EA580C", change:"+3%" },
                  { label:"Rooms",    value:stats.totalRooms,                            icon:<BedDouble size={20}/>, bg:"#F0FDF4", color:"#16A34A", change:"+8%" },
                  { label:"Bookings", value:(stats.totalBookings||0).toLocaleString(),   icon:<BookOpen size={20}/>,  bg:"#FDF4FF", color:"#9333EA", change:"+24%" },
                  { label:"Revenue",  value:`₹${((stats.totalRevenue||0)/100000).toFixed(1)}L`, icon:<DollarSign size={20}/>, bg:"#FFFBEB", color:"#D97706", change:"+18%" },
                ].map(s => (
                  <div key={s.label} style={{ background:"white", borderRadius:14, padding:20, border:"1px solid #E5E7EB", position:"relative", overflow:"hidden" }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, marginBottom:12 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, lineHeight:1, marginBottom:4 }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{s.label}</div>
                    <div style={{ fontSize:11, color:"#10B981", fontWeight:700, marginTop:6 }}>↑ {s.change} this month</div>
                    <div style={{ position:"absolute", right:-8, bottom:-8, fontSize:64, opacity:0.05 }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>
                <div style={{ background:"white", borderRadius:14, padding:24, border:"1px solid #E5E7EB" }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Monthly Revenue (₹)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={MONTHLY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                      <XAxis dataKey="month" tick={{ fontSize:12, fontFamily:"DM Sans" }}/>
                      <YAxis tick={{ fontSize:12, fontFamily:"DM Sans" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}/>
                      <Line type="monotone" dataKey="revenue" stroke="#FF385C" strokeWidth={2.5} dot={{ fill:"#FF385C", r:4 }} activeDot={{ r:6 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background:"white", borderRadius:14, padding:24, border:"1px solid #E5E7EB" }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Booking Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={72} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                        {PIE_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                      </Pie>
                      <Tooltip formatter={v => `${v}%`}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background:"white", borderRadius:14, padding:24, border:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Monthly Bookings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY}>
                    <XAxis dataKey="month" tick={{ fontSize:12 }}/>
                    <YAxis tick={{ fontSize:12 }}/>
                    <Tooltip/>
                    <Bar dataKey="bookings" fill="#FF385C" radius={[5,5,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── BOOKINGS ── */}
          {activeSection === "bookings" && (
            <div style={{ background:"white", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid #E5E7EB", flexWrap:"wrap", gap:12 }}>
                <h3 style={{ fontSize:16, fontWeight:700 }}>All Bookings ({filteredBookings.length})</h3>
                <div style={{ display:"flex", alignItems:"center", gap:8, border:"1.5px solid #E5E7EB", borderRadius:8, padding:"8px 14px", background:"#F9FAFB" }}>
                  <Search size={14} color="#9CA3AF"/>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by guest or hotel..."
                    style={{ border:"none", outline:"none", fontSize:14, background:"transparent", width:200 }}/>
                </div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Guest</th><th>Hotel</th><th>Room Type</th>
                      <th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight:600 }}>{b.userName || b.user?.name || "—"}</td>
                        <td>{b.hotelName || b.hotel?.name || "—"}</td>
                        <td>{b.roomType || b.room?.type || "—"}</td>
                        <td style={{ color:"#6B7280" }}>{b.checkInDate || b.checkIn}</td>
                        <td style={{ color:"#6B7280" }}>{b.checkOutDate || b.checkOut}</td>
                        <td style={{ fontWeight:700 }}>₹{(b.totalPrice || b.amount || 0).toLocaleString()}</td>
                        <td><span className={`status status-${(b.status||"").toLowerCase()}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && (
                  <div style={{ padding:"40px 24px", textAlign:"center", color:"#9CA3AF" }}>No bookings found</div>
                )}
              </div>
            </div>
          )}

          {/* ── HOTELS ── */}
          {activeSection === "hotels" && (
            <>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
                <button onClick={() => setHotelModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={15}/> Add Hotel
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
                {hotels.map(h => (
                  <div key={h.id} style={{ background:"white", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden", transition:"box-shadow .2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>
                    <div style={{ height:140, overflow:"hidden" }}>
                      <img src={h.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70"} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                    <div style={{ padding:16 }}>
                      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{h.name}</h3>
                      <div style={{ fontSize:13, color:"#6B7280", marginBottom:10 }}>📍 {h.city}{h.state ? `, ${h.state}` : ""}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:14 }}>
                        <span>⭐ {h.rating || "—"}</span>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button style={{ flex:1, padding:"8px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                          <Edit2 size={13}/> Edit
                        </button>
                        <button onClick={() => handleDeleteHotel(h.id)}
                          style={{ padding:"8px 12px", border:"1.5px solid #FECACA", borderRadius:8, background:"#FFF1F2", color:"#EF4444", cursor:"pointer", display:"flex", alignItems:"center" }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {hotels.length === 0 && (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 24px", color:"#9CA3AF" }}>
                    No hotels yet. Click "Add Hotel" to get started.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {activeSection === "users" && (
            <div style={{ background:"white", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:16, fontWeight:700 }}>Registered Users ({users.length})</h3>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table>
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ color:"#9CA3AF", fontSize:13 }}>#{u.id}</td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF385C,#FF6B8A)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:700, flexShrink:0 }}>
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight:600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color:"#6B7280" }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role==="ADMIN" ? "badge-dark" : "badge-info"}`}>{u.role}</span>
                        </td>
                        <td>
                          {u.role !== "ADMIN" && (
                            <button onClick={() => handleDeleteUser(u.id)}
                              style={{ width:30, height:30, borderRadius:6, border:"1.5px solid #FECACA", background:"#FFF1F2", color:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                              <Trash2 size={13}/>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD HOTEL MODAL */}
      {hotelModal && (
        <div className="modal-bg" onClick={() => setHotelModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Hotel</span>
              <div className="modal-close" onClick={() => setHotelModal(false)}><X size={18}/></div>
            </div>
            <div className="modal-body">
              {[
                ["Hotel Name *", "name", "The Grand Palace", "text"],
                ["City *",       "city", "Mumbai",           "text"],
                ["State",        "state","Maharashtra",      "text"],
                ["Rating (0-5)", "rating","4.5",             "number"],
              ].map(([label, key, ph, type]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} value={newHotel[key]}
                    onChange={e => setNewHotel(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph} className="form-control"
                    min={type==="number"?0:undefined} max={type==="number"?5:undefined} step={type==="number"?"0.1":undefined}/>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={newHotel.description}
                  onChange={e => setNewHotel(p => ({ ...p, description: e.target.value }))}
                  placeholder="A luxury hotel offering world-class amenities..."
                  className="form-control" rows={3}/>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setHotelModal(false)} className="btn btn-outline btn-sm">Cancel</button>
              <button onClick={handleAddHotel} className="btn btn-primary btn-sm"><Plus size={14}/> Add Hotel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}