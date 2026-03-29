import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Shield, Check } from "lucide-react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

// Your Paytm QR image - replace with your actual QR code image path
const PAYTM_QR = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=your-upi@paytm&pn=StayLux&cu=INR";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const booking = location.state || { amount: 5000, hotelName: "Sample Hotel", roomName: "Deluxe Room", nights: 1, checkIn: "2025-06-01", checkOut: "2025-06-02" };

  const [method, setMethod] = useState("card"); // card | upi | qr
  const [card, setCard] = useState({ number:"", expiry:"", cvv:"", name:"" });
  const [upi, setUpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=details 2=confirm

  const formatCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = (v) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  const handlePay = async () => {
    setLoading(true);
    try {
      await API.post(`/payment/pay/${booking.bookingId}`, {});
      navigate("/booking-success", { state: booking });
    } catch {
      // Demo mode
      setTimeout(() => { navigate("/booking-success", { state: booking }); }, 1200);
    }
  };

  const taxAmount = Math.round(booking.amount * 0.12);
  const total = booking.amount + taxAmount;

  return (
    <div style={{ paddingTop:70, minHeight:"100vh", background:"#F9FAFB" }}>
      <div className="container" style={{ paddingTop:40, paddingBottom:64 }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          {/* Steps */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:40 }}>
            {["Review","Payment","Confirmed"].map((s,i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: step>i?"#10B981":step===i+1?"#FF385C":"#E5E7EB", color: step>i||step===i+1?"white":"#9CA3AF", fontSize:14, fontWeight:700 }}>
                    {step>i ? <Check size={15}/> : i+1}
                  </div>
                  <span style={{ fontSize:14, fontWeight:600, color: step===i+1?"#111827":"#9CA3AF" }}>{s}</span>
                </div>
                {i<2 && <div style={{ width:40, height:2, background: step>i+1?"#10B981":"#E5E7EB", borderRadius:99 }}/>}
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:28, alignItems:"start" }}>
            {/* Payment Form */}
            <div>
              <div style={{ background:"white", borderRadius:16, border:"1px solid #E5E7EB", padding:28, marginBottom:20 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:24 }}>Choose Payment Method</h2>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:28 }}>
                  {[["card","💳","Credit/Debit Card"],["upi","📱","UPI"],["qr","🔲","Paytm QR"]].map(([v,i,l]) => (
                    <button key={v} onClick={() => setMethod(v)} style={{ padding:"16px 12px", border:`2px solid ${method===v?"#FF385C":"#E5E7EB"}`, borderRadius:12, background: method===v?"#FFF1F2":"white", cursor:"pointer", transition:"all .2s", textAlign:"center" }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{i}</div>
                      <div style={{ fontSize:13, fontWeight:600, color: method===v?"#FF385C":"#374151" }}>{l}</div>
                    </button>
                  ))}
                </div>

                {method === "card" && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input value={card.name} onChange={e=>setCard(p=>({...p,name:e.target.value}))} placeholder="John Doe" className="form-control"/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <div className="input-wrap">
                        <span className="input-icon-l"><CreditCard size={16}/></span>
                        <input value={card.number} onChange={e=>setCard(p=>({...p,number:formatCard(e.target.value)}))} placeholder="1234 5678 9012 3456" className="form-control has-icon-l" maxLength={19}/>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:formatExpiry(e.target.value)}))} placeholder="MM/YY" className="form-control"/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="•••" className="form-control" type="password"/>
                      </div>
                    </div>
                  </div>
                )}

                {method === "upi" && (
                  <div className="form-group">
                    <label className="form-label">UPI ID</label>
                    <input value={upi} onChange={e=>setUpi(e.target.value)} placeholder="yourname@paytm / yourname@upi" className="form-control"/>
                    <div className="form-hint">Enter your registered UPI ID</div>
                  </div>
                )}

                {method === "qr" && (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <div style={{ background:"#F9FAFB", border:"2px dashed #E5E7EB", borderRadius:16, padding:28, display:"inline-block" }}>
                      <img src={PAYTM_QR} alt="Paytm QR Code" style={{ width:200, height:200, borderRadius:8 }}/>
                    </div>
                    <p style={{ marginTop:16, fontSize:14, color:"#6B7280" }}>Scan with Paytm or any UPI app</p>
                    <p style={{ fontSize:18, fontWeight:700, color:"#111827", marginTop:6 }}>₹{total.toLocaleString()}</p>
                    <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>After scanning, click "I've Paid" below</p>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:8, color:"#6B7280", fontSize:13, marginBottom:16 }}>
                <Shield size={16} color="#10B981"/> Your payment is secured with 256-bit SSL encryption
              </div>

              <button onClick={handlePay} disabled={loading} className="btn btn-primary btn-block btn-xl">
                {loading ? (
                  <><span style={{ width:20,height:20,border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/> Processing Payment...</>
                ) : method==="qr" ? "I've Paid – Confirm Booking" : `Pay ₹${total.toLocaleString()}`}
              </button>
            </div>

            {/* Order Summary */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #E5E7EB", padding:24, position:"sticky", top:100 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:20 }}>Booking Summary</h3>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80" style={{ width:"100%", height:140, objectFit:"cover", borderRadius:12, marginBottom:16 }}/>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{booking.hotelName}</div>
              <div style={{ fontSize:14, color:"#6B7280", marginBottom:16 }}>{booking.roomName}</div>

              <div style={{ background:"#F9FAFB", borderRadius:10, padding:14, marginBottom:16, fontSize:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"#6B7280" }}>Check-in</span><strong>{booking.checkIn}</strong>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"#6B7280" }}>Check-out</span><strong>{booking.checkOut}</strong>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"#6B7280" }}>Duration</span><strong>{booking.nights} night{booking.nights>1?"s":""}</strong>
                </div>
              </div>

              <div style={{ borderTop:"1px solid #E5E7EB", paddingTop:16 }}>
                {[["Room charges",`₹${booking.amount?.toLocaleString()}`],["GST (12%)",`₹${taxAmount.toLocaleString()}`]].map(([l,v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:10 }}>
                    <span style={{ color:"#6B7280" }}>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:700, borderTop:"1px solid #E5E7EB", paddingTop:12, marginTop:4 }}>
                  <span>Total</span><span style={{ color:"#FF385C" }}>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginTop:16, padding:"10px 14px", background:"#ECFDF5", borderRadius:8, fontSize:13, color:"#059669", display:"flex", alignItems:"center", gap:8 }}>
                <Check size={14}/> Free cancellation before check-in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}