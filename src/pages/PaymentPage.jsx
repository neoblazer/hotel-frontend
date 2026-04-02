import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Shield, Check } from "lucide-react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const booking = location.state || null;
  if (!booking) {
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
              color: "var(--text)",
            }}
          >
            <h2 style={{ marginBottom: 10 }}>No payment session found</h2>
            <p style={{ color: "var(--text2)", marginBottom: 20 }}>
              Please create a booking first.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/hotels")}>
              Browse Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [method, setMethod] = useState("card"); // card | upi | qr
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upi, setUpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const amount = booking?.amount || 0;

  const paytmQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=8008152284@ptsbi&pn=SmartStay Vizag&am=${amount}&cu=INR&tn=Hotel Booking Payment`
  )}`;

  const formatCard = (v) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const handlePay = async () => {
    if (!booking?.bookingId) {
      toast.error("Booking ID not found. Please create the booking again.");
      return;
    }

    setLoading(true);
    try {
      await API.post(`/payment/pay/${booking.bookingId}`);
      toast.success("Payment successful");
      navigate("/booking-success", { state: booking });
    } catch (err) {
      const msg = err.response?.data?.message || "Payment failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiIntent = async () => {
    try {
      const res = await API.get("/payment/upi-link", { params: { amount } });
      const link = res.data?.data;
      if (link) {
        window.location.href = link;
      } else {
        toast.error("Unable to generate UPI link");
      }
    } catch {
      toast.error("Unable to generate UPI link");
    }
  };

  return (
    <div
      style={{
        paddingTop: 80,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="container" style={{ maxWidth: 1100, paddingBottom: 64 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 900 ? "1fr" : "1.15fr 0.85fr",
            gap: 28,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              boxShadow: "var(--shadow-lg)",
              padding: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(14,165,233,.12)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CreditCard size={22} color="var(--primary)" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    margin: 0,
                    fontFamily: "var(--font-serif)",
                    fontWeight: 400,
                  }}
                >
                  Complete Payment
                </h1>
                <p style={{ margin: "6px 0 0", color: "var(--text2)" }}>
                  Secure checkout for SmartStay Vizag
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { key: "card", label: "Card" },
                { key: "upi", label: "UPI" },
                { key: "qr", label: "QR Code" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: `1px solid ${method === m.key ? "var(--primary)" : "var(--border)"}`,
                    background: method === m.key ? "rgba(14,165,233,.1)" : "var(--surface2)",
                    color: "var(--text)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div style={{ display: "grid", gap: 14 }}>
                <input
                  placeholder="Cardholder Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Card Number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  className="input"
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    className="input"
                  />
                  <input
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) =>
                      setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })
                    }
                    className="input"
                  />
                </div>
              </div>
            )}

            {method === "upi" && (
              <div style={{ display: "grid", gap: 14 }}>
                <input
                  placeholder="Enter UPI ID"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  className="input"
                />
                <button onClick={handleUpiIntent} className="btn btn-outline">
                  Open UPI App
                </button>
              </div>
            )}

            {method === "qr" && (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  background: "var(--surface2)",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={paytmQrUrl}
                  alt="UPI QR"
                  style={{ width: 220, height: 220, objectFit: "contain", borderRadius: 16 }}
                />
                <p style={{ marginTop: 14, color: "var(--text2)" }}>
                  Scan using any UPI app to pay SmartStay Vizag
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text2)",
                fontSize: 14,
              }}
            >
              <Shield size={16} />
              <span>Your payment information is processed securely.</span>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 22 }}
            >
              {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
            </button>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              boxShadow: "var(--shadow-lg)",
              padding: 24,
              height: "fit-content",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 18,
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: 24,
              }}
            >
              Booking Summary
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              <Row label="Hotel" value={booking.hotelName || "Sample Hotel"} />
              <Row label="Room" value={booking.roomName || "Deluxe Room"} />
              <Row label="Check-in" value={booking.checkIn || "—"} />
              <Row label="Check-out" value={booking.checkOut || "—"} />
              <Row label="Nights" value={booking.nights || 1} />
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span>₹{amount.toLocaleString()}</span>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 16,
                background: "rgba(16,185,129,.08)",
                color: "var(--text)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Check size={18} color="var(--success)" />
              <span style={{ fontSize: 14 }}>
                Your booking will be confirmed immediately after successful payment.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ color: "var(--text2)" }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: "right" }}>{value}</span>
    </div>
  );
}