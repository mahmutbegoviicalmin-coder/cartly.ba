import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";
import { sendCAPIEvent, getClientIP, getClientUA, getFbc, getFbp } from "@/lib/meta-capi";
import { guardCustomerOrder } from "@/lib/order-guard";
import { stampIp } from "@/lib/order-ip";

const UNIT_PRICE = 149;
const DELIVERY = 10.0;
const PRODUCT_LABEL = "Milwaukee Set 3.1";

function generateOrderNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `MS3-${y}${m}${d}-${rand}`;
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
    const guarded = await guardCustomerOrder(request, body, {
      requirePrezime: true,
      requirePostal: true,
    });
    if (!guarded.ok) return guarded.response;
    const ime = guarded.fields.imeFirst;
    const prezime = guarded.fields.prezime;
    const telefon = guarded.fields.telefon;
    const adresa = guarded.fields.adresa;
    const grad = guarded.fields.grad;
    const postanski_broj = guarded.fields.postanski;
    const { kolicina, externalId } = body;

    const qty = Math.max(1, Math.min(10, Number(kolicina) || 1));
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
        adresa: stampIp(fullAdresa, guarded.fields.ip),
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
        {
          success: false,
          error: `DB greška: ${dbError.message || "nepoznata greška"} (code: ${dbError.code || "?"})`,
        },
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
      externalId: externalId || "",
    }).catch(console.error);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Cartly.ba <onboarding@resend.dev>",
        to: process.env.OWNER_EMAIL!,
        subject: `#NARUDZBA [MILWAUKEE SET 3.1] - ${fullName} - ${qty}kom - ${sarajevoTime(now)}`,
        html: `
<!DOCTYPE html>
<html lang="bs">
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr>
      <td style="background:#DC0000;border-radius:12px 12px 0 0;padding:28px 32px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;">Nova narudžba</p>
        <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#ffffff;">Milwaukee Set 3.1</h1>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${orderNumber} · ${formatDateBosnian(now)}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#DC0000;text-transform:uppercase;letter-spacing:0.1em;">Podaci kupca</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${[
            ["Ime i prezime", fullName],
            ["Telefon", telefon],
            ["Adresa", fullAdresa],
            ["Grad", grad],
          ]
            .map(
              ([l, v]) => `
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#AAAAAA;text-transform:uppercase;letter-spacing:0.08em;">${l}</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">${v}</p>
            </div>
          </td></tr>`
            )
            .join("")}
        </table>

        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#DC0000;text-transform:uppercase;letter-spacing:0.1em;">Financijski pregled</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:8px;overflow:hidden;">
          <tr style="background:#FAFAFA;">
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">${qty} × ${PRODUCT_LABEL}</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">${fmtKM(cijena_proizvoda)}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #F0F0F0;">Dostava</td>
            <td style="padding:10px 16px;font-size:13px;color:#0A0A0A;font-weight:500;text-align:right;border-bottom:1px solid #F0F0F0;">${fmtKM(DELIVERY)}</td>
          </tr>
          <tr style="background:#FFF5F5;">
            <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#0A0A0A;">UKUPNO</td>
            <td style="padding:14px 16px;font-size:20px;font-weight:800;color:#DC0000;text-align:right;">${fmtKM(ukupno)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#F9F9F9;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">Cartly.ba · ${formatDateBosnian(now)}</p>
      </td>
    </tr>
  </table>
  </td></tr>
</table>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error("Resend email error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Milwaukee Set order error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju narudžbe." },
      { status: 500 }
    );
  }
}
