import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  Hotel,
  BedDouble,
  BookOpen,
  DollarSign,
  Plus,
  Trash2,
  Search,
  LayoutDashboard,
  LogOut,
  X,
} from "lucide-react";
import {
  getAdminStats,
  getAllBookings,
  getAllUsers,
  deleteUser,
  getAllHotels,
  addHotel,
  deleteHotel,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [hotelModal, setHotelModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newHotel, setNewHotel] = useState({
    name: "",
    city: "",
    state: "",
    description: "",
    imageUrl: "",
    rating: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadAll();
  }, [isAdmin, navigate]);

  const loadAll = async () => {
    setLoading(true);

    try {
      const [statsRes, bookingsRes, usersRes, hotelsRes] = await Promise.allSettled([
        getAdminStats(),
        getAllBookings(),
        getAllUsers(),
        getAllHotels(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }

      if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value)) {
        setBookings(bookingsRes.value);
      } else {
        setBookings([]);
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      } else {
        setUsers([]);
      }

      if (hotelsRes.status === "fulfilled" && Array.isArray(hotelsRes.value)) {
        setHotels(hotelsRes.value);
      } else {
        setHotels([]);
      }
    } catch (err) {
      toast.error("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddHotel = async () => {
    if (!newHotel.name.trim() || !newHotel.city.trim()) {
      toast.error("Hotel name and city are required");
      return;
    }

    try {
      await addHotel({
        name: newHotel.name.trim(),
        city: newHotel.city.trim(),
        state: newHotel.state.trim() || null,
        description: newHotel.description.trim() || null,
        imageUrl: newHotel.imageUrl.trim() || null,
        rating: newHotel.rating ? parseFloat(newHotel.rating) : null,
      });

      toast.success("Hotel added successfully");
      setHotelModal(false);
      setNewHotel({
        name: "",
        city: "",
        state: "",
        description: "",
        imageUrl: "",
        rating: "",
      });
      loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add hotel");
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;

    try {
      await deleteHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
      toast.success("Hotel deleted successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete hotel");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;

    return bookings.filter((b) => {
      const guest = b.userName?.toLowerCase() || "";
      const hotel = b.hotelName?.toLowerCase() || "";
      const room = b.roomType?.toLowerCase() || "";
      return guest.includes(q) || hotel.includes(q) || room.includes(q);
    });
  }, [bookings, search]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = u.name?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const role = u.role?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, search]);

  const filteredHotels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hotels;

    return hotels.filter((h) => {
      const name = h.name?.toLowerCase() || "";
      const city = h.city?.toLowerCase() || "";
      const state = h.state?.toLowerCase() || "";
      return name.includes(q) || city.includes(q) || state.includes(q);
    });
  }, [hotels, search]);

  const statusCounts = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

    return [
      { name: "Confirmed", value: confirmed },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ];
  }, [bookings]);

  const monthlyData = [
    { month: "Jan", revenue: 120000, bookings: 6 },
    { month: "Feb", revenue: 150000, bookings: 8 },
    { month: "Mar", revenue: 180000, bookings: 10 },
    { month: "Apr", revenue: 220000, bookings: 12 },
    { month: "May", revenue: 260000, bookings: 14 },
    { month: "Jun", revenue: stats.totalRevenue || 0, bookings: stats.totalBookings || 0 },
  ];

  const NAV = [
    { id: "overview", icon: <LayoutDashboard size={17} />, label: "Overview" },
    {
      id: "bookings",
      icon: <BookOpen size={17} />,
      label: "Bookings",
      badge: bookings.length,
    },
    { id: "hotels", icon: <Hotel size={17} />, label: "Hotels" },
    { id: "users", icon: <Users size={17} />, label: "Users", badge: users.length },
  ];

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={20} />,
      bg: "#EEF2FF",
      color: "#4F46E5",
    },
    {
      title: "Hotels",
      value: stats.totalHotels,
      icon: <Hotel size={20} />,
      bg: "#ECFDF5",
      color: "#059669",
    },
    {
      title: "Rooms",
      value: stats.totalRooms,
      icon: <BedDouble size={20} />,
      bg: "#FFF7ED",
      color: "#EA580C",
    },
    {
      title: "Bookings",
      value: stats.totalBookings,
      icon: <BookOpen size={20} />,
      bg: "#FDF2F8",
      color: "#DB2777",
    },
    {
      title: "Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarSign size={20} />,
      bg: "#EFF6FF",
      color: "#2563EB",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          background: "#111827",
          color: "white",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "28px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              fontWeight: 900,
              color: "#0EA5E9",
            }}
          >
            SmartStay <span style={{ color: "white" }}>Vizag</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Admin Console
          </div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "8px 12px 10px",
              marginBottom: 4,
            }}
          >
            Navigation
          </div>

          {NAV.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveSection(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 2,
                transition: "all .2s",
                fontSize: 14,
                fontWeight: 600,
                background: activeSection === n.id ? "rgba(14,165,233,0.15)" : "transparent",
                borderLeft: `3px solid ${activeSection === n.id ? "#0EA5E9" : "transparent"}`,
                color: activeSection === n.id ? "white" : "rgba(255,255,255,0.65)",
              }}
            >
              {n.icon} {n.label}
              {n.badge > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#0EA5E9",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 99,
                  }}
                >
                  {n.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              marginBottom: 8,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Admin"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email || "admin@smartstayvizag.com"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "bookings" && `All Bookings (${bookings.length})`}
              {activeSection === "hotels" && `Hotels (${hotels.length})`}
              {activeSection === "users" && `Registered Users (${users.length})`}
            </h1>
            <p style={{ margin: "6px 0 0", color: "var(--text2)" }}>
              Manage SmartStay Vizag from one place
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {activeSection !== "overview" && (
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text3)",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeSection}...`}
                  style={{
                    width: 280,
                    padding: "10px 14px 10px 36px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {activeSection === "hotels" && (
              <button onClick={() => setHotelModal(true)} className="btn btn-primary">
                <Plus size={16} /> Add Hotel
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
              <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
              <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                      gap: 18,
                      marginBottom: 28,
                    }}
                  >
                    {statCards.map((card) => (
                      <div key={card.title} className="card" style={{ padding: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              display: "grid",
                              placeItems: "center",
                              background: card.bg,
                              color: card.color,
                            }}
                          >
                            {card.icon}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "var(--text)",
                            marginBottom: 4,
                          }}
                        >
                          {card.value}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--text2)" }}>{card.title}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.35fr 1fr",
                      gap: 22,
                      marginBottom: 24,
                    }}
                  >
                    <div className="card" style={{ padding: 20, minHeight: 320 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "var(--text)",
                          marginBottom: 16,
                        }}
                      >
                        Revenue & Bookings Trend
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} />
                          <Line type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="card" style={{ padding: 20, minHeight: 320 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "var(--text)",
                          marginBottom: 16,
                        }}
                      >
                        Booking Status Split
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={statusCounts}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label
                          >
                            {statusCounts.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 20 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "var(--text)",
                        marginBottom: 16,
                      }}
                    >
                      Snapshot
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={[
                          { name: "Users", value: stats.totalUsers },
                          { name: "Hotels", value: stats.totalHotels },
                          { name: "Rooms", value: stats.totalRooms },
                          { name: "Bookings", value: stats.totalBookings },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {activeSection === "bookings" && (
                <div className="table-wrap">
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Guest</th>
                          <th>Hotel</th>
                          <th>Room Type</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "var(--text2)" }}>
                              No bookings found
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b, idx) => (
                            <tr key={b.id}>
                              <td>#{idx + 1}</td>
                              <td>{b.userName || "—"}</td>
                              <td>{b.hotelName || "—"}</td>
                              <td>{b.roomType || "—"}</td>
                              <td>{b.checkInDate || b.checkIn || "—"}</td>
                              <td>{b.checkOutDate || b.checkOut || "—"}</td>
                              <td>₹{(b.totalPrice || b.amount || 0).toLocaleString()}</td>
                              <td>
                                <span
                                  className={`status ${
                                    b.status === "CONFIRMED"
                                      ? "status-confirmed"
                                      : b.status === "CANCELLED"
                                      ? "status-cancelled"
                                      : "status-pending"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === "users" && (
                <div className="table-wrap">
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text2)" }}>
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u, idx) => (
                            <tr key={u.id}>
                              <td>#{idx + 1}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)",
                                      color: "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 700,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {u.name?.[0]?.toUpperCase() || "U"}
                                  </div>
                                  <div>{u.name}</div>
                                </div>
                              </td>
                              <td>{u.email}</td>
                              <td>
                                <span className={`badge ${u.role === "ADMIN" ? "badge-dark" : "badge-info"}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                {u.role !== "ADMIN" && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    style={{
                                      width: 30,
                                      height: 30,
                                      borderRadius: 6,
                                      border: "1.5px solid #FECACA",
                                      background: "#FFF1F2",
                                      color: "#EF4444",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === "hotels" && (
                <div className="table-wrap">
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Hotel</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHotels.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text2)" }}>
                              No hotels found
                            </td>
                          </tr>
                        ) : (
                          filteredHotels.map((h, idx) => (
                            <tr key={h.id}>
                              <td>#{idx + 1}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <img
                                    src={
                                      h.imageUrl ||
                                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70"
                                    }
                                    alt={h.name}
                                    style={{
                                      width: 52,
                                      height: 38,
                                      borderRadius: 8,
                                      objectFit: "cover",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{h.name}</div>
                                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                                      {h.description || "No description"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{h.city || "—"}</td>
                              <td>{h.state || "—"}</td>
                              <td>{h.rating ?? "—"}</td>
                              <td>
                                <button
                                  onClick={() => handleDeleteHotel(h.id)}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 6,
                                    border: "1.5px solid #FECACA",
                                    background: "#FFF1F2",
                                    color: "#EF4444",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {hotelModal && (
        <div
          className="modal-bg"
          onClick={() => setHotelModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1200,
            padding: 20,
          }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              boxShadow: "var(--shadow-xl)",
              overflow: "hidden",
            }}
          >
            <div
              className="modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="modal-title" style={{ fontWeight: 800, color: "var(--text)" }}>
                Add New Hotel
              </span>
              <div
                className="modal-close"
                onClick={() => setHotelModal(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  background: "var(--surface2)",
                }}
              >
                <X size={18} />
              </div>
            </div>

            <div className="modal-body" style={{ padding: 20 }}>
              {[
                ["Hotel Name *", "name", "The Grand Palace", "text"],
                ["City *", "city", "Mumbai", "text"],
                ["State", "state", "Maharashtra", "text"],
                ["Image URL", "imageUrl", "https://...", "text"],
                ["Rating (0-5)", "rating", "4.5", "number"],
              ].map(([label, key, ph, type]) => (
                <div className="form-group" key={key} style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ display: "block", marginBottom: 7, fontWeight: 600 }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={newHotel[key]}
                    onChange={(e) => setNewHotel((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph}
                    className="form-control"
                    min={type === "number" ? 0 : undefined}
                    max={type === "number" ? 5 : undefined}
                    step={type === "number" ? "0.1" : undefined}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label" style={{ display: "block", marginBottom: 7, fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={newHotel.description}
                  onChange={(e) => setNewHotel((p) => ({ ...p, description: e.target.value }))}
                  placeholder="A luxury hotel offering world-class amenities."
                  className="form-control"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                padding: 20,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button onClick={() => setHotelModal(false)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button onClick={handleAddHotel} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Hotel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}