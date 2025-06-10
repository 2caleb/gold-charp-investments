
// Geographic utilities for Uganda property evaluation

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UgandaDistrict {
  name: string;
  lat: number;
  lng: number;
}

export const KAMPALA_COORDS: Coordinates = { lat: 0.3476, lng: 32.5825 };

// Major Uganda districts with coordinates
export const UGANDA_DISTRICTS: Record<string, UgandaDistrict> = {
  kampala: { name: "Kampala", lat: 0.3476, lng: 32.5825 },
  wakiso: { name: "Wakiso", lat: 0.4045, lng: 32.4596 },
  mukono: { name: "Mukono", lat: 0.3533, lng: 32.7574 },
  jinja: { name: "Jinja", lat: 0.4244, lng: 33.2042 },
  entebbe: { name: "Entebbe", lat: 0.0563, lng: 32.4633 },
  mbarara: { name: "Mbarara", lat: -0.6077, lng: 30.6634 },
  gulu: { name: "Gulu", lat: 2.7796, lng: 32.2990 },
  masaka: { name: "Masaka", lat: -0.3486, lng: 31.7292 },
  fort_portal: { name: "Fort Portal", lat: 0.6710, lng: 30.2756 },
  kabale: { name: "Kabale", lat: -1.2474, lng: 29.9883 },
  soroti: { name: "Soroti", lat: 1.7147, lng: 33.6114 },
  lira: { name: "Lira", lat: 2.2417, lng: 32.8983 },
  mbale: { name: "Mbale", lat: 1.0875, lng: 34.1753 },
  arua: { name: "Arua", lat: 3.0296, lng: 30.9107 },
  kasese: { name: "Kasese", lat: 0.1833, lng: 30.0833 },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function distanceFromCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dlat = toRadians(lat2 - lat1);
  const dlon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get distance from coordinates to Kampala
 */
export function getDistanceToKampala(lat: number, lng: number): number {
  return distanceFromCoordinates(lat, lng, KAMPALA_COORDS.lat, KAMPALA_COORDS.lng);
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
