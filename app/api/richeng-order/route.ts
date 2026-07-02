import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";

const UNIT_PRICE = 49.90;
const DELIVERY   = 10;

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `RCH-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}. u ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

function fmtKM(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, velicina, kolicina } = body;

    if (!ime || !telefon || !adresa || !grad || !velicina) {
      return NextResponse.json({ success: false, error: "Nedostaju obavezna polja." }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(5, Number(kolicina) || 1));
    const cijena_proizvoda = qty * UNIT_PRICE;
    const ukupno = cijena_proizvoda + DELIVERY;
    const now = new Date();
    const orderNumber = generateOrderNumber(now);

    const { error: dbError } = await getSupabaseAdmin()
      .from("orders")
      .insert({
        ime,
        telefon,
        adresa,
        grad,
        velicine: [{ velicina: `Richeng S3 — br. ${velicina}`, kolicina: qty }],
        ukupno_pari: qty,
        cijena_proizvoda,
        dostava: DELIVERY,
        ukupno,
        status: "nova",
        order_number: orderNumber,
      });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json({ success: false, error: `DB greška: ${dbError.message}` }, { status: 500 });
    }

    sendCAPIEvent({
      eventId:     orderNumber,
      eventName:   "Purchase",
      value:       ukupno,
      currency:    "BAM",
      contentName: "Richeng S3 Radne Patike",
      phone:       telefon,
      ip:          getClientIP(request),
      userAgent:   getClientUA(request),
      fbc:         getFbc(request),
      fbp:         getFbp(request),
    }).catch(console.error);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Cartly.ba <onboarding@resend.dev>",
        to: process.env.OWNER_EMAIL!,
        subject: `#NARUDZBA [RICHENG S3] - ${ime} - br.${velicina} x${qty} - ${sarajevoTime(now)}`,
        html: `
          <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #F0F0F0;">
            <div style="background: #111; padding: 32px 40px;">
              <h1 style="color:#fff; margin:0; font-size:22px; font-weight:800; letter-spacing:-0.02em;">Nova narudžba</h1>
              <p style="color:rgba(255,255,255,0.6); margin:6px 0 0; font-size:13px;">${orderNumber} &nbsp;·&nbsp; ${formatDateBosnian(now)}</p>
            </div>
            <div style="padding: 32px 40px;">
              <h2 style="font-size:13px; font-weight:600; color:#999; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Podaci kupca</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${[["Ime i prezime", ime], ["Telefon", telefon], ["Adresa", adresa], ["Grad", grad]].map(([lbl, val]) => `
                <tr><td style="padding-bottom:8px;">
                  <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;">${lbl}</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${val}</p>
                  </div>
                </td></tr>`).join("")}
              </table>
              <h2 style="font-size:13px; font-weight:600; color:#999; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 16px;">Narudžba</h2>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:7px 0; color:#888; font-size:14px; width:140px;">Proizvod</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">Richeng S3 Radne Patike</td></tr>
                <tr><td style="padding:7px 0; color:#888; font-size:14px;">Broj</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${velicina}</td></tr>
                <tr><td style="padding:7px 0; color:#888; font-size:14px;">Količina</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${qty}×</td></tr>
                <tr><td style="padding:7px 0; color:#888; font-size:14px;">Cijena</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${fmtKM(cijena_proizvoda)}</td></tr>
                <tr><td style="padding:7px 0; color:#888; font-size:14px;">Dostava</td><td style="padding:7px 0; font-weight:600; font-size:14px; color:#0A0A0A;">${fmtKM(DELIVERY)}</td></tr>
                <tr style="border-top:2px solid #F0F0F0;">
                  <td style="padding:14px 0 0; color:#0A0A0A; font-size:15px; font-weight:700;">Ukupno</td>
                  <td style="padding:14px 0 0; color:#111; font-size:20px; font-weight:800;">${fmtKM(ukupno)}</td>
                </tr>
              </table>
            </div>
            <div style="background:#F9F9F9; padding:20px 40px; border-top:1px solid #F0F0F0;">
              <p style="font-size:12px; color:#aaa; margin:0;">Plaćanje pouzećem · Euro Express · 1–3 radna dana</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Richeng order route error:", err);
    return NextResponse.json({ success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." }, { status: 500 });
  }
}
