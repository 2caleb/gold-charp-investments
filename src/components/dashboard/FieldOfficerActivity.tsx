import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SparklesIcon, UserRoundCheck } from 'lucide-react';

interface FieldOfficer {
  id: number;
  name: string;
  avatar: string;
  activeLoans: number;
  completionRate: number;
  averageProcessingTime: string;
  clientSatisfaction: number;
}

export const FieldOfficerActivity = () => {
  // Replace the fieldOfficers array with the new names
  const fieldOfficers = [
    {
      id: 1,
      name: 'Nazziwa Sandra',
      avatar: '/placeholder.svg',
      activeLoans: 36,
      completionRate: 92,
      averageProcessingTime: '1.5 days',
      clientSatisfaction: 4.8
    },
    {
      id: 2,
      name: 'Sharon Kanyunyuzi',
      avatar: '/placeholder.svg',
      activeLoans: 28,
      completionRate: 88,
      averageProcessingTime: '1.8 days',
      clientSatisfaction: 4.6
    },
    {
      id: 3,
      name: 'Harriet Namutebi',
      avatar: '/placeholder.svg',
      activeLoans: 24,
      completionRate: 94,
      averageProcessingTime: '1.6 days',
      clientSatisfaction: 4.9
    },
    {
      id: 4,
      name: 'Godfrey Nsubuga Monde',
      avatar: '/placeholder.svg',
      activeLoans: 31,
      completionRate: 90,
      averageProcessingTime: '1.7 days',
      clientSatisfaction: 4.7
    }
  ];

  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader>
        <CardTitle>Top Performing Officers</CardTitle>
        <CardDescription>See who is leading the charge</CardDescription>
      </CardHeader>
      <CardContent className="pl-4">
        <ul className="space-y-4">
          {fieldOfficers.map((officer) => (
            <li key={officer.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={officer.avatar} alt={officer.name} />
                  <AvatarFallback>{officer.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{officer.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Loans: {officer.activeLoans}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="secondary" className="mb-1">
                  <UserRoundCheck className="h-3 w-3 mr-1" />
                  {officer.completionRate}%
                </Badge>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Satisfaction: {officer.clientSatisfaction}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-4">
        <div className="flex items-center justify-center">
          <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our team is dedicated to your success.
          </p>
        </div>
      </div>
    </Card>
  );
};
