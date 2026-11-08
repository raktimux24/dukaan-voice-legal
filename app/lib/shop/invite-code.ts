/** Invite links are navigation, never an instruction to join automatically. */
export function parseInviteCode(input: string): string | null {
  const raw = input.trim();
  if (/^[a-z0-9]{6}$/i.test(raw)) return raw.toUpperCase();
  try {
    const url = new URL(raw);
    const route = (url.hostname ? "/" + url.hostname : "") + url.pathname;
    const owned = url.protocol === "samaan-bol:" ? ["/join", "/join/"].includes(route) :
      url.protocol === "https:" && ["samaanbol.space", "www.samaanbol.space"].includes(url.hostname) && ["/join", "/join/"].includes(url.pathname);
    const codes = url.searchParams.getAll("code");
    return owned && codes.length === 1 && /^[a-z0-9]{6}$/i.test(codes[0]) ? codes[0].toUpperCase() : null;
  } catch { return null; }
}
export function updateInviteDigits(current: string[], text: string, index: number): string[] {
  const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length === 6) return clean.split("");
  const next = [...current];
  if (!clean) next[index] = "";
  else clean.slice(0, 6 - index).split("").forEach((char, offset) => { next[index + offset] = char; });
  return next;
}
