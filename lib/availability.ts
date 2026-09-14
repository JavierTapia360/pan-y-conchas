export type AvailabilityStatus = 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN';
export function statusToAvailability(status: AvailabilityStatus): boolean | null {
  if (status === 'AVAILABLE') return true;
  if (status === 'SOLD_OUT') return false;
  return null;
}
