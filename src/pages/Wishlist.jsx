import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, MapPin } from "lucide-react";

export default function Wishlist() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]"),
  );

  const remove = (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div
      style={{
        paddingTop: 70,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--surface2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={22} color="var(--primary)" fill="var(--primary)" />
          </div>

          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 30,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Your Wishlist
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              {favorites.length} hotel{favorites.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "100px 24px",
              background: "var(--surface)",
              borderRadius: 20,
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <Heart
              size={64}
              color="var(--border)"
              style={{ margin: "0 auto 20px" }}
            />
            <h3
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
                color: "var(--text)",
              }}
            >
              Your wishlist is empty
            </h3>
            <p style={{ color: "var(--text2)", marginBottom: 24 }}>
              Save hotels you love by clicking the heart icon
            </p>
            <button
              onClick={() => navigate("/hotels")}
              className="btn btn-primary"
            >
              Explore Hotels
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
              gap: 24,
            }}
          >
            {favorites.map((hotel) => (
              <div
                key={hotel.id}
                style={{
                  background: "var(--surface)",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  transition: "all .25s",
                  color: "var(--text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 200,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      hotel.imageUrl ||
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"
                    }
                    alt={hotel.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 50%)",
                    }}
                  />
                  <button
                    onClick={() => remove(hotel.id)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.9")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Heart
                      size={16}
                      color="var(--primary)"
                      fill="var(--primary)"
                    />
                  </button>
                </div>

                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 4,
                    }}
                  >
                    <MapPin size={11} />
                    {hotel.city}
                  </div>

                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "var(--text)",
                    }}
                  >
                    {hotel.name}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 14,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        ₹{(hotel.price || 2000).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text2)" }}>
                        /night
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/rooms/${hotel.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Book <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
