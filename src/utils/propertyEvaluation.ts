
import { distanceFromCoordinates } from './geoUtils';

// Constants based on your Python implementation
export const INFLATION_RATE = 0.065; // 6.5% annual inflation in Uganda
export const CURRENT_YEAR = new Date().getFullYear();
export const KAMPALA_COORDS = { lat: 0.3476, lng: 32.5825 };

// Base prices per square meter as of 2022 (in UGX) - expanded from your Python code
export const BASE_PRICES_2022 = {
  kampala: { land: 1800000, residential: 2400000, commercial: 3500000, industrial: 2800000 },
  wakiso: { land: 1000000, residential: 1500000, commercial: 2000000, industrial: 1800000 },
  mukono: { land: 800000, residential: 1200000, commercial: 1700000, industrial: 1500000 },
  jinja: { land: 600000, residential: 1000000, commercial: 1400000, industrial: 1200000 },
  entebbe: { land: 900000, residential: 1300000, commercial: 1800000, industrial: 1600000 },
  mbarara: { land: 750000, residential: 1200000, commercial: 1600000, industrial: 1400000 },
  gulu: { land: 500000, residential: 900000, commercial: 1300000, industrial: 1100000 },
  masaka: { land: 650000, residential: 1000000, commercial: 1400000, industrial: 1200000 },
  fort_portal: { land: 550000, residential: 950000, commercial: 1300000, industrial: 1100000 },
  kabale: { land: 600000, residential: 1000000, commercial: 1350000, industrial: 1150000 },
  soroti: { land: 450000, residential: 800000, commercial: 1200000, industrial: 1000000 },
  lira: { land: 400000, residential: 750000, commercial: 1100000, industrial: 950000 },
  mbale: { land: 500000, residential: 850000, commercial: 1250000, industrial: 1050000 },
  arua: { land: 350000, residential: 700000, commercial: 1000000, industrial: 900000 },
  kasese: { land: 480000, residential: 820000, commercial: 1180000, industrial: 1000000 },
};

export interface PropertyData {
  location: string;
  latitude?: number;
  longitude?: number;
  sizeInSqm: number;
  propertyType: 'land' | 'residential' | 'commercial' | 'industrial';
  distanceToCityKm?: number;
  hasRoadAccess: boolean;
  hasUtilities: boolean;
  ageYears?: number;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  tenureType?: 'freehold' | 'leasehold' | 'mailo';
  zoning?: 'residential' | 'commercial' | 'mixed' | 'agricultural' | 'industrial';
  yearOfValuation?: number;
}

export interface PropertyValuation {
  fairValue: number;
  marketPrice: number;
  forcedPrice: number;
  pricePerSqm: number;
  adjustmentFactors: {
    location: number;
    distance: number;
    amenities: number;
    age: number;
    condition: number;
    tenure: number;
    zoning: number;
  };
  reportData: {
    basePrice: number;
    totalAdjustmentFactor: number;
    inflationAdjustment: number;
  };
}

/**
 * Calculate inflated price based on year of valuation
 */
export function getInflatedPrice(price: number, yearOfValuation: number): number {
  const yearsAgo = CURRENT_YEAR - yearOfValuation;
  return price * Math.pow(1 + INFLATION_RATE, yearsAgo);
}

/**
 * Get base price per square meter for location and property type
 */
export function getBasePricePerSqm(location: string, propertyType: string): number {
  const locationKey = location.toLowerCase() as keyof typeof BASE_PRICES_2022;
  const locationPrices = BASE_PRICES_2022[locationKey] || BASE_PRICES_2022.gulu;
  const basePrice = locationPrices[propertyType as keyof typeof locationPrices] || locationPrices.land;
  return getInflatedPrice(basePrice, 2022);
}

/**
 * Calculate distance adjustment factor based on distance to city center
 */
export function calculateDistanceAdjustment(distanceKm: number): number {
  if (distanceKm <= 5) return 1.25;
  if (distanceKm <= 15) return 1.1;
  if (distanceKm > 30) return 0.75;
  return 1.0;
}

/**
 * Calculate amenities adjustment factor
 */
