"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  ShieldCheck, BellRing, Camera, Wifi, Moon, Smartphone, RotateCw,
  ScanFace, Eye, CheckCircle, Star, Truck, Package, Lock, Phone,
  ChevronRight, ArrowRight, Clock, BadgeCheck,
  X, Menu, ChevronDown, ChevronUp, HardDrive, CloudRain, Mic,
  MapPin,
} from "lucide-react";

/* ─── TOKENS ─────────────────────────────────────────────────────── */
const F      = "var(--font-manrope),'Inter',-apple-system,sans-serif";
const NAVY   = "#0F172A";
const BLUE   = "#2563EB";
const BLUE2  = "#1D4ED8";
const GREEN  = "#10B981";
const RED    = "#EF4444";
const BG     = "#F8FAFC";
const MUTED  = "#64748B";
const BORDER = "#E5E7EB";
const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];
const VP = { once: true, amount: 0.12 };
const FU = { initial:{opacity:0,y:36}, whileInView:{opacity:1,y:0}, viewport:VP, transition:{duration:0.6,ease:EASE} };
const FL = { initial:{opacity:0,x:-40}, whileInView:{opacity:1,x:0}, viewport:VP, transition:{duration:0.6,ease:EASE} };
const FR = { initial:{opacity:0,x:40}, whileInView:{opacity:1,x:0}, viewport:VP, transition:{duration:0.6,ease:EASE} };

/* ─── DATA ───────────────────────────────────────────────────────── */
type SD = "none" | "64" | "128";
const SD_EXTRA: Record<SD, number> = { none:0, "64":9.90, "128":11.90 };
const BASE_PRICE = 49.90;
const DELIVERY_COST = 10.00;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " KM";

const NOTIFS = [
  { name:"Almir",   city:"Tuzle",     g:"m" },
  { name:"Jasmina", city:"Sarajeva",  g:"f" },
  { name:"Haris",   city:"Zenice",    g:"m" },
  { name:"Lejla",   city:"Mostara",   g:"f" },
  { name:"Emir",    city:"Bihaća",    g:"m" },
  { name:"Amina",   city:"Gračanice", g:"f" },
  { name:"Adnan",   city:"Lukavca",   g:"m" },
  { name:"Sanela",  city:"Banovića",  g:"f" },
  { name:"Nermin",  city:"Živinica",  g:"m" },
  { name:"Selma",   city:"Travnika",  g:"f" },
];

const FEATURES = [
  { Icon:ScanFace,  title:"Auto-praćenje osobe",  desc:"AI rotira kameru automatski za osobom u kadru" },
  { Icon:Moon,      title:"Noćni vid u boji",      desc:"Jasna slika čak i u potpunom mraku" },
  { Icon:Camera,    title:"Full HD / 2K",          desc:"Ostra, detaljna slika 24h dnevno" },
  { Icon:CloudRain, title:"IP66 vodootpornost",    desc:"Funkcioniše u svim vremenskim uvjetima" },
  { Icon:RotateCw,  title:"355° rotacija",         desc:"Pokrivenost cijelog prostora bez slijepe tačke" },
  { Icon:Mic,       title:"Dvosmjerni audio",      desc:"Razgovarajte putem kamere u realnom vremenu" },
];

const ADVANTAGES = [
  { Icon:ScanFace,   label:"Automatsko praćenje" },
  { Icon:Moon,       label:"Noćni vid u boji" },
  { Icon:Camera,     label:"Full HD slika" },
  { Icon:CloudRain,  label:"Otporna na kišu" },
  { Icon:RotateCw,   label:"360° rotacija" },
  { Icon:Mic,        label:"Mikrofon i zvučnik" },
  { Icon:HardDrive,  label:"Snimanje na SD" },
  { Icon:Smartphone, label:"Mobilna aplikacija" },
  { Icon:BellRing,   label:"Push notifikacije" },
  { Icon:Eye,        label:"Detekcija pokreta" },
];

const WHY = [
  "Jednostavna instalacija u 5 minuta",
  "Radi putem WiFi mreže bez kabla",
  "Upravljanje sa mobilnog telefona",
  "Nije potrebna pretplata ni cloud",
  "Automatski alarm pri detekciji pokreta",
  "Pregled uživo 24 sata dnevno",
];

const STEPS = [
  { n:1, Icon:Wifi,       title:"Povežite kameru na WiFi",      desc:"Skenirajte QR kod i kamera je online za 60 sekundi." },
  { n:2, Icon:Smartphone, title:"Instalirajte aplikaciju",       desc:"Preuzmite besplatnu aplikaciju na iOS ili Android." },
  { n:3, Icon:BellRing,   title:"Primajte obavještenja odmah",   desc:"Svaki pokret aktivira instant push na vaš telefon." },
  { n:4, Icon:Eye,        title:"Pratite uživo gdje god da ste", desc:"Otvorite aplikaciju i gledajte kućni livestream." },
];

const SPECS = [
  { label:"Rezolucija",        value:"1080p Full HD / 2K" },
  { label:"Noćni vid",         value:"Do 10m u mraku" },
  { label:"WiFi standard",     value:"2.4GHz 802.11 b/g/n" },
  { label:"Rotacija",          value:"355° horizontalno" },
  { label:"Audio",             value:"Dvosmjerni mikrofon" },
  { label:"Detekcija pokreta", value:"AI PIR senzor" },
  { label:"IP zaštita",        value:"IP66 vodootpornost" },
  { label:"Aplikacija",        value:"iOS i Android" },
  { label:"Micro SD",          value:"Do 128GB" },
];

const REVIEWS = [
  { name:"Adnan M.",   city:"Tuzla",      stars:5, text:"Dobio kameru za dva dana. Slika je odlična, noću se vidi savršeno. Totalno sam zadovoljan, preporučujem." },
  { name:"Selma H.",   city:"Sarajevo",   stars:5, text:"Instalacija trajala 10 minuta i sve odmah proradilo. Aplikacija super pregledna, nema nikakvih problema." },
  { name:"Haris K.",   city:"Zenica",     stars:5, text:"Najbolja kupovina ove godine. Postavio dvije kamere i pratim dvorište real-time. Zvuk radi odlično." },
  { name:"Amina D.",   city:"Mostar",     stars:5, text:"Naručila za mamu koja živi sama. Sada mogu provjeriti sve putem telefona. Detekcija radi savršeno." },
  { name:"Mirza O.",   city:"Banja Luka", stars:5, text:"Kamera stoji vani 4 mjeseca, preživi sve kiše. Kvalitetan materijal, garancija od 1 godine je veliki plus." },
  { name:"Lejla P.",   city:"Tuzla",      stars:5, text:"Obavještenje mi stigne za 2 sekunde kada kamera detektuje pokret. Svaka preporuka, vrijedi novca." },
  { name:"Edin T.",    city:"Travnik",    stars:5, text:"Plaćanje pouzećem je ono što me uvjerilo. Paket stigao odlično zapakovan sljedeći dan." },
  { name:"Jasmina B.", city:"Sarajevo",   stars:5, text:"Noćna slika kao da je dan. Rotacija tiha i precizna. Definitivno vrijedi svaki fening, odlično." },
];

const FAQ_DATA = [
  { q:"Da li radi bez interneta?",          a:"Kamera zahtijeva WiFi za prijenos slike na mobitel. Bez interneta, snimanje na SD karticu i dalje radi lokalno." },
  { q:"Da li podržava noćni vid?",          a:"Da, ima infrared noćni vid do 10m u potpunom mraku, uz opciju noćnog vida u boji uz dovoljno ambijentalne svjetlosti." },
  { q:"Koliko traje dostava?",              a:"Dostava traje 24 do 48 sati radnim danima putem Euro Express kurirske službe na cijelu BiH." },
  { q:"Kako se plaća?",                     a:"Plaćanje je isključivo pouzećem — plaćate kuriru kada vam paket stigne. Nema predujma ni online plaćanja." },
  { q:"Da li ima garanciju?",               a:"Da, kamera dolazi s garancijom od 1 godine. U slučaju kvara, zamjenimo ili refundiramo bez pitanja." },
  { q:"Da li mogu gledati preko mobitela?", a:"Da, preuzmite besplatnu aplikaciju i pratite kameru uživo s bilo kojeg mjesta na svijetu." },
];

