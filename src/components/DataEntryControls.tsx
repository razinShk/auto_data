
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";

interface DataEntryControlsProps {
  onAddRow: () => void;
  onSaveAll: () => void;
  onClearAll: () => void;
  onToggleVisibility: () => void;
  isHidden: boolean;
  totalRows: number;
  isLoading?: boolean;
}

const DataEntryControls: React.FC<DataEntryControlsProps> = ({
  onAddRow,
  onSaveAll,
  onClearAll,
  onToggleVisibility,
  isHidden,
  totalRows,
  isLoading = false
}) => {
  return (
    <Card className="sticky top-4 z-10 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-blue-700">Data Entry Controls</span>
          <span className="text-sm font-normal text-gray-600">
            {totalRows} {totalRows === 1 ? 'entry' : 'entries'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={onAddRow}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          
          <Button
            onClick={onSaveAll}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Sync to Database
          </Button>
          
          <Button
            onClick={onToggleVisibility}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            {isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {isHidden ? 'Show' : 'Hide'} Entries
          </Button>
          
          <Button
            onClick={onClearAll}
            variant="outline"
            disabled={isLoading}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center mt-3 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryControls;
