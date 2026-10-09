export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const data = await response.json().catch(() => ({ error: 'The server returned an unexpected response. Please try again.' }));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
export const peso = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
export const shortPeso = (amount: number) => amount >= 1000000 ? `₱${(amount / 1000000).toFixed(2)}M` : peso(amount);
export const sampleInput = { name: 'My dream home', type: 'new-house' as const, province: 'Metro Manila', city: 'Quezon City', floors: [80], finish: 'standard' as const, budget: null, contingency: 10, allowance: 0 };
export const provinces = ['Metro Manila', 'Pangasinan', 'Bulacan', 'Cavite', 'Laguna', 'Batangas', 'Rizal', 'Pampanga', 'Cebu', 'Davao del Sur', 'Other province'];
