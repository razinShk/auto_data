import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface SimpleExcelUploadProps {
  onDataLoaded: (data: any[]) => void;
}

const SimpleExcelUpload: React.FC<SimpleExcelUploadProps> = ({ onDataLoaded }) => {
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      ['SR No', 'Part Name', 'Operation Number', 'Observation', 'Before Photo', 'After Photo', 'Action Plan', 'Responsibility', 'Remarks'],
      ['001', 'Sample Part', 'OP-100', 'Sample observation text', '', '', 'Sample action plan', 'John Doe', 'Sample remarks'],
      ['002', 'Another Part', 'OP-200', 'Another observation', '', '', 'Another action plan', 'Jane Smith', 'More remarks']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observation Template');
    
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
      description: "Excel template downloaded successfully",
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

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

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
      })).filter(row => row.srno || row.partName);

      onDataLoaded(dataRows);
      
      toast({
        title: "Excel Imported",
        description: `Added ${dataRows.length} entries from Excel`,
      });

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Import Failed",
        description: "Failed to process Excel file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-1">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50 text-xs h-6 sm:h-7"
        >
          <Download className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline ml-1">Template</span>
        </Button>
        
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="simple-excel-upload"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full text-green-600 border-green-600 hover:bg-green-50 text-xs h-6 sm:h-7"
          >
            <Upload className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Upload</span>
          </Button>
        </div>
      </div>
      <p className="text-xs text-gray-600 text-center hidden sm:block">
        Import data from Excel file
      </p>
    </div>
  );
};

export default SimpleExcelUpload; 