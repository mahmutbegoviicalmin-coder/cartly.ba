const IP_MARK_RE = /\n?⟦ip:([0-9a-fA-F.:]+)⟧\s*$/;

export function stampIp(adresa: string, ip: string): string {
  const clean = stripIp(adresa);
  const value = String(ip ?? "").trim();
  if (!value) return clean;
  return `${clean}\n⟦ip:${value}⟧`;
}

export function stripIp(adresa: unknown): string {
  return String(adresa ?? "").replace(IP_MARK_RE, "").trim();
}

export function readIp(adresa?: string | null, ipColumn?: string | null): string {
  const fromColumn = String(ipColumn ?? "").trim();
  if (fromColumn) return fromColumn;
  const match = String(adresa ?? "").match(IP_MARK_RE);
  return match?.[1] ?? "";
}
