import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Search, ArrowRight } from "lucide-react";

const HERO_IMGS = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c4a49f67?w=1600&q=80",
];

const DESTINATIONS = [
  { name:"Mumbai", hotels:320, img:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80" },
  { name:"Delhi", hotels:280, img:"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80" },
  { name:"Goa", hotels:190, img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80" },
  { name:"Jaipur", hotels:145, img:"https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=600&q=80" },
  { name:"Kerala", hotels:210, img:"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80" },
  { name:"Manali", hotels:89, img:"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80" },
];

const FEATURED = [
  { id:1, name:"The Leela Palace", city:"Delhi", rating:4.9, reviews:2840, price:8500, img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", badge:"Top Pick" },
  { id:2, name:"Taj Mahal Hotel", city:"Mumbai", rating:4.8, reviews:5200, price:12000, img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", badge:"Luxe" },
  { id:3, name:"ITC Grand Chola", city:"Chennai", rating:4.7, reviews:1980, price:7200, img:"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80", badge:"Best Value" },
  { id:4, name:"Umaid Bhawan", city:"Jodhpur", rating:4.9, reviews:3100, price:15000, img:"https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80", badge:"Heritage" },
];

const Stars = ({ rating }) => (
  <span style={{ color:"#FFB400", fontSize:13 }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
  </span>
);

export default function Home() {
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("favorites") || "[]"));
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMGS.length), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const toggleWish = (hotel, e) => {
    e.stopPropagation();
    const isIn = wishlist.some(f => f.id === hotel.id);
    const updated = isIn ? wishlist.filter(f => f.id !== hotel.id) : [...wishlist, hotel];
    setWishlist(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", guests);
    navigate(`/hotels?${params}`);
  };

  return (
    <div style={{ background:"var(--bg)", color:"var(--text)" }}>
      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", position:"relative", display:"flex", alignItems:"center", overflow:"hidden" }}>
        {HERO_IMGS.map((img, i) => (
          <div key={i} style={{
            position:"absolute", inset:0, backgroundImage:`url(${img})`,
            backgroundSize:"cover", backgroundPosition:"center",
            opacity: i === heroIdx ? 1 : 0, transition:"opacity 1.2s ease",
          }}/>
        ))}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)" }}/>

        {/* Slide indicators */}
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:2 }}>
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{
              width: i === heroIdx ? 28 : 8, height:8, borderRadius:99,
              background: i === heroIdx ? "white" : "rgba(255,255,255,0.4)",
              border:"none", cursor:"pointer", transition:"all .3s",
            }}/>
          ))}
        </div>

        <div className="container" style={{ position:"relative", zIndex:2, textAlign:"center", paddingTop:80, paddingBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.25)", color:"white", fontSize:13, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", padding:"8px 20px", borderRadius:99, marginBottom:28 }}>
            🏆 &nbsp; India's Most Trusted Hotel Booking Platform
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px,6vw,76px)", fontWeight:900, color:"white", lineHeight:1.08, marginBottom:20 }}>
            Find Your Perfect<br/><span style={{ color:"var(--primary)" }}>Escape</span> Today
          </h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.8)", maxWidth:500, margin:"0 auto 48px", lineHeight:1.7 }}>
            Discover handpicked hotels across India. Best prices, instant booking, zero hassle.
          </p>

          {/* Search Box */}
          <div style={{ background:"var(--surface)", borderRadius:18, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", padding:"10px 10px 10px 10px", display:"flex", alignItems:"stretch", gap:4, maxWidth:860, width:"100%", margin:"0 auto" }}>
            {[
              {
                label:"Destination",
                icon:<MapPin size={16}/>,
                el: <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Where are you going?" style={{ border:"none", outline:"none", fontSize:15, background:"transparent", width:"100%", color:"var(--text)" }}/>
              },
              {
                label:"Check In",
                icon:<Calendar size={16}/>,
                el: <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} style={{ border:"none", outline:"none", fontSize:15, background:"transparent", width:"100%", color:"var(--text)" }}/>
              },
              {
                label:"Check Out",
                icon:<Calendar size={16}/>,
                el: <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} style={{ border:"none", outline:"none", fontSize:15, background:"transparent", width:"100%", color:"var(--text)" }}/>
              },
              {
                label:"Guests",
                icon:<Users size={16}/>,
                el: (
                  <select value={guests} onChange={e=>setGuests(e.target.value)} style={{ border:"none", outline:"none", fontSize:15, background:"transparent", width:"100%", color:"var(--text)" }}>
                    {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} Guest{n>1?"s":""}</option>)}
                  </select>
                )
              },
            ].map((f, i, arr) => (
              <div key={i} style={{ display:"flex" }}>
                <div
                  style={{ flex:1, display:"flex", flexDirection:"column", padding:"12px 16px", borderRadius:12, cursor:"text", minWidth: i===0?200:130 }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--surface2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text)", marginBottom:4, textTransform:"uppercase", letterSpacing:0.5, display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ color:"var(--primary)" }}>{f.icon}</span>{f.label}
                  </label>
                  {f.el}
                </div>
                {i < arr.length - 1 && <div style={{ width:1, background:"var(--border)", alignSelf:"stretch", margin:"8px 0" }}/>}
              </div>
            ))}
            <button
              onClick={handleSearch}
              style={{ background:"linear-gradient(135deg,var(--primary),var(--primary-dark))", color:"white", border:"none", borderRadius:12, padding:"0 28px", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0, transition:"all .2s", boxShadow:"0 4px 16px var(--primary-glow)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px var(--primary-glow)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px var(--primary-glow)"}}
            >
              <Search size={18}/> Search
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:48, marginTop:48, flexWrap:"wrap" }}>
            {[["10,000+","Hotels Listed"],["2M+","Happy Guests"],["500+","Cities"],["4.9★","Avg Rating"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:"white" }}>{n}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR DESTINATIONS ── */}
      <section className="section" style={{ background:"var(--bg)" }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:36, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--primary)", marginBottom:6 }}>Explore</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,38px)", fontWeight:700, color:"var(--text)" }}>Popular Destinations</h2>
              <p style={{ color:"var(--text2)", marginTop:6 }}>Discover top-rated stays across India's finest cities</p>
            </div>
            <button onClick={() => navigate("/hotels")} style={{ display:"flex", alignItems:"center", gap:6, fontWeight:700, fontSize:14, color:"var(--primary)", background:"none", border:"none", cursor:"pointer" }}>
              View all <ArrowRight size={16}/>
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:20 }}>
            {DESTINATIONS.map((d, i) => (
              <div key={d.name} onClick={() => navigate(`/hotels?city=${d.name}`)} style={{
                borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative",
                aspectRatio: i===0 ? "auto" : "4/5", gridRow: i===0 ? "span 2" : "auto",
                transition:"transform .25s, box-shadow .25s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow="0 20px 50px rgba(0,0,0,0.2)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
                <img src={d.img} alt={d.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)" }}/>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:20, color:"white" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize: i===0?26:20, fontWeight:700 }}>{d.name}</div>
                  <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>{d.hotels} hotels available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED HOTELS ── */}
      <section className="section" style={{ background:"var(--surface)" }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:36, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--primary)", marginBottom:6 }}>Handpicked</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,38px)", fontWeight:700, color:"var(--text)" }}>Featured Hotels</h2>
            </div>
            <button onClick={() => navigate("/hotels")} className="btn btn-outline btn-sm">View all hotels <ArrowRight size={15}/></button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
            {FEATURED.map(hotel => {
              const isFav = wishlist.some(f => f.id === hotel.id);
              return (
                <div key={hotel.id} onClick={() => navigate(`/rooms/${hotel.id}`)} className="card" style={{ cursor:"pointer", transition:"all .25s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.14)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=""}}>
                  <div style={{ position:"relative", height:220, overflow:"hidden" }}>
                    <img src={hotel.img} alt={hotel.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s" }}
                      onMouseEnter={e=>e.target.style.transform="scale(1.06)"}
                      onMouseLeave={e=>e.target.style.transform="none"}/>
                    <div style={{ position:"absolute", top:12, left:12 }}>
                      <span style={{ background:"var(--primary)", color:"white", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99 }}>{hotel.badge}</span>
                    </div>
                    <button onClick={e=>toggleWish(hotel,e)} style={{
                      position:"absolute", top:12, right:12, width:36, height:36, borderRadius:"50%",
                      background:"var(--surface)", border:"1px solid var(--border)", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, transition:"all .2s", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"
                    }}>
                      {isFav ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={{ padding:18 }}>
                    <div style={{ fontSize:12, color:"var(--text2)", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
                      <MapPin size={11}/> {hotel.city}
                    </div>
                    <div style={{ fontSize:17, fontWeight:700, marginBottom:8, color:"var(--text)" }}>{hotel.name}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                      <Stars rating={hotel.rating}/>
                      <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{hotel.rating}</span>
                      <span style={{ fontSize:12, color:"var(--text3)" }}>({hotel.reviews.toLocaleString()} reviews)</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:14, borderTop:"1px solid var(--border)" }}>
                      <div>
                        <span style={{ fontSize:11, color:"var(--text3)" }}>from </span>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"var(--text)" }}>₹{hotel.price.toLocaleString()}</span>
                        <span style={{ fontSize:12, color:"var(--text2)" }}>/night</span>
                      </div>
                      <button style={{ background:"var(--primary)", color:"white", border:"none", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Book Now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section" style={{ background:"var(--bg)" }}>
        <div className="container" style={{ textAlign:"center" }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--primary)", marginBottom:8 }}>Why StayLux</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,38px)", fontWeight:700, marginBottom:12, color:"var(--text)" }}>The StayLux Difference</h2>
          <p style={{ color:"var(--text2)", maxWidth:500, margin:"0 auto 56px", fontSize:16 }}>We go beyond booking to deliver unforgettable experiences</p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:32 }}>
            {[
              { icon:"🛡️", color:"var(--surface2)", title:"Secure Payments", text:"Bank-grade encryption protects every transaction you make on our platform." },
              { icon:"⚡", color:"rgba(16,185,129,0.12)", title:"Instant Confirmation", text:"Get immediate booking confirmation with real-time room availability checks." },
              { icon:"🏆", color:"rgba(245,158,11,0.12)", title:"Best Price Guarantee", text:"We match any lower price you find. No questions asked, full difference refunded." },
              { icon:"🎧", color:"rgba(14,165,233,0.12)", title:"24/7 Support", text:"Our hospitality experts are always on call to ensure your stay is perfect." },
            ].map(f => (
              <div key={f.title} style={{ padding:"32px 24px", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:20, background:f.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 20px" }}>{f.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, color:"var(--text)" }}>{f.title}</h3>
                <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background:"linear-gradient(135deg,var(--primary) 0%, var(--primary-dark) 100%)", padding:"80px 0" }}>
        <div className="container" style={{ textAlign:"center", color:"white" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,50px)", fontWeight:900, marginBottom:16 }}>
            Ready for Your Next Adventure?
          </h2>
          <p style={{ fontSize:18, opacity:0.85, marginBottom:36 }}>Join over 2 million travellers who trust StayLux</p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("/hotels")} style={{ padding:"16px 36px", borderRadius:99, background:"white", color:"var(--primary)", fontSize:16, fontWeight:700, border:"none", cursor:"pointer", transition:"all .2s", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              Explore Hotels
            </button>
            <button onClick={() => navigate("/signup")} style={{ padding:"16px 36px", borderRadius:99, background:"transparent", color:"white", fontSize:16, fontWeight:700, border:"2px solid rgba(255,255,255,0.6)", cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="white"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.6)"}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"var(--text)", color:"white", padding:"64px 0 32px" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:"var(--primary)", marginBottom:12 }}>Stay<span style={{color:"white"}}>Lux</span></div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:260 }}>India's premium hotel booking platform. Discover, book, and enjoy extraordinary stays.</p>
            </div>
            {[
              { title:"Company", links:["About Us","Careers","Blog","Press"] },
              { title:"Support", links:["Help Center","Safety","Cancellations","Contact"] },
              { title:"Legal",   links:["Privacy","Terms","Cookie Policy","Sitemap"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>{col.title}</div>
                <ul style={{ listStyle:"none" }}>
                  {col.links.map(l => (
                    <li key={l} style={{ marginBottom:10 }}>
                      <a href="#" style={{ fontSize:14, color:"rgba(255,255,255,0.5)", transition:"color .2s" }}
                        onMouseEnter={e=>e.target.style.color="white"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>© 2025 StayLux. All rights reserved.</p>
            <div style={{ display:"flex", gap:12 }}>
              {["Twitter","Instagram","Facebook","LinkedIn"].map(s => (
                <a key={s} href="#" style={{ width:36, height:36, borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.5)", fontSize:14, transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="white";e.currentTarget.style.color="white"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="rgba(255,255,255,0.5)"}}>{s[0]}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}