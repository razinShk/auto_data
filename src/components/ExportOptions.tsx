
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, Database, Archive, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportOptionsProps {
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onDownloadImages: () => void;
  isGenerating: boolean;
  totalEntries: number;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  onExportExcel,
  onExportCSV,
  onExportJSON,
  onDownloadImages,
  isGenerating,
  totalEntries
}) => {
  const { toast } = useToast();

  const handleExportExcel = () => {
    toast({
      title: "Excel Export",
      description: "⚠️ Excel format does not support images. Use PDF export to include images.",
      variant: "destructive"
    });
    onExportExcel();
  };

  const handleExportCSV = () => {
    toast({
      title: "CSV Export",
      description: "CSV export functionality coming soon!",
    });
    onExportCSV();
  };

  const handleExportJSON = () => {
    toast({
      title: "JSON Export",
      description: "JSON export functionality coming soon!",
    });
    onExportJSON();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Export Options (Text Data Only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Warning about images */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Images not included in these formats</p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              For complete documentation with images, use the PDF export option above.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={handleExportExcel}
              disabled={isGenerating}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel (.xlsx)
            </Button>
            
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Database className="h-4 w-4 mr-2" />
              CSV
            </Button>
            
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              JSON
            </Button>
            
            <Button
              onClick={onDownloadImages}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Images Only
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to export {totalEntries} entries (text data only)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;
