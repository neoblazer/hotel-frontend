import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Search, SlidersHorizontal, Map, Grid, Heart } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getHotels,
  searchHotels,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CITY_COORDS = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Goa: { lat: 15.4989, lng: 73.8278 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Vizag: { lat: 17.6868, lng: 83.2185 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
};

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80";

const isMobile = () => window.innerWidth <= 768;

const StarRow = ({ rating }) => (
  <span style={{ color: "#FFB400", fontSize: 13 }}>
    {"★".repeat(Math.floor(rating || 0))}
    {"☆".repeat(5 - Math.floor(rating || 0))}
  </span>
);


export default function Hotels() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { isLoggedIn } = useAuth();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistBusyId, setWishlistBusyId] = useState(null);

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [maxPrice, setMaxPrice] = useState(25000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(!isMobile());
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const deal = searchParams.get("deal") || "";
  useEffect(() => {
    loadHotels();
  }, [page]);

  useEffect(() => {
    if (isLoggedIn) {
      loadWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}
      );
    }
  }, []);
  
  useEffect(() => {
    const qCity = searchParams.get("city") || "";
    const qDeal = searchParams.get("deal") || "";

    if (qCity) setCity(qCity);

    if (qDeal === "top-rated") {
      setMinRating(4.5);
      setSortBy("rating");
    } else if (qDeal === "budget") {
      setSortBy("priceLow");
      setMaxPrice(5000);
    } else if (qDeal === "luxury") {
      setSortBy("priceHigh");
      setMinRating(4);
    }
  }, [searchParams]);

  const loadWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlistIds(Array.isArray(data) ? data.map((item) => item.hotelId) : []);
    } catch {
      setWishlistIds([]);
    }
  };

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await getHotels({ page, size: 12 });
      setHotels(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load hotels");
      setHotels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setPage(0);
    try {
      const params = { page: 0, size: 100 };
      if (city.trim()) params.city = city.trim();
      if (minRating > 0) params.rating = minRating;

      const data = await searchHotels(params);
      setHotels(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Search failed");
      setHotels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return +(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1);
  };

  const toggleWish = async (hotel, e) => {
    e?.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Please login to use wishlist");
      navigate("/login");
      return;
    }

    const exists = wishlistIds.includes(hotel.id);
    setWishlistBusyId(hotel.id);

    try {
      if (exists) {
        await removeFromWishlist(hotel.id);
        setWishlistIds((prev) => prev.filter((id) => id !== hotel.id));
        toast.info("Removed from wishlist");
      } else {
        await addToWishlist(hotel.id);
        setWishlistIds((prev) => [...prev, hotel.id]);
        toast.success("Added to wishlist ❤️");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Wishlist update failed");
    } finally {
      setWishlistBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    let list = hotels
      .filter((h) => !city || h.city?.toLowerCase().includes(city.toLowerCase()))
      .filter((h) => (h.rating || 0) >= minRating)
      .filter((h) => h.minPrice == null || h.minPrice <= maxPrice)
      .map((h) => {
        const coords = CITY_COORDS[h.city] || CITY_COORDS[h.state];
        const distance =
          userLocation && coords
            ? getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : null;

        return {
          ...h,
          lat: coords?.lat,
          lng: coords?.lng,
          distance,
        };
      });

    if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "priceLow") {
      list.sort(
        (a, b) =>
          (a.minPrice ?? Number.MAX_SAFE_INTEGER) -
          (b.minPrice ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => (b.minPrice ?? -1) - (a.minPrice ?? -1));
    } else if (sortBy === "distance") {
      list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    }

    return list;
  }, [hotels, city, minRating, maxPrice, sortBy, userLocation]);

  return (
    <div style={{ paddingTop: 70, minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 50 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 34 }}>
              Explore Hotels
            </h1>
            <p style={{ margin: "6px 0 0", color: "var(--text2)" }}>
              Browse live hotel data from your database
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-outline" onClick={() => setFiltersOpen((v) => !v)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button
              className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              className={`btn ${viewMode === "map" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setViewMode("map")}
            >
              <Map size={16} /> Map
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 14,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city"
              className="input"
            />

            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="input">
              <option value={0}>All ratings</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={4.5}>4.5+ stars</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
              <option value="rating">Top rated</option>
              <option value="priceLow">Price: low to high</option>
              <option value="priceHigh">Price: high to low</option>
              <option value="distance">Nearest first</option>
            </select>

            <div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 6 }}>
                Max price: ₹{maxPrice.toLocaleString()}
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <button className="btn btn-primary" onClick={handleSearch}>
              <Search size={16} /> Search
            </button>
          </div>
        )}

        {viewMode === "map" ? (
          <div
            style={{
              height: isMobile() ? 420 : 580,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered
                .filter((h) => h.lat && h.lng)
                .map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]}>
                    <Popup>
                      <div style={{ minWidth: 200 }}>
                        <img
                          src={h.imageUrl || fallbackImage}
                          alt={h.name}
                          style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, marginBottom: 10 }}
                        />
                        <div style={{ fontWeight: 700 }}>{h.name}</div>
                        <div style={{ fontSize: 13, margin: "4px 0 8px" }}>
                          📍 {h.city}, {h.state}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                            {h.minPrice != null
                              ? `₹${h.minPrice.toLocaleString()}/night`
                              : "Price unavailable"}
                          </span>
                          <span style={{ color: "#FFB400" }}>★ {h.rating || "—"}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/rooms/${h.id}`)}
                          style={{
                            width: "100%",
                            padding: "9px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View Rooms
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 220 }} />
                <div style={{ padding: 18 }}>
                  <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 12, width: "30%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 24px", background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No hotels found</h3>
            <p style={{ color: "var(--text2)", marginBottom: 18 }}>
              Add hotels in your admin panel or broaden the search.
            </p>
            <button className="btn btn-primary" onClick={loadHotels}>Reload</button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {filtered.map((hotel) => {
                const isFav = wishlistIds.includes(hotel.id);

                return (
                  <div
                    key={hotel.id}
                    onClick={() => navigate(`/rooms/${hotel.id}`)}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 18,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "relative", height: 220 }}>
                      <img
                        src={hotel.imageUrl || fallbackImage}
                        alt={hotel.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        onClick={(e) => toggleWish(hotel, e)}
                        disabled={wishlistBusyId === hotel.id}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.4)",
                          background: "rgba(15,23,42,0.55)",
                          color: isFav ? "#FF4D6D" : "white",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          opacity: wishlistBusyId === hotel.id ? 0.7 : 1,
                        }}
                      >
                        <Heart size={18} fill={isFav ? "#FF4D6D" : "none"} />
                      </button>
                    </div>

                    <div style={{ padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 20 }}>{hotel.name}</h3>
                        <div style={{ whiteSpace: "nowrap" }}>
                          <StarRow rating={hotel.rating} />
                        </div>
                      </div>

                      <div style={{ color: "var(--text2)", marginBottom: 10 }}>
                        <MapPin size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        {hotel.city}, {hotel.state}
                      </div>

                      <p style={{ color: "var(--text2)", minHeight: 42 }}>
                        {hotel.description || "Comfortable stay with modern amenities."}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text3)" }}>Starting from</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
                            {hotel.minPrice != null
                              ? `₹${hotel.minPrice.toLocaleString()}`
                              : "Price unavailable"}
                          </div>
                        </div>

                        <button className="btn btn-primary">View Rooms</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </button>
                <div style={{ display: "grid", placeItems: "center", minWidth: 90, color: "var(--text2)" }}>
                  Page {page + 1} / {totalPages}
                </div>
                <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}