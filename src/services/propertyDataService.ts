
/**
 * Service for fetching property data from external websites
 * Note: In a production environment, this would need to be implemented as a backend service
 * using server-side scraping techniques to avoid CORS issues
 */

// Types for property data
export interface ExternalProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number; // in square feet/meters
  imageUrl?: string;
  propertyType?: string;
  source: 'lamudi' | 'ugandaPropertyCentre';
  externalUrl: string;
}

// Mock data to simulate fetching from external websites
const mockLamudiData: ExternalProperty[] = [
  {
    id: 'lam-001',
    title: 'Modern Apartment in Kampala Central',
    price: 350000000,
    location: 'Kampala Central, Uganda',
    bedrooms: 3,
    bathrooms: 2,
    size: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2426&h=1728&q=80',
    propertyType: 'Apartment',
    source: 'lamudi',
    externalUrl: 'https://lamudi.co.ug/Lamudi/Index.aspx',
  },
  {
    id: 'lam-002',
    title: 'Luxury Villa in Munyonyo',
    price: 950000000,
    location: 'Munyonyo, Kampala, Uganda',
    bedrooms: 5,
    bathrooms: 4,
    size: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3847&h=5583&q=80',
    propertyType: 'Villa',
    source: 'lamudi',
    externalUrl: 'https://lamudi.co.ug/Lamudi/Index.aspx',
  },
  {
    id: 'lam-003',
    title: 'Commercial Space in Nakasero',
    price: 450000000,
    location: 'Nakasero, Kampala, Uganda',
    size: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&h=4000&q=80',
    propertyType: 'Commercial',
    source: 'lamudi',
    externalUrl: 'https://lamudi.co.ug/Lamudi/Index.aspx',
  },
];

const mockUPCData: ExternalProperty[] = [
  {
    id: 'upc-001',
    title: 'Newly Built House in Ntinda',
    price: 380000000,
    location: 'Ntinda, Kampala, Uganda',
    bedrooms: 4,
    bathrooms: 3,
    size: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    propertyType: 'House',
    source: 'ugandaPropertyCentre',
    externalUrl: 'https://ugandapropertycentre.com/',
  },
  {
    id: 'upc-002',
    title: 'Apartment in Bukoto',
    price: 250000000,
    location: 'Bukoto, Kampala, Uganda',
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    propertyType: 'Apartment',
    source: 'ugandaPropertyCentre',
    externalUrl: 'https://ugandapropertycentre.com/',
  },
  {
    id: 'upc-003',
    title: 'Land in Entebbe',
    price: 150000000,
    location: 'Entebbe, Uganda',
    size: 10000,
    propertyType: 'Land',
    source: 'ugandaPropertyCentre',
    externalUrl: 'https://ugandapropertycentre.com/',
  },
];

export const propertyDataService = {
  /**
   * Fetch property data from Lamudi
   * In a real implementation, this would use a server-side API or web scraping
   */
  fetchLamudiData: async (searchParams?: Record<string, any>): Promise<ExternalProperty[]> => {
    console.log('Fetching Lamudi data with params:', searchParams);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter mock data based on search params
    if (!searchParams) return mockLamudiData;
    
    return mockLamudiData.filter(property => {
      if (searchParams.minPrice && property.price < searchParams.minPrice) return false;
      if (searchParams.maxPrice && property.price > searchParams.maxPrice) return false;
      if (searchParams.bedrooms && property.bedrooms < searchParams.bedrooms) return false;
      if (searchParams.location && !property.location.toLowerCase().includes(searchParams.location.toLowerCase())) return false;
      if (searchParams.propertyType && property.propertyType !== searchParams.propertyType) return false;
      return true;
    });
  },
  
  /**
   * Fetch property data from Uganda Property Centre
   * In a real implementation, this would use a server-side API or web scraping
   */
  fetchUPCData: async (searchParams?: Record<string, any>): Promise<ExternalProperty[]> => {
    console.log('Fetching Uganda Property Centre data with params:', searchParams);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock data based on search params
    if (!searchParams) return mockUPCData;
    
    return mockUPCData.filter(property => {
      if (searchParams.minPrice && property.price < searchParams.minPrice) return false;
      if (searchParams.maxPrice && property.price > searchParams.maxPrice) return false;
      if (searchParams.bedrooms && property.bedrooms < searchParams.bedrooms) return false;
      if (searchParams.location && !property.location.toLowerCase().includes(searchParams.location.toLowerCase())) return false;
      if (searchParams.propertyType && property.propertyType !== searchParams.propertyType) return false;
      return true;
    });
  },
  
  /**
   * Fetch property data from all sources
   */
  fetchAllPropertyData: async (searchParams?: Record<string, any>): Promise<ExternalProperty[]> => {
    // Fetch from multiple sources in parallel
    const [lamudiData, upcData] = await Promise.all([
      propertyDataService.fetchLamudiData(searchParams),
      propertyDataService.fetchUPCData(searchParams)
    ]);
    
    // Combine results
    return [...lamudiData, ...upcData];
  },
};
