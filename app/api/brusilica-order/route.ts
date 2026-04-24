import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const UNIT_PRICE = 74.9;
const DELIVERY   = 10.0;

function generateOrderNumber(date: Date): string {
  const y    = date.getFullYear();
  const m    = String(date.getMonth() + 1).padStart(2, "0");
  const d    = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `BRS-${y}${m}${d}-${rand}`;
}

function formatDateBosnian(date: Date): string {
  const months = [
    "januar","februar","mart","april","maj","juni",
    "juli","august","septembar","oktobar","novembar","decembar",
  ];
  const h   = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}. u ${h}:${min}`;
}

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).format(date);
}

function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, napomena } = body;

    if (!ime || !telefon || !adresa || !grad) {
      return NextResponse.json(
        { success: false, error: "Nedostaju obavezna polja." },
        { status: 400 }
      );
    }

    const cijena_proizvoda = UNIT_PRICE;
    const ukupno          = cijena_proizvoda + DELIVERY;
    const now             = new Date();
    const orderNumber     = generateOrderNumber(now);

    const { error: dbError } = await getSupabaseAdmin()
      .from("orders")
      .insert({
        ime,
        telefon,
        adresa,
        grad,
        velicine:        [{ velicina: "Akumulatorska Brusilica", kolicina: 1 }],
        ukupno_pari:     1,
        cijena_proizvoda,
        dostava:         DELIVERY,
        ukupno,
        status:          "nova",
        order_number:    orderNumber,
      });

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { success: false, error: `DB greška: ${dbError.message} (${dbError.code})` },
        { status: 500 }
      );
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:    "Cartly.ba <onboarding@resend.dev>",
        to:      process.env.OWNER_EMAIL!,
        subject: `#NARUDZBA [BRUSILICA] - ${ime} - 1kom - ${sarajevoTime(now)}`,
        html: `
<div style="font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #F0F0F0;">
  <div style="background:#FF6B00;padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Nova narudžba</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${orderNumber} &nbsp;·&nbsp; ${formatDateBosnian(now)}</p>
  </div>
  <div style="padding:32px 40px;">
    <h2 style="font-size:13px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Podaci kupca</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Ime i prezime</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${ime}</p></td>
            <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
          </tr></table>
        </div>
      </td></tr>
      <tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Telefon</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${telefon}</p></td>
            <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
          </tr></table>
        </div>
      </td></tr>
      <tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Adresa</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${adresa}</p></td>
            <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
          </tr></table>
        </div>
      </td></tr>
      <tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Grad</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;user-select:all;cursor:pointer;">${grad}</p></td>
            <td style="width:22px;text-align:right;vertical-align:middle;font-size:14px;color:#BBBBBB;padding-left:6px;">📋</td>
          </tr></table>
        </div>
      </td></tr>
      ${napomena ? `<tr><td style="padding-bottom:8px;">
        <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">Napomena</p>
          <p style="margin:0;font-size:14px;font-weight:500;color:#0A0A0A;">${napomena}</p>
        </div>
      </td></tr>` : ""}
    </table>
    <h2 style="font-size:13px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">Narudžba</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:7px 0;color:#888;font-size:14px;width:140px;">Proizvod</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">Akumulatorska Brusilica</td></tr>
      <tr><td style="padding:7px 0;color:#888;font-size:14px;">Komplet</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">2× M18 B5 Baterija, M12-18 FC Punjač, HD Kaseta</td></tr>
      <tr><td style="padding:7px 0;color:#888;font-size:14px;">Cijena</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">${fmtKM(cijena_proizvoda)}</td></tr>
      <tr><td style="padding:7px 0;color:#888;font-size:14px;">Dostava</td><td style="padding:7px 0;font-weight:600;font-size:14px;color:#0A0A0A;">${fmtKM(DELIVERY)} · Euro Express</td></tr>
      <tr style="border-top:2px solid #F0F0F0;">
        <td style="padding:14px 0 0;color:#0A0A0A;font-size:15px;font-weight:700;">Ukupno</td>
        <td style="padding:14px 0 0;color:#FF6B00;font-size:20px;font-weight:800;">${fmtKM(ukupno)}</td>
      </tr>
    </table>
  </div>
  <div style="background:#F9F9F9;padding:20px 40px;border-top:1px solid #F0F0F0;">
    <p style="font-size:12px;color:#aaa;margin:0;">Plaćanje pouzećem · Euro Express · 1–3 radna dana</p>
  </div>
</div>`,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Brusilica order route error:", err);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju narudžbe. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
