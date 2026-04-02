import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Wind,
  Car,
  Dumbbell,
  Users,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { getRoomsByHotel, getHotelById, createBooking } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AMENITY_ICONS = {
  WiFi: <Wifi size={13} />,
  AC: <Wind size={13} />,
  TV: <Tv size={13} />,
  "Coffee Maker": <Coffee size={13} />,
  Gym: <Dumbbell size={13} />,
  Parking: <Car size={13} />,
};

const parseAmenities = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((a) => a.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((a) => a.trim()).filter(Boolean);
  return [];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

export default function Rooms() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(Number(searchParams.get("guests") || 1));
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
    );
  }, [checkIn, checkOut]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hotelData, roomData] = await Promise.all([
          getHotelById(hotelId),
          getRoomsByHotel(hotelId),
        ]);

        setHotel(hotelData || null);
        setRooms(Array.isArray(roomData) ? roomData : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load hotel details");
        setHotel(null);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hotelId, toast]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (guests > 0 && room.capacity && room.capacity < guests) return false;
      return true;
    });
  }, [rooms, guests]);

  const handleBook = async (room) => {
    if (!isLoggedIn) {
      toast.warning("Please login to book a room");
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (checkIn < today) {
      toast.error("Check-in cannot be in the past");
      return;
    }

    if (guests > 0 && room.capacity && room.capacity < guests) {
      toast.error("Selected room cannot accommodate this many guests");
      return;
    }

    setBookingLoadingId(room.id);

    try {
      const booking = await createBooking({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomId: room.id,
      });

      toast.success("Booking created successfully");

      navigate("/payment", {
        state: {
          bookingId: booking?.id,
          checkIn,
          checkOut,
          guests,
          amount: (room.basePrice || 0) * nights,
          hotelName: hotel?.name,
          roomName: room.type,
          nights,
        },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 70 }}>
        <div className="skeleton" style={{ height: 320 }} />
        <div className="container" style={{ paddingTop: 24 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 180, borderRadius: 16, marginBottom: 18 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ paddingTop: 90, minHeight: "100vh", background: "var(--bg)" }}>
        <div className="container">
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 40,
              textAlign: "center",
            }}
          >
            <h2>Hotel not found</h2>
            <button className="btn btn-primary" onClick={() => navigate("/hotels")}>
              Back to Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: 70,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: 260,
          height: "40vw",
          maxHeight: 360,
          overflow: "hidden",
        }}
      >
        <img
          src={hotel.imageUrl || fallbackImage}
          alt={hotel.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.18))",
          }}
        />
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.16)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 999,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
            color: "white",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
            }}
          >
            {hotel.name}
          </h1>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span>
              <MapPin size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {hotel.city}, {hotel.state}
            </span>
            <span>★ {hotel.rating || "—"}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 14,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <div className="input" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} />
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
                color: "var(--text)",
              }}
            />
          </div>

          <div className="input" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} />
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
                color: "var(--text)",
              }}
            />
          </div>

          <div className="input" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                background: "transparent",
                color: "var(--text)",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="input" style={{ display: "flex", alignItems: "center" }}>
            {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Select dates"}
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 40,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 8 }}>No matching rooms available</h3>
            <p style={{ color: "var(--text2)" }}>
              Try changing guest count or browse another hotel.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {filteredRooms.map((room) => {
              const amenities = parseAmenities(room.amenities);

              return (
                <div
                  key={room.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      window.innerWidth <= 900
                        ? "1fr"
                        : "minmax(240px, 320px) 1fr",
                    gap: 18,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={room.imageUrl || hotel.imageUrl || fallbackImage}
                    alt={room.type}
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 220,
                      objectFit: "cover",
                    }}
                  />

                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 14,
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 24 }}>{room.type}</h3>
                        <p style={{ margin: "8px 0 0", color: "var(--text2)" }}>
                          Capacity: {room.capacity || "—"} guest(s)
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>Per night</div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: "var(--primary)",
                          }}
                        >
                          ₹{(room.basePrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        marginTop: 16,
                      }}
                    >
                      {amenities.map((a) => (
                        <span key={a} className="badge badge-primary">
                          {AMENITY_ICONS[a] || null} {a}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginTop: 22,
                      }}
                    >
                      <div style={{ color: "var(--text2)" }}>
                        {room.totalRooms} room(s) available in inventory
                      </div>

                      <button
                        className="btn btn-primary"
                        disabled={bookingLoadingId === room.id}
                        onClick={() => handleBook(room)}
                      >
                        {bookingLoadingId === room.id ? "Booking..." : "Book Now"}
                      </button>
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