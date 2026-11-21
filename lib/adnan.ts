/**
 * Settlement with Adnan (tool supplier). Only for the admin dashboard; customers never see this.
 *
 * Per delivered (picked-up) parcel:  Adnan gets `cost`, we keep the rest after the
 * Skytec postage and the gift cost. A returned parcel costs us the postage only.
 */
export const ADNAN_PRODUCTS: Record<string, { label: string; cost: number; base: number }> = {
  // base = COD amount without the gift (price + paid delivery), used to spot the +5 KM gift.
  MKK: { label: "Makita brusilica 1500W",   cost: 29, base: 57.9 },
  MKB: { label: "Makita aku brusilica",     cost: 55, base: 84.9 },
  BRS: { label: "Milwaukee aku brusilica",  cost: 55, base: 84.9 },
  DWL: { label: "DeWalt set",               cost: 50, base: 79.9 },
};

/** Gift (brusne ploče): customer pays +5 KM, it costs us 2 KM → 3 KM profit. */
export const GIFT_PRICE = 5;
export const GIFT_COST = 2;

/** Skytec postage we pay per parcel when the shipment row doesn't carry it. */
export const DEFAULT_POSTAGE = 10.5;

export const ADNAN_PREFIXES = Object.keys(ADNAN_PRODUCTS);
