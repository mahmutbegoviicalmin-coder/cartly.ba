import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ime, telefon, adresa, grad, velicine } = body;

    const selectedSizes = (velicine as { velicina: number; kolicina: number }[]).filter(
      (v) => v.kolicina > 0
    );
    const velicineList = selectedSizes
      .map((v) => `EU ${v.velicina} — ${v.kolicina} par(a)`)
      .join("<br/>");
    const ukupnoPari = selectedSizes.reduce((sum, v) => sum + v.kolicina, 0);
    const ukupnoCijena = (ukupnoPari * 59.9 + 10.0).toFixed(2).replace(".", ",");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.OWNER_EMAIL!,
      subject: `Nova narudžba — Radne Patike S3 — ${ime}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #FF6B00; padding: 24px 32px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">Nova narudžba</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">Radne Patike S3 — Tactical Black</p>
          </div>

          <div style="padding: 32px; background: #fff; border: 1px solid #E5E5E5; border-top: none;">
            <h2 style="font-size: 16px; color: #0A0A0A; margin: 0 0 16px;">Podaci kupca</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Ime i prezime</td><td style="padding: 8px 0; color: #0A0A0A; font-weight: 600;">${ime}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Telefon</td><td style="padding: 8px 0; color: #0A0A0A; font-weight: 600;">${telefon}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Adresa</td><td style="padding: 8px 0; color: #0A0A0A; font-weight: 600;">${adresa}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Grad</td><td style="padding: 8px 0; color: #0A0A0A; font-weight: 600;">${grad}</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #F0F0F0; margin: 24px 0;" />

            <h2 style="font-size: 16px; color: #0A0A0A; margin: 0 0 16px;">Naručene veličine</h2>
            <p style="font-size: 14px; color: #0A0A0A; line-height: 1.8;">${velicineList}</p>

            <hr style="border: none; border-top: 1px solid #F0F0F0; margin: 24px 0;" />

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 14px; color: #666;">
                Ukupno pari: <strong style="color: #0A0A0A;">${ukupnoPari}</strong><br/>
                Dostava: <strong style="color: #0A0A0A;">10,00 KM</strong>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 13px; color: #666;">Ukupno za platiti</p>
                <p style="margin: 4px 0 0; font-size: 26px; font-weight: 800; color: #FF6B00;">${ukupnoCijena} KM</p>
              </div>
            </div>
          </div>

          <div style="padding: 16px 32px; background: #F5F5F5; font-size: 12px; color: #999; text-align: center;">
            Plaćanje pouzećem &bull; Euro Express &bull; 1–3 radna dana
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Order email error:", error);
    return Response.json({ success: false, error: "Greška pri slanju narudžbe." }, { status: 500 });
  }
}
