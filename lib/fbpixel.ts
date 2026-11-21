export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const pageview = () => {
  window.fbq("track", "PageView");
};

/**
 * Fire a browser-side Pixel event.
 * Pass eventID (= orderNumber) to deduplicate against the server-side CAPI event.
 */
// InitiateCheckout once per page view: a page CTA, its inline form and the global
// order popup all report it, and the popup can be opened many times. Without this
// one visitor counted as 2–5 checkouts in Ads Manager.
const checkoutSent = new Set<string>();

export const event = (name: string, options = {}, eventID?: string, attempt = 0): void => {
  if (typeof window === "undefined") return;
  if (name === "InitiateCheckout" && attempt === 0) {
    const page = window.location.pathname;
    if (checkoutSent.has(page)) return;
    checkoutSent.add(page);
  }
  // Pixel script loads afterInteractive, so early events (e.g. ViewContent on mount)
  // can fire before fbq exists. Retry for up to ~8s instead of silently dropping them.
  if (typeof window.fbq !== "function") {
    if (attempt < 32) setTimeout(() => event(name, options, eventID, attempt + 1), 250);
    return;
  }
  if (eventID) {
    window.fbq("track", name, options, { eventID });
  } else {
    window.fbq("track", name, options);
  }
};
