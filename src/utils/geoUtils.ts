
export interface Coordinates {
  lat: number;
  lng: number;
}

export function distanceFromCoordinates(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function getDistanceToKampala(lat: number, lng: number): number {
  return distanceFromCoordinates(lat, lng, 0.3476, 32.5825);
}

// Uganda district coordinates
export const UGANDA_DISTRICTS = {
  kampala: { lat: 0.3476, lng: 32.5825, name: 'Kampala' },
  wakiso: { lat: 0.4045, lng: 32.4596, name: 'Wakiso' },
  mukono: { lat: 0.3533, lng: 32.7561, name: 'Mukono' },
  jinja: { lat: 0.4244, lng: 33.2042, name: 'Jinja' },
  entebbe: { lat: 0.0564, lng: 32.4633, name: 'Entebbe' },
  mbarara: { lat: -0.6109, lng: 30.6479, name: 'Mbarara' },
  gulu: { lat: 2.7796, lng: 32.2993, name: 'Gulu' },
  mbale: { lat: 1.0827, lng: 34.1755, name: 'Mbale' },
  masaka: { lat: -0.3376, lng: 31.7349, name: 'Masaka' },
  kasese: { lat: 0.1833, lng: 30.0833, name: 'Kasese' },
};