const NAV = [
  { label:"Početna",        href:"#home" },
  { label:"Karakteristike", href:"#features" },
  { label:"Kako radi",      href:"#how" },
  { label:"Recenzije",      href:"#reviews" },
  { label:"Naruči",         href:"#order" },
];

/* ─── PROGRESS BAR ───────────────────────────────────────────────── */
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness:100, damping:30 });
  return (
    <motion.div
      style={{ position:"fixed", top:0, left:0, right:0, height:3, background:BLUE, transformOrigin:"0%", scaleX, zIndex:99999 }}
    />
  );
}

/* ─── SOCIAL PROOF POPUP ─────────────────────────────────────────── */
function SocialProof() {
  const [idx,     setIdx]     = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setIdx(Math.floor(Math.random() * NOTIFS.length));
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    const t = setTimeout(show, 4000);
    const iv = setInterval(show, 30000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  const n = NOTIFS[idx];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity:0, y:20, scale:0.95 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:10, scale:0.95 }}
          transition={{ duration:0.35, ease:EASE }}
          className="k-social-popup"
          style={{ position:"fixed", bottom:80, left:20, zIndex:9000, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.7)", borderRadius:16, padding:"12px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", display:"flex", alignItems:"center", gap:12, maxWidth:280, fontFamily:F }}
        >
          <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Camera size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:NAVY, lineHeight:1.4 }}>
              {n.name} iz {n.city} upravo {n.g==="f"?"naručila":"naručio"} kameru
            </div>
            <div style={{ fontSize:11, color:MUTED, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
              <CheckCircle size={10} color={GREEN} /> Potvrđena narudžba
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────── */
function Header({ onOrder }: { onOrder: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const textColor = scrolled ? NAVY : "#fff";

  return (
    <>
      <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:9000, background: scrolled ? "rgba(255,255,255,0.96)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none", boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.07)" : "none", borderBottom: scrolled ? `1px solid ${BORDER}` : "none", transition:"all 0.3s ease" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="#home" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Camera size={18} color="#fff" />
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:textColor, fontFamily:F, letterSpacing:"-0.04em", transition:"color 0.3s" }}>
              Cartly<span style={{ color:BLUE }}>.ba</span>
            </span>
          </a>

          <nav className="k-desk-nav" style={{ display:"flex", gap:4 }}>
            {NAV.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize:13, fontWeight:600, color:textColor, textDecoration:"none", padding:"7px 14px", borderRadius:8, fontFamily:F, transition:"all 0.2s", opacity:0.82 }}
                onMouseEnter={e => { const el = e.target as HTMLElement; el.style.opacity="1"; el.style.background = scrolled?"#F1F5F9":"rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { const el = e.target as HTMLElement; el.style.opacity="0.82"; el.style.background="transparent"; }}
              >{l.label}</a>
            ))}
          </nav>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onOrder} className="k-desk-cta" style={{ padding:"9px 22px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, fontFamily:F, cursor:"pointer", boxShadow:"0 4px 16px rgba(37,99,235,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.transform="scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
            >Kupi odmah</button>
            <button onClick={() => setOpen(o=>!o)} className="k-mob-btn" style={{ background:"none", border:"none", cursor:"pointer", color:textColor, padding:4, display:"flex" }}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}
            style={{ position:"fixed", top:68, left:0, right:0, zIndex:8900, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${BORDER}`, boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}
          >
            {NAV.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ display:"block", padding:"16px 24px", fontSize:15, fontWeight:600, color:NAVY, textDecoration:"none", fontFamily:F, borderBottom:`1px solid ${BORDER}` }}>{l.label}</a>
            ))}
            <div style={{ padding:16 }}>
              <button onClick={() => { setOpen(false); onOrder(); }} style={{ width:"100%", padding:14, background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, fontFamily:F, cursor:"pointer" }}>
                Kupi odmah — 49,90 KM
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style suppressHydrationWarning>{`
        .k-desk-nav { display: flex !important; }
        .k-desk-cta { display: block !important; }
        .k-mob-btn  { display: none !important; }
        @media (max-width: 900px) {
          .k-desk-nav { display: none !important; }
          .k-desk-cta { display: none !important; }
          .k-mob-btn  { display: flex !important; }
        }
        .k-social-popup { display: flex !important; }
        @media (max-width: 480px) { .k-social-popup { display: none !important; } }
      `}</style>
    </>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────── */
function Hero({ onOrder }: { onOrder: () => void }) {
  const { h, m, s } = useCountdown(6420);
  const { stock, viewers, sold } = useUrgency();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section id="home" style={{ background:`linear-gradient(145deg, ${NAVY} 0%, #1E293B 55%, #0F172A 100%)`, minHeight:"100vh", paddingTop:68, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 28% 50%, rgba(37,99,235,0.18) 0%, transparent 55%), radial-gradient(circle at 72% 15%, rgba(16,185,129,0.07) 0%, transparent 45%)` }} />

      <div className="k-hero-grid" style={{ maxWidth:1200, margin:"0 auto", padding:"64px 24px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center", position:"relative" }}>
        {/* LEFT */}
        <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, ease:EASE }}>
          <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1, duration:0.5 }}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.14)", border:"1px solid rgba(239,68,68,0.28)", borderRadius:100, padding:"6px 16px", marginBottom:24 }}
          >
            <div style={{ width:8, height:8, borderRadius:"50%", background:RED, animation:"kPulse 1.5s ease-in-out infinite" }} />
            <span style={{ fontSize:13, fontWeight:800, color:"#FCA5A5", fontFamily:F, letterSpacing:"0.06em", textTransform:"uppercase" }}>AKCIJA -38%</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.65, ease:EASE }}
            style={{ fontSize:"clamp(28px,4.2vw,52px)", fontWeight:900, color:"#fff", fontFamily:F, lineHeight:1.12, letterSpacing:"-0.03em", margin:"0 0 20px" }}
          >
            Zaštitite svoj dom uz{" "}
            <span style={{ background:`linear-gradient(135deg, ${BLUE} 0%, #60A5FA 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              pametnu WiFi
            </span>{" "}
            sigurnosnu kameru
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.55, ease:EASE }}
            style={{ fontSize:16, color:"rgba(255,255,255,0.62)", fontFamily:F, lineHeight:1.78, margin:"0 0 32px", maxWidth:480 }}
          >
            Pratite dom uživo sa bilo kojeg mjesta putem mobitela. Kamera automatski detektuje pokret, šalje obavještenja i snima svaki važan trenutak.
          </motion.p>

          {/* Price box */}
          <motion.div className="k-hero-desk-price" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.55, ease:EASE }}
            style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.11)", borderRadius:22, padding:"24px 28px", marginBottom:28, display:"inline-block" }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span style={{ fontSize:16, color:"rgba(255,255,255,0.35)", textDecoration:"line-through", fontFamily:F }}>79,90 KM</span>
              <span style={{ background:RED, color:"#fff", fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:8, fontFamily:F }}>UŠTEDA 30 KM</span>
            </div>
            <div style={{ fontSize:52, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em", lineHeight:1 }}>
              49,90 <span style={{ fontSize:22, color:"rgba(255,255,255,0.55)", fontWeight:600 }}>KM</span>
            </div>
            <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
              <Truck size={15} color={GREEN} />
              <span style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.6)", fontFamily:F }}>Dostava 10,00 KM · Plaćanje pouzećem</span>
            </div>
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:6 }}>
              {([
                [CheckCircle,"Plaćanje pouzećem"],
                [Clock,      "Dostava 24-48h"],
                [ShieldCheck,"1 godina garancije"],
              ] as [React.ElementType, string][]).map(([Icon, text], i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Icon size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontFamily:F }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTAs — desktop only */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5, duration:0.5, ease:EASE }}
            className="k-hero-desk-ctas" style={{ display:"flex", gap:12, flexWrap:"wrap" }}
          >
            <button onClick={onOrder}
              style={{ padding:"15px 32px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:14, fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer", boxShadow:`0 8px 32px rgba(37,99,235,0.45)`, display:"flex", alignItems:"center", gap:8 }}
              onMouseEnter={e => (e.currentTarget.style.transform="translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform="translateY(0)")}
            >
              Naruči odmah <ArrowRight size={17} />
            </button>
            <a href="#how" style={{ padding:"15px 26px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"rgba(255,255,255,0.82)", borderRadius:14, fontSize:14, fontWeight:600, fontFamily:F, textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
              Pogledaj kako radi <ChevronRight size={16} />
            </a>
          </motion.div>

          {/* Mobile-only: camera image + urgency price card */}
          <div className="k-hero-mob-extra">
            {/* Camera image */}
            <motion.div initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.35, duration:0.6, ease:EASE }}
              style={{ position:"relative", textAlign:"center", margin:"24px -4px 0" }}
            >
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)`, filter:"blur(32px)" }} />
              <Image src="/kamera2/kamerapng.webp" alt="WiFi PTZ Kamera" width={300} height={300} priority sizes="(max-width:860px) 80vw, 300px" style={{ filter:"drop-shadow(0 20px 40px rgba(37,99,235,0.28))", maxWidth:"80%", height:"auto", position:"relative" }} />
              {/* Float badges */}
              <div style={{ position:"absolute", top:"10%", left:"0%", background:"rgba(255,255,255,0.12)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:12, padding:"8px 12px" }}>
                <div style={{ display:"flex", gap:2, marginBottom:3 }}>{[...Array(5)].map((_,i)=><Star key={i} size={9} fill="#FBBF24" color="#FBBF24" />)}</div>
                <div style={{ fontSize:14, fontWeight:900, color:"#fff", fontFamily:F }}>4.9/5</div>
              </div>
              <div style={{ position:"absolute", top:"10%", right:"0%", background:"rgba(16,185,129,0.14)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(16,185,129,0.28)", borderRadius:12, padding:"8px 12px", display:"flex", alignItems:"center", gap:6 }}>
                <ScanFace size={13} color={GREEN} />
                <span style={{ fontSize:11, fontWeight:700, color:GREEN, fontFamily:F }}>AI praćenje</span>
              </div>
            </motion.div>

            {/* Premium price card */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5, duration:0.55, ease:EASE }}
              style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:22, padding:"20px 20px", marginTop:20 }}
            >
              {/* Price */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", textDecoration:"line-through", fontFamily:F }}>79,90 KM</div>
                  <div style={{ fontSize:40, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em", lineHeight:1, whiteSpace:"nowrap" }}>49,90 <span style={{ fontSize:16, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>KM</span></div>
                </div>
                <div style={{ marginLeft:"auto", flexShrink:0, background:RED, color:"#fff", fontSize:11, fontWeight:800, padding:"5px 10px", borderRadius:10, fontFamily:F, whiteSpace:"nowrap" }}>UŠTEDA 30 KM</div>
              </div>
              {/* Countdown */}
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:F, alignSelf:"center", marginRight:4 }}>⏱ Ističe za:</div>
                {([[h,"SAT"],[m,"MIN"],[s,"SEK"]] as [number,string][]).map(([val, lab], i) => (
                  <div key={i} style={{ textAlign:"center", background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 8px", minWidth:40 }}>
                    <div style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:F, lineHeight:1 }}>{String(val).padStart(2,"0")}</div>
                    <div style={{ fontSize:7, color:"rgba(255,255,255,0.4)", fontFamily:F, letterSpacing:"0.08em", marginTop:2 }}>{lab}</div>
                  </div>
                ))}
              </div>
              {/* Urgency stats — client only to avoid SSR mismatch */}
              {mounted && (
                <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:RED, animation:"kPulse 1.5s ease-in-out infinite" }} />
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:F }}>Zalihe: samo <strong style={{ color:"#FCA5A5" }}>{stock} kom</strong></span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <Eye size={11} color="rgba(255,255,255,0.55)" />
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:F }}><strong style={{ color:"#93C5FD" }}>{viewers}</strong> posjetilaca sada</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <CheckCircle size={11} color={GREEN} />
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.65)", fontFamily:F }}><strong style={{ color:"#6EE7B7" }}>{sold}</strong> prodanih ovaj tjedan</span>
                  </div>
                </div>
              )}
              {/* CTA */}
              <button onClick={onOrder}
                style={{ width:"100%", padding:"15px 20px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:14, fontSize:16, fontWeight:800, fontFamily:F, cursor:"pointer", boxShadow:`0 8px 28px rgba(37,99,235,0.45)`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >
                Naruči odmah <ArrowRight size={17} />
              </button>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:10 }}>
                <Truck size={12} color={GREEN} />
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:F, fontWeight:600 }}>Dostava 10,00 KM · Plaćanje pouzećem</span>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* RIGHT — floating image */}
        <div className="k-hero-desk-img" style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:440, height:440, borderRadius:"50%", background:`radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)`, filter:"blur(48px)" }} />

          <motion.div animate={{ y:[0,-18,0] }} transition={{ duration:4.2, repeat:Infinity, ease:"easeInOut" }} style={{ position:"relative", zIndex:2 }}>
            <Image src="/kamera2/kamerapng.webp" alt="WiFi PTZ Sigurnosna Kamera" width={440} height={440} priority sizes="(max-width:860px) 0px, 440px" style={{ filter:"drop-shadow(0 28px 56px rgba(37,99,235,0.28))", maxWidth:"100%", height:"auto" }} />
          </motion.div>

          {/* Floating badge: rating */}
          <motion.div initial={{ opacity:0, scale:0.8, x:-20 }} animate={{ opacity:1, scale:1, x:0 }} transition={{ delay:0.8, duration:0.5 }}
            style={{ position:"absolute", top:"8%", left:"-6%", background:"rgba(255,255,255,0.11)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:18, padding:"14px 18px", zIndex:3 }}
          >
            <div style={{ display:"flex", gap:2, marginBottom:5 }}>{[...Array(5)].map((_,i)=><Star key={i} size={12} fill="#FBBF24" color="#FBBF24" />)}</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.03em" }}>4.9/5</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", fontFamily:F }}>zadovoljstvo kupaca</div>
          </motion.div>

          {/* Floating badge: active count */}
          <motion.div initial={{ opacity:0, scale:0.8, x:20 }} animate={{ opacity:1, scale:1, x:0 }} transition={{ delay:1.0, duration:0.5 }}
            style={{ position:"absolute", top:"16%", right:"-4%", background:"rgba(255,255,255,0.11)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:18, padding:"14px 18px", zIndex:3 }}
          >
            <div style={{ fontSize:26, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em" }}>247</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", fontFamily:F }}>aktivnih kamera danas</div>
          </motion.div>

          {/* Floating badge: AI */}
          <motion.div initial={{ opacity:0, scale:0.8, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ delay:1.2, duration:0.5 }}
            style={{ position:"absolute", bottom:"22%", left:"-10%", background:"rgba(16,185,129,0.14)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", border:"1px solid rgba(16,185,129,0.28)", borderRadius:14, padding:"11px 15px", zIndex:3, display:"flex", alignItems:"center", gap:8 }}
          >
            <ScanFace size={16} color={GREEN} />
            <span style={{ fontSize:12, fontWeight:700, color:GREEN, fontFamily:F }}>AI Motion Detection</span>
          </motion.div>

          {/* Floating badge: night */}
          <motion.div initial={{ opacity:0, scale:0.8, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ delay:1.4, duration:0.5 }}
            style={{ position:"absolute", bottom:"18%", right:"-3%", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:14, padding:"11px 15px", zIndex:3, display:"flex", alignItems:"center", gap:8 }}
          >
            <Moon size={16} color="#93C5FD" />
            <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)", fontFamily:F }}>Noćni način rada</span>
          </motion.div>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes kPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        .k-hero-grid { }
        .k-hero-mob-extra { display: none !important; }
        .k-hero-desk-ctas { display: flex !important; }
        @media(max-width:860px) {
          .k-hero-grid { grid-template-columns:1fr!important; }
          .k-hero-desk-img { display:none!important; }
          .k-hero-desk-price { display:none!important; }
          .k-hero-mob-extra { display: block !important; }
          .k-hero-desk-ctas { display: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── FEATURES SECTION ───────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section id="features" style={{ background:BG, padding:"100px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <div className="k-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
          <motion.div {...FL} style={{ borderRadius:28, overflow:"hidden", boxShadow:"0 28px 80px rgba(0,0,0,0.11)" }}>
            <Image src="/kamera2/kamerajpg.webp" alt="WiFi kamera u akciji" width={600} height={480} style={{ width:"100%", height:"auto", display:"block" }} />
          </motion.div>

          <motion.div {...FR}>
            <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:14 }}>Pametna zaštita</p>
            <h2 style={{ fontSize:"clamp(24px,3.2vw,40px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", lineHeight:1.15, margin:"0 0 18px" }}>
              Zaštita koja radi<br />24 sata dnevno
            </h2>
            <p style={{ fontSize:15, color:MUTED, fontFamily:F, lineHeight:1.75, margin:"0 0 36px" }}>
              Savremena AI tehnologija osigurava da svaki pokret bude detektovan, zabilježen i prijavljen direktno na vaš mobitel — bez obzira gdje se nalazili.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {FEATURES.map(({ Icon, title, desc }, i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={VP} transition={{ duration:0.45, delay:i*0.07, ease:EASE }}
                  style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:16, padding:"18px 16px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background:`${BLUE}14`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                    <Icon size={18} color={BLUE} />
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:NAVY, fontFamily:F, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:12, color:MUTED, fontFamily:F, lineHeight:1.5 }}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <style suppressHydrationWarning>{`.k-2col{} @media(max-width:860px){.k-2col{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="how" style={{ background:"#fff", padding:"100px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Jednostavno kao 1-2-3</p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Kako radi?</h2>
        </motion.div>

        <div className="k-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            {STEPS.map(({ n, Icon, title, desc }, i) => (
              <div key={i} style={{ display:"flex", gap:20, paddingBottom: i < STEPS.length-1 ? 0 : 0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <motion.div initial={{ opacity:0, scale:0.7 }} whileInView={{ opacity:1, scale:1 }} viewport={VP} transition={{ duration:0.4, delay:i*0.12, ease:EASE }}
                    style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 8px 24px rgba(37,99,235,0.3)` }}
                  >
                    <Icon size={22} color="#fff" />
                  </motion.div>
                  {i < STEPS.length-1 && (
                    <motion.div initial={{ scaleY:0 }} whileInView={{ scaleY:1 }} viewport={VP} transition={{ duration:0.5, delay:i*0.12+0.3 }}
                      style={{ width:2, minHeight:44, background:`linear-gradient(to bottom, ${BLUE}, transparent)`, transformOrigin:"top", margin:"8px 0" }}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: i < STEPS.length-1 ? 32 : 0 }}>
                  <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={VP} transition={{ duration:0.45, delay:i*0.12+0.1, ease:EASE }}>
                    <div style={{ fontSize:11, fontWeight:800, color:BLUE, fontFamily:F, background:`${BLUE}14`, padding:"2px 10px", borderRadius:6, display:"inline-block", letterSpacing:"0.06em", marginBottom:8 }}>KORAK {n}</div>
                    <div style={{ fontSize:17, fontWeight:800, color:NAVY, fontFamily:F, marginBottom:6 }}>{title}</div>
                    <div style={{ fontSize:14, color:MUTED, fontFamily:F, lineHeight:1.65 }}>{desc}</div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          <motion.div {...FR} style={{ borderRadius:28, overflow:"hidden", boxShadow:"0 28px 80px rgba(0,0,0,0.11)" }}>
            <Image src="/kamera2/kakoradi.webp" alt="Kako radi WiFi kamera" width={580} height={460} style={{ width:"100%", height:"auto", display:"block" }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── ADVANTAGES GRID ────────────────────────────────────────────── */
function AdvantagesGrid() {
  return (
    <section style={{ background:BG, padding:"100px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:56 }}>
          <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Sve na jednom mjestu</p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Sekcija prednosti</h2>
        </motion.div>

        <div className="k-adv-grid" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16 }}>
          {ADVANTAGES.map(({ Icon, label }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={VP} transition={{ duration:0.45, delay:i*0.06, ease:EASE }}
              whileHover={{ y:-4, boxShadow:"0 12px 40px rgba(37,99,235,0.12)" }}
              style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:20, padding:"28px 20px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", transition:"border-color 0.2s" }}
            >
              <div style={{ width:52, height:52, borderRadius:14, background:`${BLUE}12`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Icon size={24} color={BLUE} />
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:NAVY, fontFamily:F, lineHeight:1.35 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <style suppressHydrationWarning>{`@media(max-width:900px){.k-adv-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </section>
  );
}

/* ─── WHY SECTION ────────────────────────────────────────────────── */
function WhySection() {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let n = 0;
        const t = setInterval(() => { n += 2; setCount(Math.min(n, 98)); if (n >= 98) clearInterval(t); }, 18);
      }
    }, { threshold:0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background:"#fff", padding:"100px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Zašto baš ova kamera?</p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Jednostavna. Pouzdana. Dostupna.</h2>
        </motion.div>

        <div className="k-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <motion.div {...FL} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {WHY.map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={VP} transition={{ duration:0.45, delay:i*0.08, ease:EASE }}
                style={{ display:"flex", alignItems:"center", gap:16, background:BG, border:`1px solid ${BORDER}`, borderRadius:14, padding:"16px 20px" }}
              >
                <div style={{ width:32, height:32, borderRadius:10, background:GREEN, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <CheckCircle size={17} color="#fff" />
                </div>
                <span style={{ fontSize:15, fontWeight:600, color:NAVY, fontFamily:F }}>{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...FR} ref={ref}
            style={{ background:`linear-gradient(145deg, ${NAVY} 0%, #1E293B 100%)`, borderRadius:28, padding:"48px 40px", textAlign:"center", boxShadow:"0 28px 80px rgba(15,23,42,0.22)", position:"relative", overflow:"hidden" }}
          >
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% -10%, rgba(37,99,235,0.2) 0%, transparent 60%)` }} />
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:88, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.05em", lineHeight:1 }}>
                {count}<span style={{ fontSize:44, color:BLUE }}>%</span>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.75)", fontFamily:F, marginTop:10, marginBottom:28 }}>
                kupaca preporučuje ovaj proizvod
              </div>
              {([
                [Star,        "4.9/5 prosječna ocjena"],
                [BadgeCheck,  "Više od 1.200 narudžbi"],
                [ShieldCheck, "1 godina garancije"],
              ] as [React.ElementType, string][]).map(([Icon, text], i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 16px", marginBottom:i<2?10:0 }}>
                  <Icon size={16} color={GREEN} />
                  <span style={{ fontSize:14, color:"rgba(255,255,255,0.7)", fontFamily:F }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── REVIEWS ────────────────────────────────────────────────────── */
function Reviews() {
  return (
    <section id="reviews" style={{ background:BG, padding:"100px 0", overflow:"hidden" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 40px" }}>
        <motion.div {...FU} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
          <div>
            <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>Recenzije kupaca</p>
            <h2 style={{ fontSize:"clamp(22px,3.2vw,40px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Šta kažu naši kupci?</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[...Array(5)].map((_,i) => <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />)}
            <span style={{ fontSize:15, fontWeight:700, color:NAVY, fontFamily:F, marginLeft:8 }}>4.9 od 5</span>
          </div>
        </motion.div>
      </div>

      <div style={{ display:"flex", gap:20, overflowX:"auto", paddingLeft:24, paddingRight:24, paddingBottom:8, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {REVIEWS.map((r, i) => (
          <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.45, delay:i*0.06, ease:EASE }}
            style={{ flexShrink:0, width:296, background:"#fff", border:`1px solid ${BORDER}`, borderRadius:20, padding:24, boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}
          >
            <div style={{ display:"flex", gap:2, marginBottom:14 }}>
              {[...Array(r.stars)].map((_,j) => <Star key={j} size={14} fill="#FBBF24" color="#FBBF24" />)}
            </div>
            <p style={{ fontSize:14, color:MUTED, fontFamily:F, lineHeight:1.72, margin:"0 0 18px" }}>&ldquo;{r.text}&rdquo;</p>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:13, fontWeight:800, color:"#fff", fontFamily:F }}>{r.name[0]}</span>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:NAVY, fontFamily:F }}>{r.name}</div>
                <div style={{ fontSize:11, color:MUTED, fontFamily:F, display:"flex", alignItems:"center", gap:3 }}>
                  <MapPin size={10} /> {r.city}
                </div>
              </div>
              <div style={{ marginLeft:"auto" }}><BadgeCheck size={18} color={GREEN} /></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


/* ─── SPECS ──────────────────────────────────────────────────────── */
function Specs() {
  return (
    <section style={{ background:BG, padding:"100px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:56 }}>
          <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Tehnički detalji</p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Specifikacije</h2>
        </motion.div>

        <div className="k-spec-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {SPECS.map(({ label, value }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={VP} transition={{ duration:0.4, delay:i*0.06, ease:EASE }}
              style={{ background:"#fff", border:`1px solid ${BORDER}`, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:8 }}>{label}</div>
              <div style={{ fontSize:17, fontWeight:800, color:NAVY, fontFamily:F }}>{value}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <style suppressHydrationWarning>{`@media(max-width:700px){.k-spec-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </section>
  );
}

/* ─── COUNTDOWN HOOK ─────────────────────────────────────────────── */
function useCountdown(initial: number) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s <= 0 ? initial : s - 1)), 1000);
    return () => clearInterval(t);
  }, [initial]);
  return { h: Math.floor(secs / 3600), m: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

/* ─── URGENCY HOOK ────────────────────────────────────────────────── */
function useUrgency() {
  const rnd = (lo: number, hi: number) => Math.floor(lo + Math.random() * (hi - lo + 1));
  const [stock,   setStock]   = useState(23);
  const [viewers, setViewers] = useState(14);
  const [sold,    setSold]    = useState(143);
  useEffect(() => {
    // randomize on client after mount to avoid SSR mismatch
    setStock(rnd(18, 27));
    setViewers(rnd(9, 27));
    setSold(rnd(120, 170));
    const st = setInterval(() => setStock(s => Math.max(18, s - (Math.random() > 0.6 ? 1 : 0))), 90000);
    const vt = setInterval(() => setViewers(rnd(9, 27)), 22000);
    const dt = setInterval(() => setSold(s => s + 1), 480000);
    return () => { clearInterval(st); clearInterval(vt); clearInterval(dt); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { stock, viewers, sold };
}

/* ─── ORDER MODAL ─────────────────────────────────────────────────── */
function OrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { h, m, s } = useCountdown(6420);
  const [sd,      setSd]      = useState<SD>("none");
  const [qty,     setQty]     = useState(1);
  const [fields,  setFields]  = useState({ ime:"", telefon:"", adresa:"", grad:"" });
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [srvErr,  setSrvErr]  = useState<string|null>(null);
  const total = (BASE_PRICE + SD_EXTRA[sd]) * qty + DELIVERY_COST;

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function validate() {
    const e: Record<string,string> = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2) e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g,"").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim()) e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setSrvErr(null);
    try {
      const res  = await fetch("/api/kamera-order", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ ...fields, kolicina:qty, sdCard:sd }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("track", "Purchase", { value: total, currency: "BAM", content_name: "V380 Pro 12MP Kamera", content_ids: ["kamera-v380"], num_items: qty }, { eventID: data.orderNumber });
      }
      setDone(true);
    } catch (err) {
      setSrvErr(err instanceof Error ? err.message : "Greška pri slanju narudžbe.");
    } finally { setLoading(false); }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}
            onClick={onClose}
            style={{ position:"fixed", inset:0, zIndex:19000, background:"rgba(15,23,42,0.65)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" }}
          />
          <motion.div
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ type:"spring", stiffness:340, damping:36 }}
            className="k-modal-sheet"
            style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:19001, background:"rgba(255,255,255,0.98)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRadius:"32px 32px 0 0", maxHeight:"94dvh", overflowY:"auto", fontFamily:F }}
          >
            {/* handle */}
            <div style={{ width:40, height:4, borderRadius:2, background:"#D1D5DB", margin:"14px auto 0" }} />

            {/* close */}
            <button onClick={onClose} style={{ position:"absolute", top:16, right:20, background:"rgba(100,116,139,0.1)", border:"none", borderRadius:"50%", width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={18} color={MUTED} />
            </button>

            <div style={{ padding:"20px 20px 40px" }}>
              {done ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ width:72, height:72, borderRadius:"50%", background:GREEN, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:`0 12px 40px rgba(16,185,129,0.35)` }}>
                    <CheckCircle size={36} color="#fff" />
                  </div>
                  <h3 style={{ fontSize:24, fontWeight:900, color:NAVY, letterSpacing:"-0.03em", margin:"0 0 10px" }}>Narudžba primljena!</h3>
                  <p style={{ fontSize:14, color:MUTED, lineHeight:1.7, maxWidth:320, margin:"0 auto" }}>Kontaktiraćemo vas u kratkom roku radi potvrde dostave. Hvala na povjerenju!</p>
                  <button onClick={onClose} style={{ marginTop:28, padding:"14px 36px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer" }}>Zatvori</button>
                </div>
              ) : (
                <>
                  {/* header */}
                  <div style={{ marginBottom:20 }}>
                    <h2 style={{ fontSize:20, fontWeight:900, color:NAVY, letterSpacing:"-0.03em", margin:"0 0 4px" }}>Naruči kameru</h2>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, color:MUTED, textDecoration:"line-through" }}>79,90 KM</span>
                      <span style={{ fontSize:22, fontWeight:900, color:BLUE, letterSpacing:"-0.03em" }}>49,90 KM</span>
                      <span style={{ background:RED, color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:6 }}>-38%</span>
                    </div>
                    {/* countdown */}
                    <div style={{ display:"flex", gap:6, marginTop:10 }}>
                      {([[h,"SAT"],[m,"MIN"],[s,"SEK"]] as [number,string][]).map(([val, lab], i) => (
                        <div key={i} style={{ textAlign:"center", background:NAVY, borderRadius:8, padding:"8px 10px", minWidth:48 }}>
                          <div style={{ fontSize:18, fontWeight:900, color:"#fff", lineHeight:1 }}>{String(val).padStart(2,"0")}</div>
                          <div style={{ fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", marginTop:2 }}>{lab}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SD options */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:12 }}>Odaberite SD karticu</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {([
                        { val:"none" as SD, label:"Bez SD kartice",   sub:"Samo kamera",     extra:"Uključeno u cijenu", badge:null,            badgeColor:"#64748B" },
                        { val:"64"   as SD, label:"SD kartica 64GB",  sub:"Najpopularniji",  extra:"+9,90 KM",           badge:"Preporučeno",   badgeColor:BLUE },
                        { val:"128"  as SD, label:"SD kartica 128GB", sub:"Više prostora",   extra:"+11,90 KM",          badge:"Max. kapacitet", badgeColor:"#7C3AED" },
                      ]).map(({ val, label, sub, extra, badge, badgeColor }) => {
                        const active = sd === val;
                        return (
                          <div key={val} onClick={() => setSd(val)}
                            style={{ border:`2px solid ${active?BLUE:BORDER}`, background:active?"#EFF6FF":"#FAFAFA", borderRadius:16, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s", position:"relative", boxShadow:active?"0 0 0 4px rgba(37,99,235,0.08)":"none" }}
                          >
                            {/* Radio dot */}
                            <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${active?BLUE:BORDER}`, background:active?BLUE:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                              {active && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }} />}
                            </div>
                            {/* Label + sub */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:14, fontWeight:700, color:active?NAVY:"#374151", lineHeight:1.2 }}>{label}</div>
                              <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{sub}</div>
                            </div>
                            {/* Price + badge */}
                            <div style={{ textAlign:"right", flexShrink:0 }}>
                              {badge && <div style={{ background:badgeColor, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:6, letterSpacing:"0.04em", marginBottom:4, display:"inline-block" }}>{badge}</div>}
                              <div style={{ fontSize:13, fontWeight:800, color:active?BLUE:"#374151" }}>{extra}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="k-modal-form" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                      {([
                        { key:"ime",     label:"Ime i prezime", type:"text", ph:"Amira Kovačević" },
                        { key:"telefon", label:"Telefon",       type:"tel",  ph:"061 234 567" },
                        { key:"adresa",  label:"Adresa",        type:"text", ph:"Ulica i broj" },
                        { key:"grad",    label:"Grad",          type:"text", ph:"Sarajevo" },
                      ] as { key: keyof typeof fields; label:string; type:string; ph:string }[]).map(({ key, label, type, ph }) => (
                        <div key={key}>
                          <label style={{ display:"block", fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{label}</label>
                          <input type={type} value={fields[key]} placeholder={ph}
                            onChange={e => { setFields(f => ({ ...f, [key]:e.target.value })); setErrors(er => ({ ...er, [key]:"" })); }}
                            style={{ width:"100%", padding:"12px 12px", border:`1.5px solid ${errors[key]?RED:BORDER}`, borderRadius:10, fontSize:14, color:NAVY, background:"#fff", boxSizing:"border-box", WebkitAppearance:"none", outline:"none" }}
                            onFocus={e => { e.target.style.borderColor=BLUE; e.target.style.boxShadow=`0 0 0 3px rgba(37,99,235,0.1)`; }}
                            onBlur={e  => { e.target.style.borderColor=errors[key]?RED:BORDER; e.target.style.boxShadow="none"; }}
                          />
                          {errors[key] && <p style={{ margin:"4px 0 0", fontSize:10, color:RED }}>{errors[key]}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Qty */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:BG, border:`1px solid ${BORDER}`, borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:NAVY }}>Količina</span>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <button type="button" onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${BORDER}`, background:"#fff", cursor:"pointer", fontSize:18, fontWeight:700, color:NAVY, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                        <span style={{ fontSize:17, fontWeight:800, color:NAVY, minWidth:20, textAlign:"center" }}>{qty}</span>
                        <button type="button" onClick={() => setQty(q => Math.min(5,q+1))} style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${BLUE}`, background:BLUE, cursor:"pointer", fontSize:18, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                      </div>
                    </div>

                    {srvErr && <div style={{ padding:"10px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, fontSize:12, color:RED, marginBottom:12 }}>{srvErr}</div>}

                    {/* Submit block */}
                    <div style={{ background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, borderRadius:18, padding:"20px 20px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                        <div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:3 }}>Ukupno</div>
                          <div style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:"-0.04em", lineHeight:1 }}>{fmt(total)}</div>
                        </div>
                        <div style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.28)", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                          <div style={{ fontSize:8, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Dostava</div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>10,00 KM</div>
                        </div>
                      </div>
                      <button type="submit" disabled={loading}
                        style={{ width:"100%", padding:"15px 20px", background:loading?"rgba(255,255,255,0.5)":"#fff", color:BLUE, border:"none", borderRadius:12, fontSize:15, fontWeight:900, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.01em" }}
                        onMouseEnter={e => { if(!loading) e.currentTarget.style.transform="scale(1.01)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}
                      >
                        {loading ? "Šalje se..." : (<>Naruči odmah — Plaćanje pouzećem <ArrowRight size={16} /></>)}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
          <style suppressHydrationWarning>{`
            .k-modal-sheet { }
            @media(min-width:640px){
              .k-modal-sheet { bottom:auto!important; top:50%!important; left:50%!important; right:auto!important;
                transform:translateY(-50%) translateX(-50%)!important; width:520px!important; border-radius:32px!important; max-height:92vh!important; }
            }
            @media(max-width:480px){ .k-modal-form { grid-template-columns:1fr!important; } }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}


/* ─── TRUST SECTION ───────────────────────────────────────────────── */
function TrustSection() {
  return (
    <section className="k-trust-section" style={{ background:"#fff", padding:"28px 20px 24px", borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        {/* Stars */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:18 }}>
          <div style={{ display:"flex", gap:2 }}>{[...Array(5)].map((_,i)=><Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}</div>
          <span style={{ fontSize:16, fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.02em" }}>4.9/5</span>
          <span style={{ fontSize:12, color:MUTED, fontFamily:F }}>· 2.000+ zadovoljnih kupaca</span>
        </div>
        {/* Trust cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {([
            [ShieldCheck, "Sigurna kupovina",    "SSL zaštita"],
            [Package,     "Plaćanje pouzećem",   "Bez predujma"],
            [Truck,       "Brza dostava",         "24–48h BiH"],
            [BadgeCheck,  "1 god. garancija",     "Zamjena bez pitanja"],
          ] as [React.ElementType, string, string][]).map(([Icon, title, sub], i) => (
            <div key={i} style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:NAVY, fontFamily:F, lineHeight:1.3 }}>{title}</div>
                <div style={{ fontSize:10, color:MUTED, fontFamily:F }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style suppressHydrationWarning>{`
        .k-trust-section { display: block !important; }
        @media(min-width: 640px) { .k-trust-section { display: none !important; } }
      `}</style>
    </section>
  );
}

/* ─── OFFER SECTION ──────────────────────────────────────────────── */
function OfferSection() {
  const { h, m, s } = useCountdown(6420);
  const [sd,      setSd]      = useState<SD>("none");
  const [qty,     setQty]     = useState(1);
  const [fields,  setFields]  = useState({ ime:"", telefon:"", adresa:"", grad:"" });
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [srvErr,  setSrvErr]  = useState<string|null>(null);

  const total = (BASE_PRICE + SD_EXTRA[sd]) * qty + DELIVERY_COST;

  function validate() {
    const e: Record<string,string> = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2) e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g,"").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim()) e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setSrvErr(null);
    try {
      const res  = await fetch("/api/kamera-order", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ ...fields, kolicina:qty, sdCard:sd }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("track", "Purchase", { value: total, currency: "BAM", content_name: "V380 Pro 12MP Kamera", content_ids: ["kamera-v380"], num_items: qty }, { eventID: data.orderNumber });
      }
      setDone(true);
    } catch (err) {
      setSrvErr(err instanceof Error ? err.message : "Greška pri slanju narudžbe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="order" style={{ background:`linear-gradient(160deg, ${NAVY} 0%, #1E293B 100%)`, padding:"100px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 30% 50%, rgba(37,99,235,0.1) 0%, transparent 55%)` }} />
      <div style={{ maxWidth:900, margin:"0 auto", position:"relative" }}>

        {/* Header */}
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:100, padding:"6px 18px", marginBottom:20 }}>
            <Clock size={14} color={RED} />
            <span style={{ fontSize:12, fontWeight:800, color:"#FCA5A5", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em" }}>Ponuda ograničena</span>
          </div>
          <h2 style={{ fontSize:"clamp(26px,3.8vw,48px)", fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.03em", margin:"0 0 16px" }}>Današnja akcija</h2>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:16, flexWrap:"nowrap" }}>
            <span style={{ fontSize:16, color:"rgba(255,255,255,0.32)", textDecoration:"line-through", fontFamily:F, whiteSpace:"nowrap" }}>79,90 KM</span>
            <span style={{ fontSize:"clamp(36px,8vw,56px)", fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em", whiteSpace:"nowrap" }}>49,90 KM</span>
          </div>

          {/* Countdown */}
          <div style={{ display:"inline-flex", gap:10, marginBottom:28 }}>
            {([[h,"SAT"],[m,"MIN"],[s,"SEK"]] as [number,string][]).map(([val, lab], i) => (
              <div key={i} style={{ textAlign:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"14px 18px", minWidth:64 }}>
                <div style={{ fontSize:28, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em", lineHeight:1 }}>{String(val).padStart(2,"0")}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.38)", fontFamily:F, letterSpacing:"0.1em", marginTop:4 }}>{lab}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
            {([
              [Truck,       "Dostava 10,00 KM"],
              [Package,     "Plaćanje pouzećem"],
              [ShieldCheck, "1 god. garancija"],
            ] as [React.ElementType, string][]).map(([Icon, text], i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Icon size={15} color={GREEN} />
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.58)", fontFamily:F }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order card */}
        <motion.div {...FU} style={{ background:"#fff", borderRadius:28, padding:"clamp(24px,5vw,48px)", boxShadow:"0 40px 100px rgba(0,0,0,0.4)" }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:GREEN, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:`0 12px 40px rgba(16,185,129,0.4)` }}>
                <CheckCircle size={40} color="#fff" />
              </div>
              <h3 style={{ fontSize:28, fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:"0 0 12px" }}>Narudžba primljena!</h3>
              <p style={{ fontSize:15, color:MUTED, fontFamily:F, lineHeight:1.7, maxWidth:380, margin:"0 auto" }}>
                Kontaktiraćemo vas u kratkom roku radi potvrde i dogovora oko dostave. Hvala na povjerenju!
              </p>
            </div>
          ) : (
            <>
              {/* SD options */}
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:800, color:MUTED, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:14 }}>Odaberite SD karticu</div>
                <div className="k-sd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {([
                    { val:"none" as SD, label:"Bez SD kartice",  extra:"Osnovna cijena", badge:null },
                    { val:"64"   as SD, label:"SD kartica 64GB", extra:"+9,90 KM",        badge:"Preporučeno" },
                    { val:"128"  as SD, label:"SD kartica 128GB",extra:"+11,90 KM",       badge:"Max. kapacitet" },
                  ]).map(({ val, label, extra, badge }) => {
                    const active = sd === val;
                    return (
                      <div key={val} onClick={() => setSd(val)} style={{ border:`2px solid ${active?BLUE:BORDER}`, background:active?"#EFF6FF":"#FAFAFA", borderRadius:14, padding:"14px 14px", cursor:"pointer", boxShadow:active?`0 0 0 4px rgba(37,99,235,0.1)`:"none", transition:"all 0.18s", position:"relative" }}>
                        {badge && <div style={{ position:"absolute", top:-1, right:-1, background:active?BLUE:"#94A3B8", color:"#fff", fontSize:8, fontWeight:800, padding:"2px 8px", borderRadius:"0 12px 0 8px", fontFamily:F, letterSpacing:"0.05em" }}>{badge}</div>}
                        <div style={{ marginBottom:7 }}><HardDrive size={16} color={active?BLUE:MUTED} /></div>
                        <div style={{ fontSize:12, fontWeight:700, color:active?NAVY:MUTED, fontFamily:F, marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:13, fontWeight:800, color:active?BLUE:MUTED, fontFamily:F }}>{extra}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="k-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                  {([
                    { key:"ime",     label:"Ime i prezime", type:"text", ph:"Amira Kovačević" },
                    { key:"telefon", label:"Telefon",       type:"tel",  ph:"061 234 567" },
                    { key:"adresa",  label:"Adresa",        type:"text", ph:"Ulica i broj" },
                    { key:"grad",    label:"Grad",          type:"text", ph:"Sarajevo" },
                  ] as { key: keyof typeof fields; label:string; type:string; ph:string }[]).map(({ key, label, type, ph }) => (
                    <div key={key}>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 }}>{label}</label>
                      <input type={type} value={fields[key]} placeholder={ph}
                        onChange={e => { setFields(f => ({ ...f, [key]:e.target.value })); setErrors(er => ({ ...er, [key]:"" })); }}
                        style={{ width:"100%", padding:"13px 14px", border:`1.5px solid ${errors[key]?RED:BORDER}`, borderRadius:12, fontSize:14, fontFamily:F, color:NAVY, background:"#fff", boxSizing:"border-box", WebkitAppearance:"none", outline:"none" }}
                        onFocus={e => { e.target.style.borderColor=BLUE; e.target.style.boxShadow=`0 0 0 3px rgba(37,99,235,0.1)`; }}
                        onBlur={e  => { e.target.style.borderColor=errors[key]?RED:BORDER; e.target.style.boxShadow="none"; }}
                      />
                      {errors[key] && <p style={{ margin:"5px 0 0", fontSize:11, color:RED, fontFamily:F }}>{errors[key]}</p>}
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:BG, border:`1px solid ${BORDER}`, borderRadius:14, padding:"14px 20px", marginBottom:24 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:NAVY, fontFamily:F }}>Količina</span>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <button type="button" onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:34, height:34, borderRadius:10, border:`1.5px solid ${BORDER}`, background:"#fff", cursor:"pointer", fontSize:18, fontWeight:700, color:NAVY, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                    <span style={{ fontSize:18, fontWeight:800, color:NAVY, fontFamily:F, minWidth:24, textAlign:"center" }}>{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(5,q+1))} style={{ width:34, height:34, borderRadius:10, border:`1.5px solid ${BLUE}`, background:BLUE, cursor:"pointer", fontSize:18, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                  </div>
                </div>

                {srvErr && <div style={{ padding:"12px 16px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, fontSize:13, color:RED, fontFamily:F, marginBottom:16 }}>{srvErr}</div>}

                {/* Submit block */}
                <div style={{ background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, borderRadius:20, padding:"24px 26px", boxShadow:`0 12px 40px rgba(37,99,235,0.32)` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.48)", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:4 }}>Ukupno za plaćanje</div>
                      <div style={{ fontSize:36, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em", lineHeight:1 }}>{fmt(total)}</div>
                    </div>
                    <div style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.28)", borderRadius:12, padding:"10px 16px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.08em" }}>Dostava</div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#fff", fontFamily:F }}>10,00 KM</div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width:"100%", padding:"16px 24px", background:loading?"rgba(255,255,255,0.5)":"#fff", color:BLUE, border:"none", borderRadius:14, fontSize:16, fontWeight:900, fontFamily:F, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(0,0,0,0.14)", letterSpacing:"-0.01em" }}>
                    {loading ? "Šalje se..." : (<>Naruči odmah — Plaćanje pouzećem <ArrowRight size={17} /></>)}
                  </button>
                  <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:14, flexWrap:"wrap" }}>
                    {["Bez predujma","Dostava 24-48h","Garancija 1 god."].map((t,i) => (
                      <span key={i} style={{ fontSize:11, color:"rgba(255,255,255,0.42)", fontFamily:F, display:"flex", alignItems:"center", gap:4 }}>
                        <CheckCircle size={11} color={GREEN} /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
      <style suppressHydrationWarning>{`@media(max-width:580px){.k-sd-grid{grid-template-columns:1fr!important;}.k-form-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <section style={{ background:BG, padding:"100px 0" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px" }}>
        <motion.div {...FU} style={{ textAlign:"center", marginBottom:56 }}>
          <p style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Pitanja i odgovori</p>
          <h2 style={{ fontSize:"clamp(24px,3.2vw,42px)", fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.03em", margin:0 }}>Česta pitanja</h2>
        </motion.div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {FAQ_DATA.map(({ q, a }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={VP} transition={{ duration:0.4, delay:i*0.06, ease:EASE }}
              style={{ background:"#fff", border:`1.5px solid ${open===i?BLUE:BORDER}`, borderRadius:18, overflow:"hidden", boxShadow:open===i?`0 0 0 4px rgba(37,99,235,0.06)`:"0 2px 12px rgba(0,0,0,0.04)", transition:"all 0.2s" }}
            >
              <button onClick={() => setOpen(open===i?null:i)} style={{ width:"100%", padding:"20px 24px", background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, textAlign:"left" }}>
                <span style={{ fontSize:15, fontWeight:700, color:open===i?BLUE:NAVY, fontFamily:F, flex:1 }}>{q}</span>
                <div style={{ flexShrink:0, color:open===i?BLUE:MUTED }}>
                  {open===i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              <AnimatePresence>
                {open===i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}>
                    <div style={{ padding:"0 24px 20px 24px", borderTop:`1px solid ${BORDER}`, paddingTop:16, fontSize:14, color:MUTED, fontFamily:F, lineHeight:1.75 }}>{a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:NAVY, padding:"64px 24px 32px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div className="k-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Camera size={18} color="#fff" />
              </div>
              <span style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:F, letterSpacing:"-0.04em" }}>Cartly.ba</span>
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.38)", fontFamily:F, lineHeight:1.72, maxWidth:280 }}>
              Premium proizvodi za zaštitu i pametni dom. Dostava širom Bosne i Hercegovine.
            </p>
          </div>
          {([
            { title:"Kupovina",  links:["Naruči odmah","Specifikacije","FAQ"] },
            { title:"Podrška",   links:["Kontakt","Dostava","Garancija"] },
            { title:"Pravno",    links:["Politika privatnosti","Uvjeti"] },
          ]).map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.3)", fontFamily:F, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:18 }}>{title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {links.map(l => (
                  <a key={l} href="#order" style={{ fontSize:14, color:"rgba(255,255,255,0.5)", fontFamily:F, textDecoration:"none", transition:"color 0.2s" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color="#fff"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color="rgba(255,255,255,0.5)"}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:28, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", gap:22, flexWrap:"wrap" }}>
            {([
              [Lock,  "Sigurna kupovina"],
              [Truck, "Brza dostava"],
              [Phone, "Podrška dostupna"],
            ] as [React.ElementType, string][]).map(([Icon, text], i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <Icon size={14} color={GREEN} />
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontFamily:F }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.22)", fontFamily:F, margin:0 }}>© 2025 Cartly.ba · Sva prava zadržana</p>
        </div>
      </div>
      <style suppressHydrationWarning>{`@media(max-width:700px){.k-footer-grid{grid-template-columns:1fr!important;}}`}</style>
    </footer>
  );
}

/* ─── FLOATING CTA ───────────────────────────────────────────────── */
function FloatingCTA({ onOrder }: { onOrder: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      {/* Mobile bar */}
      <div className="k-mob-bar" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:8000, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderTop:"1px solid rgba(255,255,255,0.6)", padding:"10px 20px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 -8px 32px rgba(0,0,0,0.1)", height:78, gap:14 }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:1 }}>
            <span style={{ fontSize:11, color:MUTED, textDecoration:"line-through", fontFamily:F }}>79,90</span>
            <span style={{ background:RED, color:"#fff", fontSize:8, fontWeight:800, padding:"1px 5px", borderRadius:4, fontFamily:F }}>-38%</span>
          </div>
          <div style={{ fontSize:24, fontWeight:900, color:NAVY, fontFamily:F, letterSpacing:"-0.04em", lineHeight:1 }}>49,90 KM</div>
          <div style={{ fontSize:10, color:GREEN, fontWeight:700, fontFamily:F, marginTop:2, display:"flex", alignItems:"center", gap:3 }}>
            <Truck size={9} color={MUTED} /> Dostava 10,00 KM
          </div>
        </div>
        <button onClick={onOrder}
          style={{ flex:1, padding:"14px 16px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:16, fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer", boxShadow:`0 6px 20px rgba(37,99,235,0.4)`, display:"flex", alignItems:"center", justifyContent:"center", gap:8, maxWidth:200 }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >
          Naruči odmah <ArrowRight size={15} />
        </button>
      </div>

      {/* Desktop corner */}
      <AnimatePresence>
        {show && (
          <motion.button initial={{ opacity:0, scale:0.8, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.8, y:20 }} transition={{ duration:0.3, ease:EASE }}
            onClick={onOrder} className="k-desk-fab"
            style={{ position:"fixed", bottom:32, right:32, zIndex:8000, padding:"16px 28px", background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color:"#fff", border:"none", borderRadius:20, fontSize:15, fontWeight:800, fontFamily:F, cursor:"pointer", boxShadow:`0 12px 48px rgba(37,99,235,0.45)`, display:"flex", alignItems:"center", gap:8 }}
          >
            Naruči — 49,90 KM <ArrowRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <style suppressHydrationWarning>{`
        .k-mob-bar  { display: flex !important; }
        .k-desk-fab { display: none !important; }
        @media(min-width: 640px) {
          .k-mob-bar  { display: none !important; }
          .k-desk-fab { display: flex !important; }
        }
      `}</style>
    </>
  );
}

/* ─── BACK TO TOP ────────────────────────────────────────────────── */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
          onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} className="k-btt"
          style={{ position:"fixed", bottom:32, left:32, zIndex:8000, width:44, height:44, borderRadius:14, background:"#fff", border:`1px solid ${BORDER}`, boxShadow:"0 4px 20px rgba(0,0,0,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
        >
          <ChevronUp size={20} color={NAVY} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function KameraClient() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    if (w.fbq) w.fbq("track", "ViewContent", { content_name: "V380 Pro 12MP Kamera", content_ids: ["kamera-v380"], content_type: "product", value: 49.90, currency: "BAM" });
  }, []);

  function fireFbq(...args: unknown[]) {
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    if (typeof window !== "undefined" && w.fbq) w.fbq(...args);
  }

  function openOrder() {
    setModalOpen(true);
    fireFbq("track", "InitiateCheckout", { content_name: "V380 Pro 12MP Kamera", content_ids: ["kamera-v380"], value: 49.90, currency: "BAM" });
  }
  function scrollToOrder() {
    if (window.innerWidth < 640) { openOrder(); return; }
    fireFbq("track", "InitiateCheckout", { content_name: "V380 Pro 12MP Kamera", content_ids: ["kamera-v380"], value: 49.90, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${BG}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        @keyframes kPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
      `}</style>

      <ProgressBar />
      <SocialProof />
      <Header onOrder={scrollToOrder} />

      <main>
        <Hero onOrder={scrollToOrder} />
        <TrustSection />
        <FeaturesSection />
        <HowItWorks />
        <AdvantagesGrid />
        <WhySection />
        <Reviews />
        <Specs />
        <OfferSection />
        <FAQSection />
      </main>

      <Footer />
      <FloatingCTA onOrder={scrollToOrder} />
      <BackToTop />
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
