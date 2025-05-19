
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';
import { Building2, Home, MapPin, Grid2X2, ArrowUpRight, Calculator } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Define the form validation schema
const formSchema = z.object({
  propertyType: z.string().min(1, 'Property type is required'),
  location: z.string().min(1, 'Location is required'),
  district: z.string().min(1, 'District is required'),
  sizeInAcres: z.string().min(1, 'Size is required'),
  bedroomCount: z.string().optional(),
  bathroomCount: z.string().optional(),
  yearBuilt: z.string().optional(),
  condition: z.string().optional(),
  amenities: z.string().optional(),
  proximityToServices: z.string().optional(),
  specialFeatures: z.string().optional(),
});

const PropertyValuationForm = () => {
  const { toast } = useToast();
  const [valuationResults, setValuationResults] = useState<null | {
    fairValue: number;
    marketPrice: number;
    forcedPrice: number;
  }>(null);
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: '',
      location: '',
      district: '',
      sizeInAcres: '',
      bedroomCount: '',
      bathroomCount: '',
      yearBuilt: '',
      condition: '',
      amenities: '',
      proximityToServices: '',
      specialFeatures: '',
    },
  });

  // Function to handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, this would call an API to calculate the valuation
    // For now, we'll use a simple calculation as a placeholder
    
    // Base values for different districts (in millions of UGX)
    const districtBaseValues: Record<string, number> = {
      'kampala': 300,
      'wakiso': 200,
      'mukono': 150,
      'jinja': 120,
      'entebbe': 250,
      'other': 100,
    };
    
    // Get base value based on district
    const district = values.district.toLowerCase();
    const baseValue = districtBaseValues[district] || districtBaseValues.other;
    
    // Adjust based on property type
    let typeMultiplier = 1;
    switch (values.propertyType) {
      case 'residential':
        typeMultiplier = 1;
        break;
      case 'commercial':
        typeMultiplier = 1.5;
        break;
      case 'agricultural':
        typeMultiplier = 0.7;
        break;
      case 'industrial':
        typeMultiplier = 1.8;
        break;
      default:
        typeMultiplier = 1;
    }
    
    // Adjust based on size (simple multiplication)
    const sizeValue = parseFloat(values.sizeInAcres) || 1;
    
    // Calculate the fair value (in millions of UGX)
    const fairValue = baseValue * typeMultiplier * sizeValue;
    
    // Market price is typically higher than fair value (10-15% higher)
    const marketPrice = fairValue * 1.12;
    
    // Forced price is typically lower than fair value (20-30% lower)
    const forcedPrice = fairValue * 0.75;
    
    // Set the results
    setValuationResults({
      fairValue: Math.round(fairValue * 1000000), // Convert to UGX
      marketPrice: Math.round(marketPrice * 1000000),
      forcedPrice: Math.round(forcedPrice * 1000000),
    });
    
    toast({
      title: "Valuation Complete",
      description: "Property valuation has been calculated successfully.",
    });
  };
  
  const propertyTypes = [
    { label: "Residential", value: "residential" },
    { label: "Commercial", value: "commercial" },
    { label: "Agricultural", value: "agricultural" },
    { label: "Industrial", value: "industrial" },
    { label: "Mixed Use", value: "mixed-use" },
  ];
  
  const districts = [
    { label: "Kampala", value: "kampala" },
    { label: "Wakiso", value: "wakiso" },
    { label: "Mukono", value: "mukono" },
    { label: "Jinja", value: "jinja" },
    { label: "Entebbe", value: "entebbe" },
    { label: "Other", value: "other" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-7 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="lg:col-span-4">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Building2 className="mr-2" />
              Property Information
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter property details for accurate valuation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField
                    control={form.control}
                    name="sizeInAcres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (Acres)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 0.25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <Separator />

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="bedroomCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Number of bedrooms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathroomCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Number of bathrooms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 2015" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
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
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="unfinished">Unfinished</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="specialFeatures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Features</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List any special features (swimming pool, security system, etc.)" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end">
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Valuation
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        {valuationResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <ArrowUpRight className="mr-2" />
                  Property Valuation Results
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Estimated values based on provided information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-sm uppercase text-blue-700 dark:text-blue-300 font-medium mb-1">Fair Value</h3>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                      UGX {valuationResults.fairValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Estimated based on current market conditions
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-sm uppercase text-green-700 dark:text-green-300 font-medium mb-1">Market Price</h3>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                      UGX {valuationResults.marketPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Recommended listing price in current market
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <h3 className="text-sm uppercase text-amber-700 dark:text-amber-300 font-medium mb-1">Forced Price</h3>
                    <p className="text-3xl font-bold text-amber-800 dark:text-amber-200">
                      UGX {valuationResults.forcedPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Minimum value for quick liquidation
                    </p>
                  </div>
                </div>

                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Loan Eligibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on this valuation, the property could qualify for a loan of up to:
                  </p>
                  <p className="text-xl font-semibold text-purple-700 dark:text-purple-400 mt-1">
                    UGX {Math.round(valuationResults.fairValue * 0.7).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (70% of Fair Value)
                  </p>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Report Generated",
                    description: "Full valuation report has been generated and saved.",
                  });
                }}>
                  Generate Full Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="shadow-md h-full">
            <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Calculator className="mr-2" />
                Valuation Guide
              </CardTitle>
              <CardDescription className="text-gray-200">
                How our property valuation works
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Home className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Property Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fill in accurate property information to receive the most precise valuation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <MapPin className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Location Matters</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Location significantly affects property values. Be specific about the area.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Grid2X2 className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">Multiple Valuations</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We provide fair value, market price, and forced price to give a complete picture.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Why Three Values?</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                  <li><span className="font-medium">Fair Value:</span> The true worth based on market conditions</li>
                  <li><span className="font-medium">Market Price:</span> Optimal selling price in current market</li>
                  <li><span className="font-medium">Forced Price:</span> Value in quick-sale scenarios</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyValuationForm;
