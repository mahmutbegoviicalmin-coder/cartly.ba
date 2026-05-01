export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const pageview = () => {
  window.fbq("track", "PageView");
};

/**
 * Fire a browser-side Pixel event.
 * Pass eventID (= orderNumber) to deduplicate against the server-side CAPI event.
 */
export const event = (name: string, options = {}, eventID?: string) => {
  if (eventID) {
    window.fbq("track", name, options, { eventID });
  } else {
    window.fbq("track", name, options);
  }
};
