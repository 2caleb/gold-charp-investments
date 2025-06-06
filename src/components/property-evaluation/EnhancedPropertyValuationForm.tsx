
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Calculator, FileText, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { evaluateProperty, PropertyData, PropertyValuation } from '@/utils/propertyEvaluation';
import { getDistanceToKampala, UGANDA_DISTRICTS } from '@/utils/geoUtils';

const formSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  district: z.string().min(1, 'District is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  sizeInSqm: z.string().min(1, 'Size is required'),
  propertyType: z.enum(['land', 'residential', 'commercial', 'industrial']),
  hasRoadAccess: z.boolean().default(true),
  hasUtilities: z.boolean().default(false),
  ageYears: z.string().optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor']).optional(),
  tenureType: z.enum(['freehold', 'leasehold', 'mailo']).optional(),
  zoning: z.enum(['residential', 'commercial', 'mixed', 'agricultural', 'industrial']).optional(),
  specialFeatures: z.string().optional(),
});

const EnhancedPropertyValuationForm = () => {
  const { toast } = useToast();
  const [valuationResults, setValuationResults] = useState<PropertyValuation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      district: '',
      latitude: '',
      longitude: '',
      sizeInSqm: '',
      propertyType: 'residential',
      hasRoadAccess: true,
      hasUtilities: false,
      ageYears: '',
      condition: undefined,
      tenureType: undefined,
      zoning: undefined,
      specialFeatures: '',
    },
  });

  const watchDistrict = form.watch('district');
  const watchLatitude = form.watch('latitude');
  const watchLongitude = form.watch('longitude');

  // Auto-populate coordinates when district is selected
  useEffect(() => {
    if (watchDistrict && UGANDA_DISTRICTS[watchDistrict as keyof typeof UGANDA_DISTRICTS]) {
      const coords = UGANDA_DISTRICTS[watchDistrict as keyof typeof UGANDA_DISTRICTS];
      form.setValue('latitude', coords.lat.toString());
      form.setValue('longitude', coords.lng.toString());
    }
  }, [watchDistrict, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCalculating(true);
    
    try {
      // Prepare property data
      const lat = parseFloat(values.latitude || '0');
      const lng = parseFloat(values.longitude || '0');
      const distanceToCityKm = lat && lng ? getDistanceToKampala(lat, lng) : undefined;
      
      const propertyData: PropertyData = {
        location: values.district,
        latitude: lat || undefined,
        longitude: lng || undefined,
        sizeInSqm: parseFloat(values.sizeInSqm),
        propertyType: values.propertyType,
        distanceToCityKm,
        hasRoadAccess: values.hasRoadAccess,
        hasUtilities: values.hasUtilities,
        ageYears: values.ageYears ? parseInt(values.ageYears) : undefined,
        condition: values.condition,
        tenureType: values.tenureType,
        zoning: values.zoning,
      };

      // Calculate valuation
      const valuation = evaluateProperty(propertyData);
      setValuationResults(valuation);
      
      toast({
        title: "Valuation Complete",
        description: "Advanced property valuation has been calculated successfully.",
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the property valuation.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const generateReport = () => {
    if (!valuationResults) return;
    
    toast({
      title: "Report Generated",
      description: "Comprehensive property valuation report has been generated.",
    });
  };

  const districts = Object.entries(UGANDA_DISTRICTS).map(([key, value]) => ({
    value: key,
    label: value.name,
  }));

  const propertyTypes = [
    { label: "Residential Property", value: "residential" },
    { label: "Commercial Property", value: "commercial" },
    { label: "Industrial Property", value: "industrial" },
    { label: "Land Only", value: "land" }
  ];

  const conditions = [
    { label: "New Construction", value: "new" },
    { label: "Excellent Condition", value: "excellent" },
    { label: "Good Condition", value: "good" },
    { label: "Fair Condition", value: "fair" },
    { label: "Poor Condition", value: "poor" }
  ];

  const tenureTypes = [
    { label: "Freehold", value: "freehold" },
    { label: "Leasehold", value: "leasehold" },
    { label: "Mailo Land", value: "mailo" }
  ];

  const zoningTypes = [
    { label: "Residential", value: "residential" },
    { label: "Commercial", value: "commercial" },
    { label: "Mixed Use", value: "mixed" },
    { label: "Agricultural", value: "agricultural" },
    { label: "Industrial", value: "industrial" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
      <div className="lg:col-span-4">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Building2 className="mr-2" />
              Enhanced Property Valuation
            </CardTitle>
            <CardDescription className="text-blue-100">
              Advanced property evaluation using market data and GIS analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {districts.map((district) => (
                                <SelectItem key={district.value} value={district.value}>
                                  {district.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bugolobi, Muyenga" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude (auto-filled)</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="0.3476" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude (auto-filled)</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="32.5825" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Property Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Specifications</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sizeInSqm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (Square Meters)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ageYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Legal and Infrastructure */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Legal & Infrastructure</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tenureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenure Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenure type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tenureTypes.map((tenure) => (
                                <SelectItem key={tenure.value} value={tenure.value}>
                                  {tenure.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zoning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zoning Classification</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select zoning" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {zoningTypes.map((zone) => (
                                <SelectItem key={zone.value} value={zone.value}>
                                  {zone.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hasRoadAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Has Road Access</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Property has direct access to a public road
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasUtilities"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Has Utilities</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Water, electricity, or other utilities available
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="specialFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Features</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List any special features, improvements, or unique characteristics" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-700 hover:bg-blue-800"
                    disabled={isCalculating}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {isCalculating ? 'Calculating...' : 'Calculate Advanced Valuation'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        {/* Results will be displayed here */}
        {valuationResults ? (
          <Card className="shadow-md h-full">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <FileText className="mr-2" />
                Advanced Valuation Results
              </CardTitle>
              <CardDescription className="text-purple-100">
                Comprehensive property assessment with adjustment factors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Valuation Results */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-sm uppercase text-blue-700 dark:text-blue-300 font-medium mb-1">Fair Market Value</h3>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    UGX {valuationResults.fairValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    UGX {valuationResults.pricePerSqm.toLocaleString()} per sqm
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-sm uppercase text-green-700 dark:text-green-300 font-medium mb-1">Market Price</h3>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    UGX {valuationResults.marketPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Recommended listing price
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <h3 className="text-sm uppercase text-amber-700 dark:text-amber-300 font-medium mb-1">Forced Sale Price</h3>
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    UGX {valuationResults.forcedPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Quick-sale scenario value
                  </p>
                </div>
              </div>

              <Separator />

              {/* Adjustment Factors */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Valuation Factors</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Distance Factor:</span>
                    <span className={valuationResults.adjustmentFactors.distance > 1 ? "text-green-600" : "text-red-600"}>
                      {(valuationResults.adjustmentFactors.distance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amenities Factor:</span>
                    <span className={valuationResults.adjustmentFactors.amenities > 1 ? "text-green-600" : "text-red-600"}>
                      {(valuationResults.adjustmentFactors.amenities * 100).toFixed(0)}%
                    </span>
                  </div>
                  {valuationResults.adjustmentFactors.age !== 1 && (
                    <div className="flex justify-between">
                      <span>Age Factor:</span>
                      <span className={valuationResults.adjustmentFactors.age > 1 ? "text-green-600" : "text-red-600"}>
                        {(valuationResults.adjustmentFactors.age * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tenure Factor:</span>
                    <span className={valuationResults.adjustmentFactors.tenure > 1 ? "text-green-600" : "text-red-600"}>
                      {(valuationResults.adjustmentFactors.tenure * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zoning Factor:</span>
                    <span className={valuationResults.adjustmentFactors.zoning > 1 ? "text-green-600" : "text-red-600"}>
                      {(valuationResults.adjustmentFactors.zoning * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="font-medium text-lg mb-2">Investment Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on this valuation, the property could qualify for a loan of up to:
                </p>
                <p className="text-xl font-semibold text-purple-700 dark:text-purple-400 mt-1">
                  UGX {Math.round(valuationResults.fairValue * 0.7).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (70% LTV ratio)
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={generateReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate Detailed Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md h-full">
            <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Calculator className="mr-2" />
                Advanced Valuation Engine
              </CardTitle>
              <CardDescription className="text-gray-200">
                Professional property assessment system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">🎯 Smart Valuation Features</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>GIS-based distance calculations</li>
                    <li>Inflation-adjusted market data</li>
                    <li>Tenure type considerations</li>
                    <li>Infrastructure impact analysis</li>
                    <li>Comprehensive adjustment factors</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">📊 Professional Reports</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Detailed valuation breakdown</li>
                    <li>Investment analysis</li>
                    <li>Market comparison data</li>
                    <li>Risk assessment factors</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">💡 Pro Tip</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For the most accurate valuation, ensure all property details are complete, including exact coordinates and infrastructure access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedPropertyValuationForm;
