/**
 * Shared display option arrays for car-related selects and dropdowns.
 * Single source of truth — import from here, never re-define locally.
 */

export const FUEL_TYPE_OPTIONS = [
  { value: 'nafta', label: 'Nafta' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'gnc', label: 'GNC' },
];

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
  { value: 'cvt', label: 'CVT' },
];

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
];

export const STEERING_OPTIONS = [
  { value: 'mechanical', label: 'Mecánica' },
  { value: 'hydraulic', label: 'Hidráulica' },
  { value: 'electric', label: 'Eléctrica' },
];

export const HEADLIGHTS_OPTIONS = [
  { value: 'halogen', label: 'Halógeno' },
  { value: 'led', label: 'LED' },
  { value: 'xenon', label: 'Xenón' },
  { value: 'full-led', label: 'Full LED' },
];

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export const ADMIN_STATUS_OPTIONS: { value: 'available' | 'sold' | 'reserved' | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
];
