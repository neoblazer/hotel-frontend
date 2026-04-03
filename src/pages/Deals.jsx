import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, ArrowRight, Star, Percent } from "lucide-react";
import { getHotels } from "../services/api";
import { useToast } from "../context/ToastContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80";

export default function Deals() {
  const navigate = useNavigate();
  const toast = useToast();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await getHotels({ page: 0, size: 40 });
      setHotels(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load deals");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const dealSections = useMemo(() => {
    const list = [...hotels];

    const topRated = [...list]
      .filter((h) => (h.rating || 0) >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);

    const budget = [...list]
      .filter((h) => h.minPrice != null && h.minPrice <= 5000)
      .sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0))
      .slice(0, 6);

    const luxury = [...list]
      .filter((h) => h.minPrice != null && h.minPrice >= 8000)
      .sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0))
      .slice(0, 6);

    return { topRated, budget, luxury };
  }, [hotels]);

  const DealGrid = ({ title, subtitle, items, icon, query }) => (
    <section style={{ marginBottom: 38 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", marginBottom: 6 }}>
            {icon}
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Special Picks
            </span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 30 }}>{title}</h2>
          <p style={{ marginTop: 6, color: "var(--text2)" }}>{subtitle}</p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={() => navigate(query)}>
          View More <ArrowRight size={14} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 20, color: "var(--text2)" }}>
          No deals available in this section yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 20,
          }}
        >
          {items.map((hotel) => (
            <div
              key={hotel.id}
              className="card"
              style={{ overflow: "hidden", cursor: "pointer" }}
              onClick={() => navigate(`/rooms/${hotel.id}`)}
            >
              <div style={{ height: 200 }}>
                <img
                  src={hotel.imageUrl || fallbackImage}
                  alt={hotel.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 19 }}>{hotel.name}</h3>
                  <span style={{ color: "#FFB400", whiteSpace: "nowrap" }}>★ {hotel.rating || "—"}</span>
                </div>

                <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 10 }}>
                  {hotel.city}, {hotel.state}
                </div>

                <p style={{ color: "var(--text2)", minHeight: 42 }}>
                  {hotel.description || "Comfortable stay with modern amenities."}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>Starting from</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                      {hotel.minPrice != null ? `₹${hotel.minPrice.toLocaleString()}` : "—"}
                    </div>
                  </div>

                  <button className="btn btn-primary btn-sm">View Rooms</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 50 }}>
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(20,184,166,0.12)",
              color: "var(--primary-dark)",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Percent size={14} />
            Smart Deals
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px,4vw,46px)", margin: 0 }}>
            Best Hotel Deals
          </h1>
          <p style={{ marginTop: 8, color: "var(--text2)", maxWidth: 760 }}>
            Browse top-rated, budget-friendly, and luxury hotel picks from your live database.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 12, width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <DealGrid
              title="Top Rated Deals"
              subtitle="Best guest satisfaction and premium stays."
              items={dealSections.topRated}
              icon={<Star size={16} />}
              query="/hotels?deal=top-rated"
            />

            <DealGrid
              title="Budget Deals"
              subtitle="Great value stays at friendly prices."
              items={dealSections.budget}
              icon={<Tag size={16} />}
              query="/hotels?deal=budget"
            />

            <DealGrid
              title="Luxury Deals"
              subtitle="Premium stays for a lavish experience."
              items={dealSections.luxury}
              icon={<Percent size={16} />}
              query="/hotels?deal=luxury"
            />
          </>
        )}
      </div>
    </div>
  );
}