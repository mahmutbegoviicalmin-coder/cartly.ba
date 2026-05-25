import { NextRequest } from "next/server";
import { Resend } from "resend";

function sarajevoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    day:    "2-digit", month: "2-digit", year: "numeric",
    hour:   "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { firma, grad, adresa, kolicina, kontakt } = await request.json() as {
      firma: string; grad: string; adresa: string; kolicina: string; kontakt: string;
    };

    const now = new Date();

    await resend.emails.send({
      from:    "onboarding@resend.dev",
      to:      process.env.OWNER_EMAIL!,
      subject: `#B2B UPIT — ${firma} — ${kolicina} — ${sarajevoTime(now)}`,
      html: `
<!DOCTYPE html>
<html lang="bs">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <tr>
      <td style="background:#0A0A0A;border-radius:12px 12px 0 0;padding:28px 32px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">Poslovni upit</p>
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#fff;">B2B Narudžba — Radne Patike S3</h1>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">${sarajevoTime(now)}</p>
      </td>
    </tr>

    <tr>
      <td style="background:#fff;padding:32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">

        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Podaci firme</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${[
            { label: "Firma",    value: firma },
            { label: "Kontakt", value: kontakt },
            { label: "Grad",    value: grad },
            { label: "Adresa",  value: adresa },
          ].map(r => `
          <tr><td style="padding-bottom:8px;">
            <div style="background:#F7F7F7;border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#AAA;text-transform:uppercase;letter-spacing:0.08em;">${r.label}</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${r.value}</p>
            </div>
          </td></tr>`).join("")}
        </table>

        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B00;text-transform:uppercase;letter-spacing:0.1em;">Tražena količina</p>
        <div style="background:#FFF8F5;border:1.5px solid #FF6B00;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#0A0A0A;">${kolicina}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">pari Radnih Patika S3 Tactical Black</p>
        </div>

        <a href="tel:${kontakt}"
          style="display:inline-block;padding:13px 24px;background:#FF6B00;color:#fff;text-decoration:none;font-size:14px;font-weight:700;border-radius:9px;">
          Kontaktiraj firmu
        </a>

      </td>
    </tr>

    <tr>
      <td style="background:#F9F9F9;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#aaa;">Cartly.ba &bull; B2B Upit primljen: ${sarajevoTime(now)}</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("B2B inquiry error:", err);
    return Response.json({ success: false, error: "Greška pri slanju." }, { status: 500 });
  }
}
