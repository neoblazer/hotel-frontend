import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    name: "Mumbai",
    description: "Luxury hotels, business hubs, nightlife, and iconic sea views.",
    hotels: 320,
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80",
  },
  {
    name: "Delhi",
    description: "Historic landmarks, premium stays, and vibrant city culture.",
    hotels: 280,
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=80",
  },
  {
    name: "Goa",
    description: "Beach resorts, coastal escapes, and unforgettable sunsets.",
    hotels: 190,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=80",
  },
  {
    name: "Jaipur",
    description: "Heritage palaces, royal stays, and colorful local charm.",
    hotels: 145,
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=900&q=80",
  },
  {
    name: "Kerala",
    description: "Backwaters, wellness resorts, and scenic nature retreats.",
    hotels: 210,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=80",
  },
  {
    name: "Manali",
    description: "Mountain stays, cool weather, and peaceful Himalayan views.",
    hotels: 89,
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&q=80",
  },
];

export default function Destinations() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 50 }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--primary)",
              marginBottom: 8,
            }}
          >
            Explore India
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px,4vw,46px)", margin: 0 }}>
            Top Destinations
          </h1>
          <p style={{ marginTop: 8, color: "var(--text2)", maxWidth: 700 }}>
            Browse the most loved destinations and jump directly into hotel results for each city.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 22,
          }}
        >
          {DESTINATIONS.map((d) => (
            <div
              key={d.name}
              className="card"
              style={{ overflow: "hidden", cursor: "pointer" }}
              onClick={() => navigate(`/hotels?city=${encodeURIComponent(d.name)}`)}
            >
              <div style={{ position: "relative", height: 220 }}>
                <img
                  src={d.image}
                  alt={d.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.08))",
                  }}
                />
                <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, color: "white" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>{d.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.86 }}>{d.hotels} hotels available</div>
                </div>
              </div>

              <div style={{ padding: 18 }}>
                <p style={{ color: "var(--text2)", minHeight: 48 }}>{d.description}</p>

                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Explore Hotels <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}