import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const UNIT_PRICE = 129.9;
const DELIVERY = 10.0;

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `CRT-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${day}. ${month} ${year}. u ${h}:${min}`;
}

function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, kolicina } = body;

    if (!ime || !telefon || !adresa || !grad) {
      return NextResponse.json(
        { success: false, error: "Nedostaju obavezna polja." },
        { status: 400 }
      );
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
        velicine: [{ velicina: "V380 Pro Kamera 12MP", kolicina: qty }],
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
        {
          success: false,
          error: `DB greška: ${dbError.message || "nepoznata greška"} (code: ${dbError.code || "?"}, details: ${dbError.details || "-"}, hint: ${dbError.hint || "-"})`,
        },
        { status: 500 }
      );
    }

    // Email notification
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Cartly.ba <onboarding@resend.dev>",
        to: process.env.OWNER_EMAIL!,
        subject: `Nova narudžba ${orderNumber} — V380 Pro Kamera`,
        html: `
          <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #F0F0F0;">
            <div style="background: #FF6B00; padding: 32px 40px;">
              <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Nova narudžba</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">${orderNumber} &nbsp;·&nbsp; ${formatDateBosnian(now)}</p>
            </div>
            <div style="padding: 32px 40px;">
              <h2 style="font-size: 13px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px;">Podaci kupca</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px; width: 140px;">Ime i prezime</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${ime}</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Telefon</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${telefon}</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Adresa</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${adresa}, ${grad}</td></tr>
              </table>
              <h2 style="font-size: 13px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px;">Narudžba</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px; width: 140px;">Proizvod</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">V380 Pro Kamera 12MP</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Količina</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${qty}×</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Cijena</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${fmtKM(cijena_proizvoda)}</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Poklon</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #16a34a;">SD kartica 64GB — GRATIS</td></tr>
                <tr><td style="padding: 7px 0; color: #888; font-size: 14px;">Dostava</td><td style="padding: 7px 0; font-weight: 600; font-size: 14px; color: #0A0A0A;">${fmtKM(DELIVERY)}</td></tr>
                <tr style="border-top: 2px solid #F0F0F0;">
                  <td style="padding: 14px 0 0; color: #0A0A0A; font-size: 15px; font-weight: 700;">Ukupno</td>
                  <td style="padding: 14px 0 0; color: #FF6B00; font-size: 20px; font-weight: 800;">${fmtKM(ukupno)}</td>
                </tr>
              </table>
            </div>
            <div style="background: #F9F9F9; padding: 20px 40px; border-top: 1px solid #F0F0F0;">
              <p style="font-size: 12px; color: #aaa; margin: 0;">Plaćanje pouzećem · Euro Express · 1–3 radna dana</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Kamera order route error:", err);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
