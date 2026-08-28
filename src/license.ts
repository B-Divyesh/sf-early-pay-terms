const SLUG = 'early-pay-terms';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

function apiBase(): string {
  return ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'https://pilot-api.sociobot.in/api/v1'
    : 'https://api.sociobot.in/api/v1';
}

export function checkoutUrl(): string { return `${apiBase()}/products/${SLUG}/checkout`; }
export function storedToken(): string { return localStorage.getItem(LICENSE_KEY) || ''; }
function storedVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null; } catch { return null; }
}
export function isOptimisticallyUnlocked(): boolean {
  return Boolean(storedToken() && storedVerdict()?.valid);
}

export function captureReturnedLicense(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export async function verifyLicense(token = storedToken(), force = false): Promise<Verdict> {
  if (!token) return { valid: false, checkedAt: Date.now(), reason: 'missing' };
  const cached = storedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`${apiBase()}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const data = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: Boolean(data.valid), reason: data.reason, checkedAt: Date.now() };
    localStorage.setItem(LICENSE_KEY, token);
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    if (cached?.valid) return cached;
    throw new Error('Could not reach the license service. Check your connection and try again.');
  }
}
