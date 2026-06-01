export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function computeDiscount(subtotal: number): number {
  return subtotal > 500 ? round2(subtotal * 0.1) : 0;
}

export function shippingFor(postalCode: string): {
  zone: number;
  cost: number;
} | null {
  if (!/^\d{4}$/.test(postalCode)) return null;
  const n = Number(postalCode);
  if (n >= 4000 && n <= 4099) return { zone: 1, cost: 0 };
  if (n >= 4100 && n <= 4999) return { zone: 2, cost: 49 };
  return { zone: 3, cost: 99 };
}

export function formatNok(amount: number): string {
  return `${amount.toFixed(2)} NOK`;
}

export function isValidNorwegianMobile(phone: string): boolean {
  return /^[49]\d{7}$/.test(phone);
}