export function calculateAmenitiesAdjustment(hasRoadAccess: boolean, hasUtilities: boolean): number {
  let factor = 1.0;
  if (!hasRoadAccess) factor *= 0.8;
  if (!hasUtilities) factor *= 0.85;
  return factor;
}

/**
 * Calculate age adjustment factor for structures
 */
export function calculateAgeAdjustment(ageYears?: number): number {
  if (!ageYears) return 1.0;
  
  if (ageYears > 30) return 0.5;
  if (ageYears > 20) return 0.65;
  if (ageYears > 10) return 0.8;
  if (ageYears <= 5) return 1.1;
  return 1.0;
}

/**
 * Calculate condition adjustment factor
 */
export function calculateConditionAdjustment(condition?: string): number {
  switch (condition) {
    case 'new': return 1.15;
    case 'excellent': return 1.1;
    case 'good': return 1.05;
    case 'fair': return 0.9;
    case 'poor': return 0.6;
    default: return 1.0;
  }
}

/**
 * Calculate tenure type adjustment factor
 */
export function calculateTenureAdjustment(tenureType?: string): number {
  switch (tenureType) {
    case 'leasehold': return 0.85;
    case 'mailo': return 0.9;
    case 'freehold': return 1.0;
    default: return 1.0;
  }
}

/**
 * Calculate zoning adjustment factor
 */
export function calculateZoningAdjustment(zoning?: string): number {
  switch (zoning) {
    case 'commercial': return 1.2;
    case 'industrial': return 1.1;
    case 'mixed': return 1.05;
    case 'agricultural': return 0.75;
    case 'residential': return 1.0;
    default: return 1.0;
  }
}

/**
 * Main property evaluation function based on your Python algorithm
 */
export function evaluateProperty(property: PropertyData): PropertyValuation {
  const basePrice = getBasePricePerSqm(property.location, property.propertyType);
  
  // Calculate all adjustment factors
  const locationFactor = 1.0; // Already included in base price
  const distanceFactor = property.distanceToCityKm ? calculateDistanceAdjustment(property.distanceToCityKm) : 1.0;
  const amenitiesFactor = calculateAmenitiesAdjustment(property.hasRoadAccess, property.hasUtilities);
  const ageFactor = property.propertyType !== 'land' ? calculateAgeAdjustment(property.ageYears) : 1.0;
  const conditionFactor = property.propertyType !== 'land' ? calculateConditionAdjustment(property.condition) : 1.0;
  const tenureFactor = calculateTenureAdjustment(property.tenureType);
  const zoningFactor = calculateZoningAdjustment(property.zoning);
  
  // Calculate total adjustment factor
  const totalAdjustmentFactor = distanceFactor * amenitiesFactor * ageFactor * conditionFactor * tenureFactor * zoningFactor;
  
  // Calculate adjusted price per square meter
  const adjustedPricePerSqm = basePrice * totalAdjustmentFactor;
  
  // Calculate total fair value
  const fairValue = Math.round(property.sizeInSqm * adjustedPricePerSqm);
  
  // Market price is typically 10-15% higher than fair value
  const marketPrice = Math.round(fairValue * 1.12);
  
  // Forced price is typically 20-30% lower than fair value
  const forcedPrice = Math.round(fairValue * 0.75);
  
  return {
    fairValue,
    marketPrice,
    forcedPrice,
    pricePerSqm: Math.round(adjustedPricePerSqm),
    adjustmentFactors: {
      location: locationFactor,
      distance: distanceFactor,
      amenities: amenitiesFactor,
      age: ageFactor,
      condition: conditionFactor,
      tenure: tenureFactor,
      zoning: zoningFactor,
    },
    reportData: {
      basePrice,
      totalAdjustmentFactor,
      inflationAdjustment: getInflatedPrice(1, property.yearOfValuation || CURRENT_YEAR),
    },
  };
}

/**
 * Generate property valuation report data for PDF generation
 */
export function generatePropertyReportData(property: PropertyData, valuation: PropertyValuation) {
  return {
    property: {
      ...property,
      coordinates: property.latitude && property.longitude ? `${property.latitude}, ${property.longitude}` : 'Not provided',
      distanceToKampala: property.distanceToCityKm ? `${property.distanceToCityKm.toFixed(2)} km` : 'Not calculated',
    },
    valuation,
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString(),
  };
}
