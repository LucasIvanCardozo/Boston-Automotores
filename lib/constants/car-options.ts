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
]

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
  { value: 'cvt', label: 'CVT' },
]

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
]

const currentYear = new Date().getFullYear()
export const YEAR_OPTIONS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}))

export const ADMIN_STATUS_OPTIONS: { value: 'available' | 'sold' | 'reserved' | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
]

export const CURRENCY_OPTIONS = [
  { value: 'ARS', label: '$' },
  { value: 'USD', label: 'U$D' },
]

export const MODELS_OPTIONS = [
  { value: 'Agrale', label: 'Agrale' },
  { value: 'Alfa Romeo', label: 'Alfa Romeo' },
  { value: 'Audi', label: 'Audi' },
  { value: 'BAIC', label: 'BAIC' },
  { value: 'BMW', label: 'BMW' },
  { value: 'BYD', label: 'BYD' },
  { value: 'Changan', label: 'Changan' },
  { value: 'Chery', label: 'Chery' },
  { value: 'Chevrolet', label: 'Chevrolet' },
  { value: 'Citroën', label: 'Citroën' },
  { value: 'DFSK', label: 'DFSK' },
  { value: 'DS', label: 'DS' },
  { value: 'FAW', label: 'FAW' },
  { value: 'Fiat', label: 'Fiat' },
  { value: 'Ford', label: 'Ford' },
  { value: 'Foton', label: 'Foton' },
  { value: 'GAC', label: 'GAC' },
  { value: 'Geely', label: 'Geely' },
  { value: 'GWM', label: 'GWM' },
  { value: 'Haval', label: 'Haval' },
  { value: 'Honda', label: 'Honda' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Isuzu', label: 'Isuzu' },
  { value: 'Iveco', label: 'Iveco' },
  { value: 'JAC', label: 'JAC' },
  { value: 'Jaguar', label: 'Jaguar' },
  { value: 'Jeep', label: 'Jeep' },
  { value: 'Jetour', label: 'Jetour' },
  { value: 'JMC', label: 'JMC' },
  { value: 'JMEV', label: 'JMEV' },
  { value: 'Kaiyi', label: 'Kaiyi' },
  { value: 'KIA', label: 'KIA' },
  { value: 'KYC', label: 'KYC' },
  { value: 'Land-Rover', label: 'Land Rover' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Maserati', label: 'Maserati' },
  { value: 'Maxus', label: 'Maxus' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'MG', label: 'MG' },
  { value: 'MINI', label: 'MINI' },
  { value: 'Mitsubishi', label: 'Mitsubishi' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Peugeot', label: 'Peugeot' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'RAM', label: 'RAM' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Sero-Electric', label: 'Sero Electric' },
  { value: 'Shineray', label: 'Shineray' },
  { value: 'SsangYong', label: 'SsangYong' },
  { value: 'Subaru', label: 'Subaru' },
  { value: 'Suzuki', label: 'Suzuki' },
  { value: 'SWM', label: 'SWM' },
  { value: 'TANK', label: 'TANK' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Volvo', label: 'Volvo' },
]
