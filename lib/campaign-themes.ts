// Colours of each product landing page, so Black November elements on that
// page (tape icons, timer, order-form note) use the page's own palette instead
// of the store orange. `on` is the text colour that reads on `accent`.

export type PageTheme = { accent: string; on: string };

export const STORE_THEME: PageTheme = { accent: "#F45B39", on: "#FFFFFF" };

const THEMES: Record<string, PageTheme> = {
  "milwaukee-set-31":       { accent: "#DB011C", on: "#FFFFFF" },
  "dewalt-busilica":        { accent: "#FFC400", on: "#1D1D1F" },
  "brusilica":              { accent: "#CC0000", on: "#FFFFFF" },
  "motorna-pila":           { accent: "#E85C04", on: "#FFFFFF" },
  "milwaukee-busilica":     { accent: "#DB011C", on: "#FFFFFF" },
  "set-2u1":                { accent: "#DB011C", on: "#FFFFFF" },
  "zirafa-brusilica":       { accent: "#DC2626", on: "#FFFFFF" },
  "makita-brusilica":       { accent: "#FF3B30", on: "#FFFFFF" },
  "makita-brusilica-1500w": { accent: "#FF3B30", on: "#FFFFFF" },
  "masina-za-sisanje":      { accent: "#FF6B00", on: "#FFFFFF" },
  "celicna-cetka":          { accent: "#FF6B00", on: "#FFFFFF" },
  "radne-patike-aeox":      { accent: "#C14822", on: "#FFFFFF" },
  "radne-patike-hammer":    { accent: "#B33000", on: "#FFFFFF" },
  "radne-patike-richeng":   { accent: "#B33000", on: "#FFFFFF" },
  "kamera":                 { accent: "#2563EB", on: "#FFFFFF" },
  "airpods-pro":            { accent: "#FF3B30", on: "#FFFFFF" },
  "zvucnik":                { accent: "#FF6B00", on: "#FFFFFF" },
  "lezaljke":               { accent: "#1B4332", on: "#FFFFFF" },
  "komarnik-za-vrata":      { accent: "#5C8B5A", on: "#FFFFFF" },
  "usmjerivac-zraka":       { accent: "#1A5FFF", on: "#FFFFFF" },
  "prsluk-za-spasavanje":   { accent: "#FFC107", on: "#061B38" },
};

/** Theme for a pathname like "/dewalt-busilica" (store pages get the store orange). */
export function themeFor(pathname: string | null | undefined): PageTheme {
  const slug = (pathname || "/").split("/")[1] || "";
  return THEMES[slug] ?? STORE_THEME;
}
