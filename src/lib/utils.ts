export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z\s-]/g, "")
    .split(/[\s-]+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function rot(id: string, maxDeg = 6): number {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < id.length; i++) {
    h1 = Math.imul(h1 ^ id.charCodeAt(i), 2654435761);
    h2 = Math.imul(h2 ^ id.charCodeAt(i), 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const normalized = Math.abs(h1 + h2) % (maxDeg * 20);
  return (normalized / 10) - maxDeg;
}
