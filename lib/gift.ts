// "Poklon iznenađenja" add-on, shared by every product checkout.
//
// Storage rule (no schema change needed, works for every order table):
//   cijena_proizvoda + dostava + GIFT_PRICE === ukupno  →  the order includes the gift.
// The order email states it explicitly; admin + courier exports detect it via hasGift().

export const GIFT_PRICE = 5;
export const GIFT_LABEL = "Poklon iznenađenja";
export const GIFT_CONTENT_ID = "poklon-iznenadjenja";

/** True only when the client explicitly opted in (`poklon: true`). */
export function wantsGift(body: unknown): boolean {
  return !!body && typeof body === "object" && (body as Record<string, unknown>).poklon === true;
}

type PricedOrder = {
  ukupno?: unknown;
  cijena_proizvoda?: unknown;
  dostava?: unknown;
  velicine?: { velicina: number | string }[] | null;
};

export function hasGift(o: PricedOrder): boolean {
  if ((o.velicine ?? []).some((v) => /poklon/i.test(String(v.velicina)))) return true;
  const ukupno = Number(o.ukupno);
  const cijena = Number(o.cijena_proizvoda);
  const dostava = Number(o.dostava ?? 0);
  if (!Number.isFinite(ukupno) || !Number.isFinite(cijena)) return false;
  return Math.abs(ukupno - cijena - (Number.isFinite(dostava) ? dostava : 0) - GIFT_PRICE) < 0.01;
}

/** Subject tag, e.g. "[BRUSILICA + POKLON]". */
export function giftTag(gift: boolean): string {
  return gift ? " + POKLON" : "";
}

/** Highlighted block for the owner email. Render only when the gift was chosen. */
export function giftEmailBanner(gift: boolean): string {
  if (!gift) return "";
  return `<div style="background:#E8F7EE;border:1.5px solid #16A34A;border-radius:10px;padding:14px 16px;margin:0 0 22px;">
  <p style="margin:0;font-size:15px;font-weight:800;color:#15803D;">🎁 KUPAC JE ODABRAO POKLON IZNENAĐENJA (+${GIFT_PRICE},00 KM)</p>
  <p style="margin:4px 0 0;font-size:13px;color:#0A0A0A;">Ubaciti poklon u paket. Iznos je uračunat u ukupno za naplatu.</p>
</div>`;
}
