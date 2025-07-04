
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Camera, FileText, Users } from "lucide-react";

interface DataSummaryProps {
  totalEntries: number;
  entriesWithPhotos: number;
  entriesWithActionPlans: number;
  entriesWithRemarks: number;
}

const DataSummary: React.FC<DataSummaryProps> = ({
  totalEntries,
  entriesWithPhotos,
  entriesWithActionPlans,
  entriesWithRemarks
}) => {
  const stats = [
    {
      title: "Total Entries",
      value: totalEntries,
      icon: FileText,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "With Photos",
      value: entriesWithPhotos,
      icon: Camera,
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "With Action Plans",
      value: entriesWithActionPlans,
      icon: BarChart3,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "With Remarks",
      value: entriesWithRemarks,
      icon: Users,
      color: "text-orange-600 bg-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="text-center">
            <CardContent className="pt-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mb-3`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DataSummary;
