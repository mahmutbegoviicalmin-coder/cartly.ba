/** BH phone + junk-data checks used by checkout (client + server). */

export const PHONE_ERROR = "Unesite ispravan BH broj (035, 061–067 …).";

/** 035 Tuzla + fiksni 03x/05x, mobiteli 060–067. */
const ALLOWED_PREFIXES = new Set([
  "060", "061", "062", "063", "064", "065", "066", "067",
  "030", "031", "032", "033", "034", "035", "036", "037", "038", "039",
  "049", "051", "052", "053", "054", "055", "056", "057", "058", "059",
]);

const JUNK_EXACT = new Set([
  "test", "asdf", "asdfg", "qwerty", "qwer", "admin", "user", "abc", "abcd",
  "aaa", "aaaa", "xxx", "xyz", "foo", "bar", "nesto", "nešto", "nessto",
  "ime", "prezime", "adresa", "ulica", "grad", "telefon", "null", "undefined",
  "asdasd", "qweqwe", "zxcv", "ljkh", "fdsa", "random", "fake", "dummy",
  "ime prezime", "test test", "aa aa", "xx xx",
]);

export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

/** National format with leading 0, e.g. 061555333 or 035123456. */
export function normalizeBaPhone(raw: string): string | null {
  let d = digitsOnly(raw);
  if (d.startsWith("00387")) d = d.slice(2);
  if (d.startsWith("387")) d = "0" + d.slice(3);
  if (!d.startsWith("0") && d.length >= 8 && d.length <= 10) d = "0" + d;

  const prefix = d.slice(0, 3);
  if (!ALLOWED_PREFIXES.has(prefix)) return null;

  const subscriber = d.slice(3);
  if (subscriber.length < 5 || subscriber.length > 7) return null;
  if (/^(\d)\1+$/.test(subscriber)) return null;

  return d;
}

export function isValidBaPhone(raw: string): boolean {
  return normalizeBaPhone(raw) !== null;
}

function lettersOf(value: string): string {
  return value.toLowerCase().replace(/[^a-zčćžšđàáäéèëíóöúü]/gi, "");
}

export function looksLikeRealName(raw: string): boolean {
  const name = String(raw || "").replace(/\s+/g, " ").trim();
  if (name.length < 3 || name.length > 80) return false;
  if (!/[a-zA-ZčćžšđČĆŽŠĐ]/.test(name)) return false;
  const compact = name.toLowerCase().replace(/\s+/g, " ");
  if (JUNK_EXACT.has(compact) || JUNK_EXACT.has(compact.replace(/\s/g, ""))) return false;
  const letters = lettersOf(name);
  if (letters.length < 3 || new Set(letters).size < 2) return false;
  return true;
}

export function looksLikeRealPlace(raw: string, minLen = 3): boolean {
  const value = String(raw || "").replace(/\s+/g, " ").trim();
  if (value.length < minLen || value.length > 120) return false;
  if (!/[a-zA-ZčćžšđČĆŽŠĐ]/.test(value)) return false;
  const compact = value.toLowerCase();
  if (JUNK_EXACT.has(compact) || JUNK_EXACT.has(compact.replace(/\s/g, ""))) return false;
  const letters = lettersOf(value);
  if (letters.length < 2 || new Set(letters).size < 2) return false;
  return true;
}

export function looksLikeRealAddress(raw: string): boolean {
  const value = String(raw || "").replace(/\s+/g, " ").trim();
  if (/^bb$/i.test(value) || /\sbb$/i.test(value)) return value.length >= 2;
  return looksLikeRealPlace(raw, 5);
}
