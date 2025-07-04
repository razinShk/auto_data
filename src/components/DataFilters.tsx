
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Search, RotateCcw } from "lucide-react";

interface DataFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  responsibilityFilter: string;
  onResponsibilityFilterChange: (filter: string) => void;
  onClearFilters: () => void;
  uniqueResponsibilities: string[];
}

const DataFilters: React.FC<DataFiltersProps> = ({
  searchTerm,
  onSearchChange,
  responsibilityFilter,
  onResponsibilityFilterChange,
  onClearFilters,
  uniqueResponsibilities
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search observations, parts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Responsibility</Label>
            <select
              value={responsibilityFilter}
              onChange={(e) => onResponsibilityFilterChange(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Responsibilities</option>
              {uniqueResponsibilities.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Actions</Label>
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFilters;
