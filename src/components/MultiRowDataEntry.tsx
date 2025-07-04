import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Camera, FileText, Download, Archive, Cloud, HardDrive, AlertCircle, Plus, Upload, Eye, EyeOff, RefreshCw, FileSpreadsheet, Save, GripVertical, ChevronUp, ChevronDown, Search, Filter, X, ZoomIn, FolderOpen, Video, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import SimpleExcelUpload from "@/components/SimpleExcelUpload";
import { generatePDF } from "@/utils/pdfExport";
import { LocalStorageManager, LocalRowData } from "@/utils/localStorageManager";
import { Badge } from "@/components/ui/badge";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface RowData {
  id: string;
  srno: string;
  partName: string;
  opNumber: string;
  observation: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  actionPlan: string;
  responsibility: string;
  remarks: string;
  beforePhotoPreview: string;
  afterPhotoPreview: string;
  status: 'pending' | 'completed';
}

interface DragItem {
  type: string;
  id: string;
  index: number;
}

const DraggableRow: React.FC<{
  row: RowData;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  updateRow: (id: string, field: keyof RowData, value: string) => void;
  handleBeforePhotoChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAfterPhotoChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveRow: (id: string) => void;
  handleDeleteRow: (id: string) => void;
  rowRef: React.RefObject<HTMLDivElement>;
  onImagePreview: (imageUrl: string) => void;
  onTextPreview: (content: string, title: string) => void;
}> = ({ row, index, moveRow, updateRow, handleBeforePhotoChange, handleAfterPhotoChange, handleSaveRow, handleDeleteRow, rowRef, onImagePreview, onTextPreview }) => {
  
  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: { type: 'row', id: row.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'row',
    hover: (item: DragItem) => {
      if (!drag) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
        if (rowRef && index === 0 && node) {
          (rowRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="grid grid-cols-11 gap-0 min-h-[60px] sm:min-h-[80px]">
        {/* Drag Handle */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center justify-center bg-gray-100 cursor-move">
          <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
        </div>

        {/* SR No */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Input
              type="text"
              value={row.srno}
              onChange={(e) => updateRow(row.id, 'srno', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2"
              placeholder="SR No"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.srno, 'SR No')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Part Name */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Input
              type="text"
              value={row.partName}
              onChange={(e) => updateRow(row.id, 'partName', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2"
              placeholder="Part Name"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.partName, 'Part Name')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Operation Number */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Input
              type="text"
              value={row.opNumber}
              onChange={(e) => updateRow(row.id, 'opNumber', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2"
              placeholder="Op Number"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.opNumber, 'Operation Number')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Observation */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Textarea
              value={row.observation}
              onChange={(e) => updateRow(row.id, 'observation', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2 min-h-[40px] sm:min-h-[50px] resize-none"
              placeholder="Observation"
              rows={2}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.observation, 'Observation')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Before Photo */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex flex-col items-center justify-center space-y-1">
          <div className="flex gap-1">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBeforePhotoChange(row.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-6 sm:h-7 text-xs border-blue-300 hover:bg-blue-50 px-1"
              >
                <FolderOpen className="h-3 w-3" />
              </Button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleBeforePhotoChange(row.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-6 sm:h-7 text-xs border-blue-300 hover:bg-blue-50 px-1"
              >
                <Video className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {row.beforePhotoPreview && (
            <div className="relative cursor-pointer" onClick={() => onImagePreview(row.beforePhotoPreview)}>
              <img
                src={row.beforePhotoPreview}
                alt="Before"
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border hover:opacity-80 transition-opacity"
              />
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded text-[10px]">
                BEFORE
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                <ZoomIn className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
              </div>
            </div>
          )}
        </div>

        {/* After Photo */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex flex-col items-center justify-center space-y-1">
          <div className="flex gap-1">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAfterPhotoChange(row.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-6 sm:h-7 text-xs border-green-300 hover:bg-green-50 px-1"
              >
                <FolderOpen className="h-3 w-3" />
              </Button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleAfterPhotoChange(row.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-6 sm:h-7 text-xs border-green-300 hover:bg-green-50 px-1"
              >
                <Video className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {row.afterPhotoPreview && (
            <div className="relative cursor-pointer" onClick={() => onImagePreview(row.afterPhotoPreview)}>
              <img
                src={row.afterPhotoPreview}
                alt="After"
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border hover:opacity-80 transition-opacity"
              />
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded text-[10px]">
                AFTER
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                <ZoomIn className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
              </div>
            </div>
          )}
        </div>

        {/* Action Plan */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Textarea
              value={row.actionPlan}
              onChange={(e) => updateRow(row.id, 'actionPlan', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2 min-h-[40px] sm:min-h-[50px] resize-none"
              placeholder="Action Plan"
              rows={2}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.actionPlan, 'Action Plan')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Responsibility */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Input
              type="text"
              value={row.responsibility}
              onChange={(e) => updateRow(row.id, 'responsibility', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2"
              placeholder="Responsibility"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.responsibility, 'Responsibility')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Remarks */}
        <div className="p-2 sm:p-3 border-r border-gray-300 flex items-center">
          <div className="flex-1 flex items-center gap-1">
            <Textarea
              value={row.remarks}
              onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
              className="w-full border-0 bg-transparent focus:ring-0 text-xs sm:text-sm p-1 sm:p-2 min-h-[40px] sm:min-h-[50px] resize-none"
              placeholder="Remarks"
              rows={2}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextPreview(row.remarks, 'Remarks')}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View full content"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2 sm:p-3 flex items-center justify-center space-x-1">
          <Button
            onClick={() => handleSaveRow(row.id)}
            variant="outline"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-blue-300 hover:bg-blue-50"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </Button>
          <Button
            onClick={() => handleDeleteRow(row.id)}
            variant="outline"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MultiRowDataEntry = () => {
  const { toast } = useToast();
  const { currentProject, setCurrentProject } = useProject();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isControlCenterHidden, setIsControlCenterHidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterResponsibility, setFilterResponsibility] = useState('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasJustSynced, setHasJustSynced] = useState(false);
  const [isLoadingFromDatabase, setIsLoadingFromDatabase] = useState(false);
  const [textPreview, setTextPreview] = useState<{content: string, title: string} | null>(null);
  const [isTextPreviewOpen, setIsTextPreviewOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const newRowRef = useRef<HTMLDivElement>(null);
  
  const [rows, setRows] = useState<RowData[]>([
    {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      srno: '',
      partName: '',
      opNumber: '',
      observation: '',
      beforePhoto: null,
      afterPhoto: null,
      actionPlan: '',
      responsibility: '',
      remarks: '',
      beforePhotoPreview: '',
      afterPhotoPreview: '',
      status: 'pending'
    }
  ]);

  // Filter and search functions
  const getUniqueResponsibilities = () => {
    const responsibilities = rows.map(row => row.responsibility).filter(Boolean);
    return [...new Set(responsibilities)];
  };

  const filteredRows = rows.filter(row => {
    const matchesSearch = !searchTerm || 
      row.srno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.observation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.actionPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.responsibility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || row.status === filterStatus;
    const matchesResponsibility = filterResponsibility === 'all' || row.responsibility === filterResponsibility;
    
    return matchesSearch && matchesStatus && matchesResponsibility;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterResponsibility('all');
  };

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsPreviewOpen(true);
  };

  const handleTextPreview = (content: string, title: string) => {
    setTextPreview({ content, title });
    setIsTextPreviewOpen(true);
  };

  // Load existing entries when project changes
  useEffect(() => {
    if (currentProject) {
      loadProjectEntries();
      loadLocalStorageEntries();
    }
  }, [currentProject]);

  // Auto-save to local storage when rows change (but not immediately after sync or database load)
  useEffect(() => {
    if (currentProject && rows.length > 0 && !hasJustSynced && !isSyncing && !isLoadingFromDatabase) {
      autoSaveToLocalStorage();
    }
  }, [rows, currentProject, hasJustSynced, isSyncing, isLoadingFromDatabase]);

  // Reset hasJustSynced flag is now handled in the sync function itself to prevent conflicts

  // Set up beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsyncedCount > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        syncLocalStorageToDatabase();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsyncedCount]);

  // Update unsynced count when project changes
  useEffect(() => {
    if (currentProject) {
      const count = LocalStorageManager.getUnsyncedCount(currentProject.id);
      setUnsyncedCount(count);
    }
  }, [currentProject]);

  const loadLocalStorageEntries = () => {
    if (!currentProject) return;
    
    try {
      const localEntries = LocalStorageManager.loadEntries(currentProject.id);
      if (localEntries.length > 0) {
        const mappedRows = localEntries.map(entry => ({
          id: entry.id,
          srno: entry.srno,
          partName: entry.partName,
          opNumber: entry.opNumber,
          observation: entry.observation,
          beforePhoto: entry.beforePhoto,
          afterPhoto: entry.afterPhoto,
          actionPlan: entry.actionPlan,
          responsibility: entry.responsibility,
          remarks: entry.remarks,
          beforePhotoPreview: entry.beforePhotoPreview,
          afterPhotoPreview: entry.afterPhotoPreview,
          status: entry.status
        }));
        
        // Only load from local storage if we don't have any rows or just have the default empty row
        const hasOnlyEmptyRow = rows.length === 1 && 
          !rows[0].srno && !rows[0].partName && !rows[0].observation;
        
        if (hasOnlyEmptyRow || rows.length === 0) {
          setRows(mappedRows);
        }
        
        setUnsyncedCount(localEntries.length);
        
        toast({
          title: "Local Data Loaded",
          description: `Found ${localEntries.length} unsaved entries in local storage`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
  };

  const autoSaveToLocalStorage = () => {
    if (!currentProject || hasJustSynced || isSyncing || isLoadingFromDatabase) return;
    
    try {
      // Only save entries that have meaningful data
      const meaningfulRows = rows.filter(row => 
        row.srno || row.partName || row.observation || 
        row.actionPlan || row.responsibility || row.remarks ||
        row.beforePhoto || row.afterPhoto
      );

      if (meaningfulRows.length === 0) {
        // Clear local storage if no meaningful data
        LocalStorageManager.clearEntries(currentProject.id);
        setUnsyncedCount(0);
        return;
      }

      const localRows: LocalRowData[] = meaningfulRows.map(row => ({
        ...row,
        lastModified: new Date().toISOString(),
        projectId: currentProject.id
      }));
      
      LocalStorageManager.saveEntries(localRows, currentProject.id);
      setUnsyncedCount(localRows.length);
    } catch (error) {
      console.error('Error auto-saving to local storage:', error);
    }
  };

  const syncLocalStorageToDatabase = async () => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before syncing.",
        variant: "destructive",
      });
      return;
    }

    const localEntries = LocalStorageManager.loadEntries(currentProject.id);
    console.log('Syncing entries:', localEntries.length);
    
    if (localEntries.length === 0) {
      toast({
        title: "No Data to Sync",
        description: "No unsaved entries found in local storage.",
        variant: "default"
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Allow saving entries with some empty fields - only require at least one meaningful field
      const entriesToSave = localEntries
        .filter(row => 
          row.srno || row.partName || row.observation || 
          row.actionPlan || row.responsibility || row.remarks
        )
        .map(row => ({
          id: row.id, // Include the ID for proper upsert
          project_id: currentProject.id,
          srno: row.srno || '',
          part_name: row.partName || '',
          op_number: row.opNumber || '',
          observation: row.observation || '',
          before_photo_url: row.beforePhoto,
          after_photo_url: row.afterPhoto,
          action_plan: row.actionPlan || '',
          responsibility: row.responsibility || '',
          remarks: row.remarks || '',
          status: row.status || 'pending'
        }));

      if (entriesToSave.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No entries with meaningful data found to save.",
          variant: "destructive",
        });
        setIsSyncing(false);
        return;
      }

      // Use upsert with proper conflict resolution on id
      const { error } = await supabase
        .from('entries')
        .upsert(entriesToSave, { onConflict: 'id' });

      if (error) throw error;

      // Clear local storage after successful sync
      LocalStorageManager.clearEntries(currentProject.id);
      setUnsyncedCount(0);
      setHasJustSynced(true); // Prevent immediate auto-save after sync
      
      console.log('Sync completed, local storage cleared');

      toast({
        title: "Sync Successful",
        description: `Successfully synced ${entriesToSave.length} entries to database`,
      });

      // Reload entries to get updated data but prevent auto-save loop
      setHasJustSynced(true); // Set this again before reload
      await loadProjectEntries();
      
      // Extend the sync protection time to prevent auto-save after reload
      setTimeout(() => {
        setHasJustSynced(false);
      }, 5000); // 5 seconds delay
      
    } catch (error) {
      console.error('Error syncing to database:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync entries to database. Data remains in local storage.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const loadProjectEntries = async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    setIsLoadingFromDatabase(true); // Prevent auto-save during database load
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedRows = data.map(entry => ({
          id: entry.id,
          srno: entry.srno,
          partName: entry.part_name,
          opNumber: entry.op_number,
          observation: entry.observation,
          beforePhoto: entry.before_photo_url,
          afterPhoto: entry.after_photo_url,
          actionPlan: entry.action_plan,
          responsibility: entry.responsibility,
          remarks: entry.remarks,
          beforePhotoPreview: entry.before_photo_url || '',
          afterPhotoPreview: entry.after_photo_url || '',
          status: (entry.status as 'pending' | 'completed') || 'pending'
        }));
        setRows(loadedRows);
      } else {
        // If no data from database, keep existing rows or set empty row
        if (rows.length === 0) {
          setRows([{
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            srno: '',
            partName: '',
            opNumber: '',
            observation: '',
            beforePhoto: null,
            afterPhoto: null,
            actionPlan: '',
            responsibility: '',
            remarks: '',
            beforePhotoPreview: '',
            afterPhotoPreview: '',
            status: 'pending'
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: "Error",
        description: "Failed to load existing entries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset database loading flag after a delay to prevent auto-save
      setTimeout(() => {
        setIsLoadingFromDatabase(false);
      }, 2000);
    }
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  // Drag and drop functionality
  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      const draggedRow = newRows[dragIndex];
      newRows.splice(dragIndex, 1);
      newRows.splice(hoverIndex, 0, draggedRow);
      return newRows;
    });
  }, []);

  // Individual row actions
  const handleSaveRow = async (id: string) => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before saving.",
        variant: "destructive",
      });
      return;
    }

    const row = rows.find(r => r.id === id);
    if (!row) return;

    // Check if row has meaningful data
    if (!row.srno && !row.partName && !row.observation && !row.actionPlan && !row.responsibility && !row.remarks) {
      toast({
        title: "No Data to Save",
        description: "Please add some data to this row before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryToSave = {
        project_id: currentProject.id,
        srno: row.srno || '',
        part_name: row.partName || '',
        op_number: row.opNumber || '',
        observation: row.observation || '',
        before_photo_url: row.beforePhoto,
        after_photo_url: row.afterPhoto,
        action_plan: row.actionPlan || '',
        responsibility: row.responsibility || '',
        remarks: row.remarks || '',
        status: row.status || 'pending'
      };

      const { error } = await supabase
        .from('entries')
        .upsert([entryToSave]);

      if (error) throw error;

      // Remove from local storage after successful save
      LocalStorageManager.removeEntry(id, currentProject.id);
      setUnsyncedCount(prev => Math.max(0, prev - 1));

      toast({
        title: "Row Saved",
        description: "Entry saved to database successfully",
      });
    } catch (error) {
      console.error('Error saving row:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save this entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRow = (id: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== id));
    
    // Also remove from local storage
    if (currentProject) {
      LocalStorageManager.removeEntry(id, currentProject.id);
      setUnsyncedCount(prev => Math.max(0, prev - 1));
    }

    toast({
      title: "Row Deleted",
      description: "Entry removed successfully",
    });
  };

  const addRow = () => {
    // Generate a more unique ID to prevent conflicts
    const newRowId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setRows(prevRows => [
      ...prevRows,
      {
        id: newRowId,
        srno: '',
        partName: '',
        opNumber: '',
        observation: '',
        beforePhoto: null,
        afterPhoto: null,
        actionPlan: '',
        responsibility: '',
        remarks: '',
        beforePhotoPreview: '',
        afterPhotoPreview: '',
        status: 'pending'
      }
    ]);

    // Auto-scroll to the new row after a short delay
    setTimeout(() => {
      if (tableRef.current) {
        const tableElement = tableRef.current;
        tableElement.scrollTop = tableElement.scrollHeight;
      }
    }, 100);
  };

  const removeRow = (id: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== id));
    
    // Also remove from local storage
    if (currentProject) {
      LocalStorageManager.removeEntry(id, currentProject.id);
    }
  };

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleBeforePhotoChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentProject) {
      const imageUrl = URL.createObjectURL(file);
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === id ? { ...row, beforePhotoPreview: imageUrl } : row
        )
      );

      const uploadedUrl = await uploadImage(file, `${currentProject.id}/before`);
      if (uploadedUrl) {
        updateRow(id, 'beforePhoto', uploadedUrl);
      }
    }
  };

  const handleAfterPhotoChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentProject) {
      const imageUrl = URL.createObjectURL(file);
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === id ? { ...row, afterPhotoPreview: imageUrl } : row
        )
      );

      const uploadedUrl = await uploadImage(file, `${currentProject.id}/after`);
      if (uploadedUrl) {
        updateRow(id, 'afterPhoto', uploadedUrl);
      }
    }
  };

  const handleSaveAll = async () => {
    if (isSyncing) {
      toast({
        title: "Sync in Progress",
        description: "Please wait for the current sync to complete.",
        variant: "default"
      });
      return;
    }
    // This now syncs local storage to database
    await syncLocalStorageToDatabase();
  };

  const handleClearAll = () => {
    setRows([
      {
        id: Date.now().toString(),
        srno: '',
        partName: '',
        opNumber: '',
        observation: '',
        beforePhoto: null,
        afterPhoto: null,
        actionPlan: '',
        responsibility: '',
        remarks: '',
        beforePhotoPreview: '',
        afterPhotoPreview: '',
        status: 'pending'
      }
    ]);
    
    // Also clear local storage
    if (currentProject) {
      LocalStorageManager.clearEntries(currentProject.id);
      setUnsyncedCount(0);
    }
    
    toast({
      title: "Cleared",
      description: "All entries and local storage have been cleared"
    });
  };

  const handleToggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const handleExportPDF = async () => {
    if (rows.length === 0 || rows.every(row => !row.srno && !row.partName)) {
      toast({
        title: "No Data to Export",
        description: "Please add some observation data before exporting to PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const validRows = rows.filter(row => row.srno || row.partName || row.observation);
      const pdfEntries = validRows.map(row => ({
        id: row.id,
        srno: row.srno,
        partName: row.partName,
        opNumber: row.opNumber,
        observation: row.observation,
        beforePhoto: row.beforePhoto,
        afterPhoto: row.afterPhoto,
        actionPlan: row.actionPlan,
        responsibility: row.responsibility,
        remarks: row.remarks,
        timestamp: new Date().toISOString(),
        status: row.status
      }));

      const pdf = await generatePDF(pdfEntries, currentProject?.name || 'Observation Data');
      pdf.save(`${currentProject?.name || 'observation-data'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: `Successfully exported ${validRows.length} entries to PDF with images.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    toast({
      title: "Excel Export",
      description: "Excel export functionality is available. Note: Images will not be included in Excel files.",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "CSV Export",
      description: "CSV export functionality coming soon!",
    });
  };

  const handleExportJSON = () => {
    toast({
      title: "JSON Export",
      description: "JSON export functionality coming soon!",
    });
  };

  const handleDownloadImages = () => {
    toast({
      title: "Download Images",
      description: "Bulk image download functionality coming soon!",
    });
  };

  const handleExcelDataImport = (importedData: any[]) => {
    const newRows = importedData.map((item, index) => ({
      id: `imported-${Date.now()}-${index}`,
      srno: item.srno || '',
      partName: item.partName || '',
      opNumber: item.opNumber || '',
      observation: item.observation || '',
      beforePhoto: null,
      afterPhoto: null,
      actionPlan: item.actionPlan || '',
      responsibility: item.responsibility || '',
      remarks: item.remarks || '',
      beforePhotoPreview: '',
      afterPhotoPreview: '',
      status: 'pending' as const
    }));

    setRows(prev => [...prev, ...newRows]);
    toast({
      title: "Excel Data Imported",
      description: `Added ${newRows.length} entries from Excel file`,
    });
  };

  React.useEffect(() => {
    const handleExcelImport = (event: CustomEvent) => {
      handleExcelDataImport(event.detail);
    };

    window.addEventListener('excelDataImported', handleExcelImport as EventListener);
    return () => {
      window.removeEventListener('excelDataImported', handleExcelImport as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Compact Control Panel */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-full mx-auto">
          {/* Streamlined Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentProject(null)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 shrink-0"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium text-xs sm:text-sm hidden xs:inline">Back to Projects</span>
                <span className="font-medium text-xs xs:hidden">Back</span>
              </Button>
              <div className="h-4 sm:h-6 w-px bg-gray-300 shrink-0"></div>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="sm:hidden">Data Entry</span>
                  <span className="hidden sm:inline">Data Entry Control Center</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-2 sm:px-3 py-1 text-xs">
                {rows.length}
                <span className="hidden sm:inline"> {rows.length === 1 ? 'Entry' : 'Entries'}</span>
              </Badge>
              {unsyncedCount > 0 && (
                <Badge className="bg-orange-500 text-white animate-pulse px-2 sm:px-3 py-1 text-xs">
                  {unsyncedCount}
                  <span className="hidden sm:inline"> Unsaved</span>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsControlCenterHidden(!isControlCenterHidden)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-lg transition-all duration-200 shrink-0"
              >
                {isControlCenterHidden ? (
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Collapsible Control Panel */}
          {!isControlCenterHidden && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-100">
              {/* Horizontal Search and Filter Row */}
              <div className="space-y-3 mb-4">
                {/* Single Horizontal Row with Search, Status, and People Filters */}
                <div className="flex gap-2 items-center">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-sm"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 sm:w-36 h-10 sm:h-9 bg-gray-50 border-gray-200 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* People Filter */}
                  <Select value={filterResponsibility} onValueChange={setFilterResponsibility}>
                    <SelectTrigger className="w-32 sm:w-36 h-10 sm:h-9 bg-gray-50 border-gray-200 text-sm">
                      <SelectValue placeholder="Person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All People</SelectItem>
                      {getUniqueResponsibilities().map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Filters Button */}
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="h-10 sm:h-9 px-3 bg-gray-50 border-gray-200 hover:bg-gray-100 shrink-0"
                  >
                    <X className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                </div>
                
                {/* Results Badge */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm">
                    {filteredRows.length} / {rows.length} entries
                  </Badge>
                </div>
              </div>

              {/* Mobile-optimized Control Sections */}
              <div className="flex gap-2 items-center overflow-x-auto pb-2">
                
                {/* Import Data */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-3 py-2 border border-green-200 whitespace-nowrap min-w-fit">
                  <Upload className="h-4 w-4 text-green-600" />
                  <SimpleExcelUpload onDataLoaded={handleExcelDataImport} />
                </div>

                {/* Data Entry Controls */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-3 py-2 border border-blue-200 whitespace-nowrap min-w-fit">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex gap-2">
                    <Button
                      onClick={addRow}
                      disabled={isLoading || isSyncing}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                    <Button
                      onClick={handleSaveAll}
                      disabled={isLoading || isSyncing}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm"
                    >
                      <Cloud className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Sync</span>
                    </Button>
                    <Button
                      onClick={handleToggleVisibility}
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50 h-8 px-3 text-sm"
                    >
                      {isHidden ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                      <span className="hidden sm:inline">{isHidden ? 'Show' : 'Hide'}</span>
                    </Button>
                    <Button
                      onClick={handleClearAll}
                      variant="outline"
                      disabled={isLoading || isSyncing}
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50 h-8 px-3 text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl px-3 py-2 border border-orange-200 whitespace-nowrap min-w-fit">
                  <Download className="h-4 w-4 text-orange-600" />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white h-8 px-3 text-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                    <Button
                      onClick={handleExportExcel}
                      disabled={isExporting}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50 h-8 px-3 text-sm"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Excel</span>
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      disabled={isExporting}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 px-3 text-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">CSV</span>
                    </Button>
                    <Button
                      onClick={handleExportJSON}
                      disabled={isExporting}
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-600 hover:bg-purple-50 h-8 px-3 text-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">JSON</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Enhanced */}
      <div className="flex-1 p-4">
        {!isHidden && (
          <Card className="w-full bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    Observation Data Entry
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                    {filteredRows.length} Records
                  </Badge>
                  <Badge className="bg-green-500 text-white px-4 py-2">
                    {rows.filter(row => row.srno || row.partName || row.observation).length} With Data
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Excel-like Table - Enhanced */}
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200 min-w-[1400px]">
                  <div className="grid grid-cols-11 gap-0">
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center bg-gray-100">
                      <GripVertical className="h-4 w-4 mx-auto" />
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center bg-blue-50">
                      SR No
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Part Name
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Operation Number
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Observation
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Before Photo
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      After Photo
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Action Plan
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Responsibility
                    </div>
                    <div className="p-4 border-r border-gray-300 font-semibold text-sm text-center">
                      Remarks
                    </div>
                    <div className="p-4 font-semibold text-sm text-center">
                      Actions
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div ref={tableRef} className="max-h-[calc(100vh-400px)] overflow-y-auto min-w-[1400px]">
                  <DndProvider backend={HTML5Backend}>
                    {filteredRows.map((row, index) => (
                      <DraggableRow
                        key={row.id}
                        row={row}
                        index={index}
                        moveRow={moveRow}
                        updateRow={updateRow}
                        handleBeforePhotoChange={handleBeforePhotoChange}
                        handleAfterPhotoChange={handleAfterPhotoChange}
                        handleSaveRow={handleSaveRow}
                        handleDeleteRow={handleDeleteRow}
                        rowRef={newRowRef}
                        onImagePreview={handleImagePreview}
                        onTextPreview={handleTextPreview}
                      />
                    ))}
                  </DndProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden State Message */}
        {isHidden && (
          <div className="flex items-center justify-center p-6 sm:p-12 mt-2 sm:mt-4">
            <div className="text-center">
              <EyeOff className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">Data Entry Form Hidden</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Click "Show" in the control panel to display the entry form</p>
              <Button
                onClick={handleToggleVisibility}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              >
                <Eye className="h-4 w-4 mr-2" />
                Show Data Entry Form
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Text Preview Dialog */}
      <Dialog open={isTextPreviewOpen} onOpenChange={setIsTextPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {textPreview?.title}
            </DialogTitle>
          </DialogHeader>
          {textPreview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {textPreview.content || (
                    <span className="text-gray-400 italic">No content available</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Length: {textPreview.content?.length || 0} characters</span>
                <span>Click outside to close</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiRowDataEntry;
