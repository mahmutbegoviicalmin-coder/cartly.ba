/**
 * Unfinished checkouts ("nedovršene narudžbe"): what a customer typed into an
 * order form before leaving without sending it. Stored next to the other
 * events in skytec_events (source "checkout_draft"), keyed by callback_uid
 * "draft:<id>" so every save of the same form updates one row.
 * Refused submissions are in the same table with source "order_reject".
 */
export const DRAFT_SOURCE = "checkout_draft";
export const REJECT_SOURCE = "order_reject";

export type DraftFields = {
  ime?: string; prezime?: string; telefon?: string; adresa?: string;
  grad?: string; postanski?: string; napomena?: string;
};

export type DraftPayload = DraftFields & {
  id: string;           // random per form fill, from the browser
  page: string;         // path the form is on
  product?: string;     // page title / product name
};

export const DRAFT_KEYS: (keyof DraftFields)[] = ["ime", "prezime", "telefon", "adresa", "grad", "postanski", "napomena"];
