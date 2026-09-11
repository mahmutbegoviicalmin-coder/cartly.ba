// Product registry for courier exports.
//
// Kept dependency-free (no xlsx / supabase imports) so it is safe to import
// from client components like the admin dashboard.

type Source =
  | "orders"
  | "cetka_orders"
  | "komarnik_orders"
  | "usmjerivac_orders"
  | "lezaljka_orders"
  | "masina_orders";

export type ProductDef = {
  key: string;
  label: string;
  source: Source;
  /** order_number prefixes — only used when source === "orders" */
  prefixes?: string[];
};

// Order matters: this drives the dropdown order.
export const PRODUCTS: ProductDef[] = [
  { key: "patike-s3",     label: "Radne Patike S3",        source: "orders", prefixes: ["CRT"] },
  { key: "richeng",       label: "Richeng S3 Patike",      source: "orders", prefixes: ["RCH", "PAT"] },
  { key: "hammer",        label: "Hammer S3 Patike",       source: "orders", prefixes: ["HMR"] },
  { key: "aeox",          label: "Aeox Plus S3 Patike",    source: "orders", prefixes: ["AEX"] },
  { key: "milwaukee",     label: "Milwaukee M18 Bušilica", source: "orders", prefixes: ["MLW"] },
  { key: "milwaukee-set", label: "Milwaukee Set 3.1",      source: "orders", prefixes: ["MS3"] },
  { key: "dewalt",        label: "DeWalt Set",             source: "orders", prefixes: ["DWL", "DWT"] },
  { key: "set2u1",        label: "Set 2u1",                source: "orders", prefixes: ["S2U"] },
  { key: "brusilica",     label: "Akum. Brusilica",        source: "orders", prefixes: ["BRS"] },
  { key: "zirafa",        label: "Žirafa Brusilica",       source: "orders", prefixes: ["ZRF"] },
  { key: "zvucnik",       label: "Bluetooth Zvučnik",      source: "orders", prefixes: ["ZQS"] },
  { key: "kamera",        label: "WiFi PTZ Kamera",        source: "orders", prefixes: ["KMR"] },
  { key: "airpods",       label: "AirPods Pro",            source: "orders", prefixes: ["APP"] },
  { key: "motorna-pila",  label: "Motorna pila",           source: "orders", prefixes: ["MTP"] },
  { key: "prsluk",        label: "Prsluk za spašavanje",   source: "orders", prefixes: ["PRS"] },
  { key: "cetka",         label: "Čelična Četka",          source: "cetka_orders" },
  { key: "komarnik",      label: "Komarnik za vrata",      source: "komarnik_orders" },
  { key: "usmjerivac",    label: "Usmjerivač zraka",       source: "usmjerivac_orders" },
  { key: "lezaljka",      label: "Ležaljka",               source: "lezaljka_orders" },
  { key: "masina",        label: "Mašina za šišanje",      source: "masina_orders" },
];

export function findProduct(key: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.key === key);
}
