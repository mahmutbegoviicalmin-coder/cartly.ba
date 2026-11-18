// Google Fonts now sometimes returns font URLs without a file extension
// (e.g. https://fonts.gstatic.com/l/font?kit=…). next@14's font loader does
// /\.(woff|woff2|…)$/.exec(url)[1] and crashes the build on null. Default to
// woff2 instead. Idempotent; never fails the install.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "node_modules", "next", "dist", "compiled", "@next", "font", "dist", "google", "loader.js");
try {
  const src = fs.readFileSync(file, "utf8");
  const bad = "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];";
  const good = "const ext = (/\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl) || [null, 'woff2'])[1];";
  if (src.includes(good)) {
    console.log("[patch-next-font] already patched");
  } else if (src.includes(bad)) {
    fs.writeFileSync(file, src.replace(bad, good));
    console.log("[patch-next-font] patched next/font google loader");
  } else {
    console.log("[patch-next-font] pattern not found, skipping");
  }
} catch (e) {
  console.log("[patch-next-font] skipped:", e.message);
}
