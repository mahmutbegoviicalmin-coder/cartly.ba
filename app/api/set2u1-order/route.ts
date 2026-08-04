import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";

const UNIT_PRICE = 104.9;
const DELIVERY = 10.0;
const PRODUCT_LABEL = "Set 2 u 1 — Bušilica + Brusilica";

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `S2U-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}. u ${h}:${min}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ime, prezime, telefon, adresa, grad, postanski_broj, kolicina } = body;

    if (!ime || !prezime || !telefon || !adresa || !grad || !postanski_broj) {
      return NextResponse.json(
        { success: false, error: "Nedostaju obavezna polja." },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Math.min(5, Number(kolicina) || 1));
    const fullName = `${String(ime).trim()} ${String(prezime).trim()}`;
    const fullAdresa = `${String(adresa).trim()}, ${String(postanski_broj).trim()} ${String(grad).trim()}`;

    const now = new Date();
    const orderNumber = generateOrderNumber(now);
    const cijena_proizvoda = UNIT_PRICE * qty;
    const ukupno = cijena_proizvoda + DELIVERY;

    const { error: dbError } = await getSupabaseAdmin()
      .from("orders")
      .insert({
        ime: fullName,
        telefon,
        adresa: fullAdresa,
        grad,
        velicine: [{ velicina: PRODUCT_LABEL, kolicina: qty }],
        ukupno_pari: qty,
        cijena_proizvoda,
        dostava: DELIVERY,
        ukupno,
        status: "nova",
        order_number: orderNumber,
      });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { success: false, error: `DB greška: ${dbError.message}` },
        { status: 500 }
      );
    }

    sendCAPIEvent({
      eventId: orderNumber,
      eventName: "Purchase",
      value: ukupno,
      currency: "BAM",
      contentName: PRODUCT_LABEL,
      phone: telefon,
      ip: getClientIP(request),
      userAgent: getClientUA(request),
      fbc: getFbc(request),
      fbp: getFbp(request),
    }).catch(console.error);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Cartly.ba <onboarding@resend.dev>",
        to: process.env.OWNER_EMAIL!,
        subject: `#NARUDZBA [SET 2U1] - ${fullName} - x${qty} - ${sarajevoTime(now)}`,
        html: `
          <div style="font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #F0F0F0;">
            <div style="background:#B33000;padding:28px 36px;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Nova narudžba — Set 2 u 1</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">${orderNumber} · ${formatDateBosnian(now)}</p>
            </div>
            <div style="padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${[["Ime i prezime", fullName], ["Telefon", telefon], ["Adresa", fullAdresa], ["Grad", grad]].map(([lbl, val]) => `
                <tr><td style="padding-bottom:8px;">
                  <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;">${lbl}</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${val}</p>
                  </div>
                </td></tr>`).join("")}
              </table>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:7px 0;color:#888;font-size:14px;width:140px;">Proizvod</td><td style="padding:7px 0;font-weight:600;font-size:14px;">${PRODUCT_LABEL}</td></tr>
                <tr><td style="padding:7px 0;color:#888;font-size:14px;">Količina</td><td style="padding:7px 0;font-weight:600;font-size:14px;">${qty}×</td></tr>
                <tr><td style="padding:7px 0;color:#888;font-size:14px;">Cijena</td><td style="padding:7px 0;font-weight:600;font-size:14px;">${fmtKM(cijena_proizvoda)}</td></tr>
                <tr><td style="padding:7px 0;color:#888;font-size:14px;">Dostava</td><td style="padding:7px 0;font-weight:600;font-size:14px;">${fmtKM(DELIVERY)}</td></tr>
                <tr style="border-top:2px solid #F0F0F0;">
                  <td style="padding:14px 0 0;font-size:15px;font-weight:700;">Ukupno</td>
                  <td style="padding:14px 0 0;color:#B33000;font-size:20px;font-weight:800;">${fmtKM(ukupno)}</td>
                </tr>
              </table>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Set 2u1 order error:", err);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
