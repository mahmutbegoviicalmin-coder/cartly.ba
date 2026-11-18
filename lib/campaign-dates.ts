/**
 * Black November end: 1 December 2026, 00:00 Sarajevo time (CET = UTC+1).
 * Plain constants (no React), so server code (SEO, sitemap) can import them.
 */
export const BLACK_NOVEMBER_END = Date.parse("2026-12-01T00:00:00+01:00");

export const isBlackNovember = (now = Date.now()) => now < BLACK_NOVEMBER_END;
