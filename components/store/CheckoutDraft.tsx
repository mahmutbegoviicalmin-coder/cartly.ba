"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isValidBaPhone } from "@/lib/ba-phone";
import type { DraftFields } from "@/lib/checkout-drafts";

/**
 * Remembers unfinished orders on every product page: watches all order forms
 * (page forms and the quick-order pop-up) and, once the phone number is valid,
 * sends what was typed to /api/checkout-draft. Mounted once in app/layout.tsx.
 * Fields are found by name or autocomplete, so no form needs changes.
 */

const SKIP = ["/admin", "/dobavljac", "/api"];

function fieldOf(el: HTMLInputElement | HTMLTextAreaElement): keyof DraftFields | null {
  const n = `${el.name} ${el.getAttribute("autocomplete") ?? ""} ${el.placeholder}`.toLowerCase();
  if (el.type === "hidden" || el.type === "checkbox" || el.type === "radio" || el.name === "website") return null;
  if (el.type === "tel" || /telefon|phone|\btel\b/.test(n)) return "telefon";
  if (/family-name|prezime/.test(n)) return "prezime";
  if (/postal|postanski|zip/.test(n)) return "postanski";
  if (/address-level2|grad|city/.test(n)) return "grad";
  if (/street|adres|ulica/.test(n)) return "adresa";
  if (/napomena|note/.test(n)) return "napomena";
  if (/given-name|\bname\b|\bime\b/.test(n)) return "ime";
  return null;
}

function read(form: HTMLFormElement): DraftFields {
  const out: DraftFields = {};
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((el) => {
    const k = fieldOf(el);
    if (k && el.value.trim() && !out[k]) out[k] = el.value.trim();
  });
  return out;
}

const ids = new WeakMap<HTMLFormElement, string>();
const sent = new WeakMap<HTMLFormElement, string>();
const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function productName() {
  const dlg = document.querySelector("form[data-quick-order]")?.closest("[role=dialog], .fixed")?.querySelector("p, h2, h3");
  return (document.title.split("|")[0].split("·")[0].trim() || dlg?.textContent || "").slice(0, 120);
}

function save(form: HTMLFormElement, beacon = false) {
  const f = read(form);
  if (!f.telefon || !isValidBaPhone(f.telefon)) return;
  const snapshot = JSON.stringify(f);
  if (sent.get(form) === snapshot) return;
  sent.set(form, snapshot);
  if (!ids.has(form)) ids.set(form, newId());
  const body = JSON.stringify({ ...f, id: ids.get(form), page: location.pathname, product: productName() });
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/checkout-draft", new Blob([body], { type: "text/plain" }));
  } else {
    fetch("/api/checkout-draft", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

export function CheckoutDraft() {
  const path = usePathname() || "/";

  useEffect(() => {
    if (path === "/" || SKIP.some((p) => path.startsWith(p))) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const formOf = (t: EventTarget | null) => (t instanceof Element ? t.closest("form") : null);

    // Save when leaving a field, and 2 s after typing stops.
    const onOut = (e: FocusEvent) => { const f = formOf(e.target); if (f) save(f); };
    const onInput = (e: Event) => {
      const f = formOf(e.target);
      if (!f) return;
      clearTimeout(timer);
      timer = setTimeout(() => save(f), 2000);
    };
    // Leaving the page / switching apps: last chance.
    const flush = () => document.querySelectorAll("form").forEach((f) => save(f, true));
    const onVis = () => { if (document.visibilityState === "hidden") flush(); };

    document.addEventListener("focusout", onOut);
    document.addEventListener("input", onInput);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("focusout", onOut);
      document.removeEventListener("input", onInput);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
    };
  }, [path]);

  return null;
}
