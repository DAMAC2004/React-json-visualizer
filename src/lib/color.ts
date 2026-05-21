export function hexToHsl(hex: string): string | null {
  if (!hex) return null;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;

  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0;
  let hue = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue *= 60;
  }

  return `${Math.round(hue)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyOrgBranding(primaryHex?: string | null, secondaryHex?: string | null) {
  const root = document.documentElement.style;
  const p = primaryHex ? hexToHsl(primaryHex) : null;
  const s = secondaryHex ? hexToHsl(secondaryHex) : null;
  if (p) {
    root.setProperty('--primary', p);
    root.setProperty('--org-primary', p);
    root.setProperty('--ring', p);
    root.setProperty('--sidebar-primary', p);
  }
  if (s) {
    root.setProperty('--org-secondary', s);
  }
}

export function resetOrgBranding() {
  const root = document.documentElement.style;
  ['--primary', '--org-primary', '--ring', '--sidebar-primary', '--org-secondary']
    .forEach((v) => root.removeProperty(v));
}
