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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
      } else {
        setStats({
          totalUsers: 0,
          totalHotels: 0,
          totalRooms: 0,
          totalBookings: 0,
          totalRevenue: 0,
        });
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
      loadAll();
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
      loadAll();
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
      const status = b.status?.toLowerCase() || "";
      return guest.includes(q) || hotel.includes(q) || room.includes(q) || status.includes(q);
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

  const monthlyData = useMemo(() => {
    const now = new Date();
    const points = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      const monthBookings = bookings.filter((b) => {
        if (!b.checkInDate) return false;
        const bd = new Date(b.checkInDate);
        return (
          bd.getFullYear() === year &&
          bd.getMonth() === monthIndex &&
          b.status !== "CANCELLED"
        );
      });

      points.push({
        month: MONTHS[monthIndex],
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
      });
    }

    return points;
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.checkInDate || 0) - new Date(a.checkInDate || 0))
      .slice(0, 5);
  }, [bookings]);

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
      color: "#0284C7",
    },
  ];

  if (loading) {
    return (
      <div style={{ paddingTop: 70, minHeight: "100vh", background: "var(--bg)" }}>
        <div className="container" style={{ paddingTop: 28 }}>
          <div className="skeleton" style={{ height: 48, width: 260, marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 18, marginBottom: 22 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 22 }}>
            <div className="skeleton" style={{ height: 320, borderRadius: 18 }} />
            <div className="skeleton" style={{ height: 320, borderRadius: 18 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 70, minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 34 }}>
              Admin Dashboard
            </h1>
            <p style={{ marginTop: 6, color: "var(--text2)" }}>
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => setHotelModal(true)}>
              <Plus size={16} /> Add Hotel
            </button>
            <button className="btn btn-outline" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 900 ? "1fr" : "240px 1fr",
            gap: 22,
          }}
        >
          {/* Sidebar */}
          <div
            className="card"
            style={{
              padding: 14,
              height: "fit-content",
              position: window.innerWidth <= 900 ? "static" : "sticky",
              top: 88,
            }}
          >
            {NAV.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    marginBottom: 8,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: active ? "var(--primary)" : "transparent",
                    color: active ? "white" : "var(--text)",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge != null && (
                    <span
                      style={{
                        minWidth: 24,
                        height: 24,
                        borderRadius: 99,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        background: active ? "rgba(255,255,255,0.18)" : "var(--surface2)",
                        color: active ? "white" : "var(--text2)",
                        padding: "0 6px",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main */}
          <div>
            {(activeSection === "bookings" || activeSection === "users" || activeSection === "hotels") && (
              <div
                className="card"
                style={{
                  padding: 14,
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Search size={16} color="var(--text2)" />
                <input
                  className="input"
                  placeholder={`Search ${activeSection}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", background: "transparent", boxShadow: "none" }}
                />
              </div>
            )}

            {activeSection === "overview" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 18,
                    marginBottom: 22,
                  }}
                >
                  {statCards.map((card) => (
                    <div key={card.title} className="card" style={{ padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>
                            {card.title}
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
                        </div>

                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            background: card.bg,
                            color: card.color,
                            flexShrink: 0,
                          }}
                        >
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: window.innerWidth <= 1100 ? "1fr" : "1.35fr 1fr",
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: window.innerWidth <= 1100 ? "1fr" : "1fr 1fr",
                    gap: 22,
                  }}
                >
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
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
                      Recent Bookings
                    </div>

                    {recentBookings.length === 0 ? (
                      <p style={{ color: "var(--text2)" }}>No bookings yet.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 12 }}>
                        {recentBookings.map((b) => (
                          <div
                            key={b.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                              paddingBottom: 12,
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>{b.hotelName}</div>
                              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                                {b.userName} • {b.roomType}
                              </div>
                            </div>
                            <div
                              className={`status ${
                                b.status === "CONFIRMED"
                                  ? "status-confirmed"
                                  : b.status === "PENDING"
                                  ? "status-pending"
                                  : "status-cancelled"
                              }`}
                            >
                              {b.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === "bookings" && (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 16 }}>Bookings</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Hotel</th>
                        <th>Room</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", color: "var(--text2)" }}>
                            No bookings found
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.userName}</td>
                            <td>{b.hotelName}</td>
                            <td>{b.roomType}</td>
                            <td>{b.checkInDate}</td>
                            <td>{b.checkOutDate}</td>
                            <td>₹{Number(b.totalPrice || 0).toLocaleString()}</td>
                            <td>
                              <span
                                className={`status ${
                                  b.status === "CONFIRMED"
                                    ? "status-confirmed"
                                    : b.status === "PENDING"
                                    ? "status-pending"
                                    : "status-cancelled"
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
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 16 }}>Users</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--text2)" }}>
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 size={14} /> Delete
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

            {activeSection === "hotels" && (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 16 }}>Hotels</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Rating</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHotels.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", color: "var(--text2)" }}>
                            No hotels found
                          </td>
                        </tr>
                      ) : (
                        filteredHotels.map((h) => (
                          <tr key={h.id}>
                            <td>{h.id}</td>
                            <td>{h.name}</td>
                            <td>{h.city}</td>
                            <td>{h.state}</td>
                            <td>{h.rating ?? "—"}</td>
                            <td>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleDeleteHotel(h.id)}
                              >
                                <Trash2 size={14} /> Delete
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
          </div>
        </div>

        {hotelModal && (
          <div className="modal-bg" onClick={() => setHotelModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Add Hotel</div>
                <button className="modal-close" onClick={() => setHotelModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      className="form-control"
                      value={newHotel.city}
                      onChange={(e) => setNewHotel((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      className="form-control"
                      value={newHotel.state}
                      onChange={(e) => setNewHotel((p) => ({ ...p, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={newHotel.description}
                    onChange={(e) => setNewHotel((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    className="form-control"
                    value={newHotel.imageUrl}
                    onChange={(e) => setNewHotel((p) => ({ ...p, imageUrl: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="form-control"
                    value={newHotel.rating}
                    onChange={(e) => setNewHotel((p) => ({ ...p, rating: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setHotelModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddHotel}>
                  Add Hotel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}