
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Download, Eye, Calendar, User, FileText, Camera, CheckCircle, AlertCircle, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import ProjectSelector from "@/components/ProjectSelector";

// Enhanced mock entries with editing capabilities
const initialMockEntries = [
  {
    id: '1',
    srno: '001',
    partName: 'Engine Block',
    opNumber: 'OP-100',
    observation: 'Surface roughness detected on cylinder wall. Minor scratches visible under inspection.',
    beforePhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    actionPlan: 'Polish surface using fine-grit sandpaper and apply protective coating',
    responsibility: 'John Doe',
    remarks: 'Follow-up inspection required after 48 hours',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    srno: '002',
    partName: 'Transmission Housing',
    opNumber: 'OP-200',
    observation: 'Oil leak detected at gasket junction. Requires immediate attention.',
    beforePhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    afterPhoto: null,
    actionPlan: 'Replace gasket and apply sealant',
    responsibility: 'Jane Smith',
    remarks: 'Priority: High - Safety concern',
    timestamp: '2024-01-15T14:20:00Z',
    status: 'pending'
  },
  {
    id: '3',
    srno: '003',
    partName: 'Brake Assembly',
    opNumber: 'OP-300',
    observation: 'Wear patterns within acceptable limits. No immediate action required.',
    beforePhoto: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    actionPlan: 'Schedule routine maintenance in 2 weeks',
    responsibility: 'Mike Johnson',
    remarks: 'Good condition overall',
    timestamp: '2024-01-15T16:45:00Z',
    status: 'completed'
  }
];

const EntriesView = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState(initialMockEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.observation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.srno.includes(searchTerm) ||
        entry.responsibility.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, entries]);

  const stats = useMemo(() => {
    return {
      total: entries.length,
      completed: entries.filter(e => e.status === 'completed').length,
      pending: entries.filter(e => e.status === 'pending').length,
      withImages: entries.filter(e => e.beforePhoto || e.afterPhoto).length
    };
  }, [entries]);

  const handleEditEntry = (entryId: string) => {
    setEditingEntry(entryId);
  };

  const handleSaveEntry = (entryId: string, updatedData: any) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, ...updatedData, timestamp: new Date().toISOString() }
          : entry
      )
    );
    setEditingEntry(null);
    toast({
      title: "Success",
      description: "Entry updated successfully",
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast({
      title: "Deleted",
      description: "Entry deleted successfully",
    });
  };

  const handleAddNewEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      srno: String(entries.length + 1).padStart(3, '0'),
      partName: '',
      opNumber: '',
      observation: '',
      beforePhoto: null,
      afterPhoto: null,
      actionPlan: '',
      responsibility: '',
      remarks: '',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setEntries(prev => [...prev, newEntry]);
    setEditingEntry(newEntry.id);
  };



  const EditableEntryCard = ({ entry }: { entry: any }) => {
    const [editData, setEditData] = useState(entry);
    const isEditing = editingEntry === entry.id;

    const handleSave = () => {
      handleSaveEntry(entry.id, editData);
    };

    const handleCancel = () => {
      setEditData(entry);
      setEditingEntry(null);
    };

    const handleImageUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setEditData(prev => ({
          ...prev,
          [type === 'before' ? 'beforePhoto' : 'afterPhoto']: imageUrl
        }));
      }
    };

    return (
      <Card className={`bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-l-4 min-w-[400px] max-w-[500px] ${
        entry.status === 'completed' ? 'border-l-green-500' : 'border-l-orange-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={editData.srno}
                      onChange={(e) => setEditData(prev => ({ ...prev, srno: e.target.value }))}
                      className="w-20"
                      placeholder="SR No"
                    />
                    <Input
                      value={editData.partName}
                      onChange={(e) => setEditData(prev => ({ ...prev, partName: e.target.value }))}
                      placeholder="Part Name"
                      className="flex-1"
                    />
                  </div>
                  <Input
                    value={editData.opNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, opNumber: e.target.value }))}
                    placeholder="Operation Number"
                  />
                </div>
              ) : (
                <CardTitle className="text-lg flex items-center gap-2">
                  #{entry.srno} - {entry.partName}
                  {entry.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                </CardTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                  {entry.status}
                </Badge>
              )}
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEditEntry(entry.id)} className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteEntry(entry.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {entry.opNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Images */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Before
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('before', e)}
                    className="text-xs"
                  />
                  {editData.beforePhoto && (
                    <img
                      src={editData.beforePhoto}
                      alt="Before"
                      className="w-full h-24 object-cover rounded-md border-2 border-gray-200"
                    />
                  )}
                </div>
              ) : (
                entry.beforePhoto && (
                  <img
                    src={entry.beforePhoto}
                    alt="Before"
                    className="w-full h-24 object-cover rounded-md border-2 border-gray-200 hover:border-blue-400 transition-colors"
                  />
                )
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Camera className="h-3 w-3" />
                After
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('after', e)}
                    className="text-xs"
                  />
                  {editData.afterPhoto && (
                    <img
                      src={editData.afterPhoto}
                      alt="After"
                      className="w-full h-24 object-cover rounded-md border-2 border-gray-200"
                    />
                  )}
                </div>
              ) : (
                entry.afterPhoto && (
                  <img
                    src={entry.afterPhoto}
                    alt="After"
                    className="w-full h-24 object-cover rounded-md border-2 border-gray-200 hover:border-blue-400 transition-colors"
                  />
                )
              )}
            </div>
          </div>

          {/* Observation */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Observation</Label>
            {isEditing ? (
              <Textarea
                value={editData.observation}
                onChange={(e) => setEditData(prev => ({ ...prev, observation: e.target.value }))}
                placeholder="Enter observation details"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-800">{entry.observation}</p>
            )}
          </div>

          {/* Action Plan */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Action Plan</Label>
            {isEditing ? (
              <Textarea
                value={editData.actionPlan}
                onChange={(e) => setEditData(prev => ({ ...prev, actionPlan: e.target.value }))}
                placeholder="Enter action plan"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-800">{entry.actionPlan}</p>
            )}
          </div>

          {/* Responsibility and Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" />
                Responsibility
              </Label>
              {isEditing ? (
                <Input
                  value={editData.responsibility}
                  onChange={(e) => setEditData(prev => ({ ...prev, responsibility: e.target.value }))}
                  placeholder="Responsible person"
                />
              ) : (
                <p className="text-sm text-gray-800 font-medium">{entry.responsibility}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Remarks</Label>
              {isEditing ? (
                <Input
                  value={editData.remarks}
                  onChange={(e) => setEditData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional remarks"
                />
              ) : (
                <p className="text-sm text-gray-800">{entry.remarks}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Data Entry
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editable Entries Gallery</h1>
              <p className="text-gray-600">{currentProject?.name || 'All Projects'} • Manage and edit observation records</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Projects
            </Button>

            <Button onClick={handleAddNewEntry} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        {showProjectSelector && (
          <div className="mb-6">
            <ProjectSelector />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.withImages}</div>
              <div className="text-sm text-gray-600">With Images</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search entries by part name, observation, or responsibility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('completed')}
                  size="sm"
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  size="sm"
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horizontal scrollable entries */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredEntries.map((entry) => (
              <EditableEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 && (
          <Card className="text-center py-12 bg-white/50 backdrop-blur-sm">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Entries Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No observation entries to display yet'}
              </p>
              <Button onClick={handleAddNewEntry} className="bg-blue-600 hover:bg-blue-700">
                Add New Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Showing {filteredEntries.length} of {entries.length} entries • 
            Click edit icon to modify entries • 
            Scroll horizontally to view all entries • 
            Images and data are fully editable
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntriesView;
