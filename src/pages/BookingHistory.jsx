import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, X, RefreshCw } from "lucide-react";
import { getMyBookings, cancelBooking, getBookingSummary } from "../services/api";
import { useToast } from "../context/ToastContext";

const HOTEL_IMAGES = {
  Taj: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&q=70",
  Grand: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&q=70",
  ITC: "https://images.unsplash.com/photo-1551882547-ff40c4a49f67?w=300&q=70",
  Beach: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210e9?w=300&q=70",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70",
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
  const [summary, setSummary] = useState({
    totalBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error(err?.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    }

    try {
      const sum = await getBookingSummary();
      if (sum) setSummary(sum);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }

    setLoading(false);
  };

  const computedSummary = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status !== "CANCELLED").length,
    cancelledBookings: bookings.filter((b) => b.status === "CANCELLED").length,
    totalSpent: bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((s, b) => s + (b.totalPrice || 0), 0),
  };

  const disp = summary.totalBookings > 0 ? summary : computedSummary;

  const cancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled successfully");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const statCards = [
    {
      label: "Total Bookings",
      value: disp.totalBookings,
      icon: "📋",
      bg: "#EFF6FF",
      color: "#2563EB",
    },
    {
      label: "Active",
      value: disp.activeBookings,
      icon: "✅",
      bg: "#ECFDF5",
      color: "#059669",
    },
    {
      label: "Cancelled",
      value: disp.cancelledBookings,
      icon: "❌",
      bg: "#FFF1F2",
      color: "#FF385C",
    },
    {
      label: "Total Spent",
      value: `₹${(disp.totalSpent || 0).toLocaleString()}`,
      icon: "💰",
      bg: "#FFFBEB",
      color: "#D97706",
    },
  ];

  return (
    <div style={{ paddingTop: 70, minHeight: "100vh", background: "var(--bg)" }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 4,
                color: "var(--text)",
              }}
            >
              My Bookings
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 15 }}>
              Track and manage all your reservations
            </p>
          </div>

          <button
            onClick={load}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              border: "1.5px solid var(--border)",
              borderRadius: 99,
              background: "var(--surface)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface)",
                borderRadius: 14,
                padding: 20,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 12,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 28 }}>
          {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((f) => {
            const cnt =
              f === "ALL" ? bookings.length : bookings.filter((b) => b.status === f).length;
            return (
              <div
                key={f}
                className={`tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                style={{ fontSize: 13 }}
              >
                {f} ({cnt})
              </div>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 130, borderRadius: 14 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 40,
              textAlign: "center",
            }}
          >
            <Calendar size={34} style={{ color: "var(--text3)", marginBottom: 12 }} />
            <h3 style={{ fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
              No bookings found
            </h3>
            <p style={{ color: "var(--text2)", marginBottom: 20 }}>
              You have not made any bookings yet.
            </p>
            <button onClick={() => navigate("/hotels")} className="btn btn-primary">
              Browse Hotels
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((b) => {
              const nights = nightsBetween(b.checkInDate, b.checkOutDate);
              const cancellable = b.status !== "CANCELLED";

              return (
                <div
                  key={b.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    gap: 18,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <img
                    src={getImg(b.hotelName)}
                    alt={b.hotelName}
                    style={{ width: "100%", height: "100%", minHeight: 180, objectFit: "cover" }}
                  />

                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 24,
                            fontFamily: "'Playfair Display', serif",
                            color: "var(--text)",
                          }}
                        >
                          {b.hotelName}
                        </h3>
                        <p style={{ margin: "6px 0 0", color: "var(--text2)" }}>
                          {b.roomType} Room
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "8px 14px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            b.status === "CONFIRMED"
                              ? "#ECFDF5"
                              : b.status === "CANCELLED"
                              ? "#FEF2F2"
                              : "#FFFBEB",
                          color:
                            b.status === "CONFIRMED"
                              ? "#059669"
                              : b.status === "CANCELLED"
                              ? "#DC2626"
                              : "#B45309",
                        }}
                      >
                        {b.status}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                        gap: 14,
                        marginTop: 18,
                      }}
                    >
                      <Info label="Check-in" value={b.checkInDate} />
                      <Info label="Check-out" value={b.checkOutDate} />
                      <Info label="Nights" value={nights} />
                      <Info label="Total" value={`₹${(b.totalPrice || 0).toLocaleString()}`} />
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                      {cancellable && (
                        <button
                          onClick={() => cancel(b.id)}
                          className="btn btn-outline"
                          disabled={cancelling === b.id}
                          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                        >
                          {cancelling === b.id ? "Cancelling..." : <>
                            <X size={16} /> Cancel Booking
                          </>}
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

function Info({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: "var(--text3)",
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{value}</div>
    </div>
  );
}