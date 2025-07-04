
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onDataLoaded: (data: any[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataLoaded }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      ['SR No', 'Part Name', 'Operation Number', 'Observation', 'Before Photo', 'After Photo', 'Action Plan', 'Responsibility', 'Remarks'],
      ['001', 'Sample Part', 'OP-100', 'Sample observation text', '', '', 'Sample action plan', 'John Doe', 'Sample remarks'],
      ['002', 'Another Part', 'OP-200', 'Another observation', '', '', 'Another action plan', 'Jane Smith', 'More remarks']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observation Template');
    
    // Auto-size columns
    const colWidths = templateData[0].map((_, colIndex) => {
      const maxLength = Math.max(...templateData.map(row => 
        row[colIndex] ? row[colIndex].toString().length : 0
      ));
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'observation_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and convert to our format
      const dataRows = jsonData.slice(1).map((row: any[], index: number) => ({
        id: `imported-${Date.now()}-${index}`,
        srno: row[0]?.toString() || '',
        partName: row[1]?.toString() || '',
        opNumber: row[2]?.toString() || '',
        observation: row[3]?.toString() || '',
        beforePhoto: null,
        afterPhoto: null,
        actionPlan: row[6]?.toString() || '',
        responsibility: row[7]?.toString() || '',
        remarks: row[8]?.toString() || '',
        beforePhotoPreview: '',
        afterPhotoPreview: ''
      })).filter(row => row.srno || row.partName); // Filter out empty rows

      onDataLoaded(dataRows);
      
      toast({
        title: "Excel Imported Successfully",
        description: `Loaded ${dataRows.length} entries from Excel file`,
      });

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Import Failed",
        description: "Failed to process Excel file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-green-700">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import from Excel
          </div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Label className="text-lg font-medium text-gray-700 mb-2 block">
                Upload Excel File
              </Label>
              <p className="text-sm text-gray-600 mb-4">
                Import observation data from an Excel file. Download the template above for the correct format.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="excel-upload"
                disabled={isProcessing}
              />
              <Label 
                htmlFor="excel-upload" 
                className="cursor-pointer inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Choose Excel File'}
              </Label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{uploadedFile.name}</p>
                  <p className="text-sm text-green-600">Excel file imported successfully</p>
                </div>
              </div>
              <Button
                onClick={clearFile}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Expected Excel Format:</p>
            <p>Columns: SR No | Part Name | Operation Number | Observation | Before Photo | After Photo | Action Plan | Responsibility | Remarks</p>
            <p className="mt-1">Note: Photo columns can be left empty - images should be uploaded through the web interface.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
