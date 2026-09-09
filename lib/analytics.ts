/**
 * Reusable Meta Pixel helpers.
 *
 * Pixel ID is read from NEXT_PUBLIC_META_PIXEL_ID, with a fallback to the
 * existing NEXT_PUBLIC_FB_PIXEL_ID used site-wide in app/layout.tsx.
 *
 * PageView is fired once from the root layout.
 * Product pages fire ViewContent on load, AddToCart on the first CTA,
 * InitiateCheckout when the order form is focused, and Purchase only
 * after the backend confirms the order.
 *
 * Purchase MUST fire only after the backend confirms the order.
 * Do not fire Purchase on CTA click or when the modal opens.
 */
import { event } from "@/lib/fbpixel";

export const PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;

type ProductPixel = {
  id: string;
  name: string;
  category: string;
  value: number;
};

function base(p: ProductPixel) {
  return {
    content_name: p.name,
    content_ids: [p.id],
    content_type: "product",
    content_category: p.category,
    currency: "BAM" as const,
    value: p.value,
  };
}

export function trackViewContent(p: ProductPixel) {
  event("ViewContent", { ...base(p), contents: [{ id: p.id, quantity: 1, item_price: p.value }] });
}

export function trackAddToCart(p: ProductPixel) {
  if (typeof window === "undefined") return;
  const key = `fb_atc_${p.id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* still fire */
  }
  event("AddToCart", {
    ...base(p),
    num_items: 1,
    contents: [{ id: p.id, quantity: 1, item_price: p.value }],
  });
}

export function trackInitiateCheckout(p: ProductPixel) {
  if (typeof window === "undefined") return;
  const key = `fb_ic_${p.id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* still fire */
  }
  event("InitiateCheckout", {
    ...base(p),
    num_items: 1,
    contents: [{ id: p.id, quantity: 1, item_price: p.value }],
  });
}

/**
 * Fire Purchase exactly once per successful order.
 *
 * Why this is gated:
 * - React re-renders must not send a second Purchase
 * - Refreshing the success screen must not send a second Purchase
 * - Duplicate API responses must not send a second Purchase
 *
 * Dedup keys:
 * - sessionStorage keyed by order ID (client)
 * - eventID = order ID so Meta can match this with the server CAPI event
 */
export function trackPurchase(p: ProductPixel & { orderId: string }) {
  if (typeof window === "undefined") return;
  if (!p.orderId) return;

  const key = `fb_purchase_${p.orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage can throw in private mode — still fire, CAPI event_id dedupes
  }

  event(
    "Purchase",
    {
      ...base(p),
      num_items: 1,
      order_id: p.orderId,
      contents: [{ id: p.id, quantity: 1, item_price: p.value }],
    },
    p.orderId
  );
}
