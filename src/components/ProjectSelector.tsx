import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderOpen, Trash2, Lock, Eye, EyeOff, Sparkles, Shield, Users, Calendar, Search, Filter, X, SortAsc, SortDesc, Key, AlertTriangle, HelpCircle } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import ReportIssueForm from "@/components/ReportIssueForm";

const ProjectSelector = () => {
  const { 
    currentProject, 
    projects, 
    setCurrentProject, 
    loadProjects, 
    createProject, 
    deleteProject, 
    verifyProjectPassword,
    changeProjectPassword,
    isLoading 
  } = useProject();
  
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPassword, setNewProjectPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [changePasswordProjectId, setChangePasswordProjectId] = useState<string | null>(null);
  const [changePasswordInput, setChangePasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showReportIssue, setShowReportIssue] = useState(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchLower) ||
        (project.description?.toLowerCase().includes(searchLower) || false)
      );
    });

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'modified':
          comparison = new Date(a.updated_at || a.created_at || 0).getTime() - new Date(b.updated_at || b.created_at || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, searchTerm, sortBy, sortOrder]);

  const clearSearch = () => {
    setSearchTerm('');
    setSortBy('modified');
    setSortOrder('desc');
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    if (!newProjectPassword.trim()) {
      toast({
        title: "Error",
        description: "Project password is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createProject(newProjectName, newProjectDescription, newProjectPassword);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectPassword('');
      setShowNewProject(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (!passwordInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the project password",
        variant: "destructive"
      });
      return;
    }

    const isValid = await verifyProjectPassword(projectId, passwordInput);
    if (isValid) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        setSelectedProjectId(null);
        setPasswordInput('');
        toast({
          title: "Success",
          description: "Project access granted"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!deletePasswordInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the project password to delete",
        variant: "destructive"
      });
      return;
    }

    const isValid = await verifyProjectPassword(projectId, deletePasswordInput);
    if (isValid) {
      await deleteProject(projectId);
      setDeleteProjectId(null);
      setDeletePasswordInput('');
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password. Cannot delete project.",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async (projectId: string) => {
    if (!changePasswordInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the current password",
        variant: "destructive"
      });
      return;
    }

    if (!newPasswordInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive"
      });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    const success = await changeProjectPassword(projectId, changePasswordInput, newPasswordInput);
    if (success) {
      setChangePasswordProjectId(null);
      setChangePasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }
  };

  if (currentProject) {
    return (
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl"></div>
        </div>
        
        <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-green-50 via-white to-blue-50">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <CardTitle className="text-green-800 text-lg sm:text-xl">Active Project</CardTitle>
                    <Badge className="bg-green-500 text-white px-2 sm:px-3 py-1 text-xs w-fit">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <p className="text-green-700 font-semibold text-base sm:text-lg">{currentProject.name}</p>
                  {currentProject.description && (
                    <p className="text-green-600 text-xs sm:text-sm mt-1">{currentProject.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentProject(null)}
                className="border-green-300 text-green-700 hover:bg-green-100 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                size="sm"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Switch Project
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Project Management Hub
            </CardTitle>
            <p className="text-gray-600 text-sm sm:text-base px-4 sm:px-0">
              Select an existing project or create a new one to get started
            </p>
          </div>
          
          {/* Fixed Report Issue Button */}
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => setShowReportIssue(true)}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 shadow-lg"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Search and Filter Section */}
          {projects.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  {(searchTerm || sortBy !== 'modified' || sortOrder !== 'desc') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
                  {filteredProjects.length} of {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </Badge>
              </div>

              {/* Expandable Filter Options */}
              {showFilters && (
                <Card className="border-0 bg-gray-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                        <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'modified') => setSortBy(value)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Sort by..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modified">Last Modified</SelectItem>
                            <SelectItem value="created">Date Created</SelectItem>
                            <SelectItem value="name">Project Name</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Order</Label>
                        <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Order..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">
                              <div className="flex items-center gap-2">
                                <SortDesc className="h-4 w-4" />
                                Newest First
                              </div>
                            </SelectItem>
                            <SelectItem value="asc">
                              <div className="flex items-center gap-2">
                                <SortAsc className="h-4 w-4" />
                                Oldest First
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading your projects...</p>
            </div>
          ) : projects.length > 0 ? (
            filteredProjects.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <Label className="text-base sm:text-lg font-semibold text-gray-800">Your Projects</Label>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 w-fit">
                    {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                    {filteredProjects.length !== projects.length && (
                      <span className="ml-1 text-gray-500">of {projects.length}</span>
                    )}
                  </Badge>
                </div>
                
                <div className="grid gap-3 sm:gap-4">
                  {filteredProjects.map(project => (
                    <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] bg-gradient-to-r from-gray-50 to-slate-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                                <p className="font-semibold text-gray-800 text-base sm:text-lg truncate">{project.name}</p>
                                <Shield className="h-4 w-4 text-gray-500 shrink-0" />
                              </div>
                              {project.description && (
                                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{project.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Secure Project
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Dialog open={selectedProjectId === project.id} onOpenChange={(open) => {
                              if (!open) {
                                setSelectedProjectId(null);
                                setPasswordInput('');
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  onClick={() => setSelectedProjectId(project.id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 flex-1 sm:flex-none"
                                  size="sm"
                                >
                                  <FolderOpen className="h-4 w-4 mr-2" />
                                  Open
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
                                    Access Project: {project.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 sm:space-y-6">
                                  <div className="text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                      <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    </div>
                                    <p className="text-gray-600 text-sm sm:text-base">Enter your project password to continue</p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">Project Password</Label>
                                    <Input
                                      id="password"
                                      type="password"
                                      value={passwordInput}
                                      onChange={(e) => setPasswordInput(e.target.value)}
                                      placeholder="Enter project password"
                                      className="text-center"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleProjectSelect(project.id);
                                        }
                                      }}
                                    />
                                  </div>
                                  
                                  <Button 
                                    onClick={() => handleProjectSelect(project.id)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    size="lg"
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Access Project
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {/* Change Password Dialog */}
                            <Dialog open={changePasswordProjectId === project.id} onOpenChange={(open) => {
                              if (!open) {
                                setChangePasswordProjectId(null);
                                setChangePasswordInput('');
                                setNewPasswordInput('');
                                setConfirmPasswordInput('');
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  onClick={() => setChangePasswordProjectId(project.id)}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-4"
                                  size="sm"
                                >
                                  <Key className="h-4 w-4" />
                                  <span className="sr-only">Change Password</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-lg sm:text-xl font-bold text-purple-800">
                                    Change Password: {project.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 sm:space-y-6">
                                  <div className="text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                      <Key className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    </div>
                                    <p className="text-gray-600 text-sm sm:text-base">Change your project password</p>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor="currentPassword" className="text-sm font-medium">
                                        Current Password (or Admin Password)
                                      </Label>
                                      <Input
                                        id="currentPassword"
                                        type="password"
                                        value={changePasswordInput}
                                        onChange={(e) => setChangePasswordInput(e.target.value)}
                                        placeholder="Enter current password"
                                        className="text-center"
                                      />
                                      <p className="text-xs text-gray-500">
                                        Use admin password "Razinshk@123" if you forgot your project password
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="newPassword" className="text-sm font-medium">
                                        New Password
                                      </Label>
                                      <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPasswordInput}
                                        onChange={(e) => setNewPasswordInput(e.target.value)}
                                        placeholder="Enter new password"
                                        className="text-center"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm New Password
                                      </Label>
                                      <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPasswordInput}
                                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="text-center"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Notice about reporting issues */}
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                      <div className="text-sm">
                                        <p className="font-medium text-amber-800 mb-1">Need Help?</p>
                                        <p className="text-amber-700 mb-2">
                                          If you forgot your password or need assistance, you can report the issue.
                                        </p>
                                        <Button
                                          onClick={() => {
                                            setChangePasswordProjectId(null);
                                            setShowReportIssue(true);
                                          }}
                                          variant="outline"
                                          size="sm"
                                          className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs"
                                        >
                                          <HelpCircle className="h-3 w-3 mr-1" />
                                          Report Issue
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                      onClick={() => handleChangePassword(project.id)}
                                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white order-2 sm:order-1"
                                      size="lg"
                                    >
                                      <Key className="h-4 w-4 mr-2" />
                                      Change Password
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        setChangePasswordProjectId(null);
                                        setChangePasswordInput('');
                                        setNewPasswordInput('');
                                        setConfirmPasswordInput('');
                                      }}
                                      variant="outline"
                                      className="flex-1 order-1 sm:order-2"
                                      size="lg"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog open={deleteProjectId === project.id} onOpenChange={(open) => {
                              if (!open) {
                                setDeleteProjectId(null);
                                setDeletePasswordInput('');
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  onClick={() => setDeleteProjectId(project.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-4"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-lg sm:text-xl font-bold text-red-800">
                                    Delete Project: {project.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 sm:space-y-6">
                                  <div className="text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                      <Trash2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600">
                                      <p className="font-semibold text-red-600 mb-2">⚠️ Warning: This action cannot be undone!</p>
                                      <p>All data associated with this project will be permanently deleted.</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="deletePassword" className="text-sm font-medium">
                                      Enter Project Password to Confirm Deletion
                                    </Label>
                                    <Input
                                      id="deletePassword"
                                      type="password"
                                      value={deletePasswordInput}
                                      onChange={(e) => setDeletePasswordInput(e.target.value)}
                                      placeholder="Enter project password"
                                      className="text-center"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleDeleteProject(project.id);
                                        }
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                      onClick={() => handleDeleteProject(project.id)}
                                      variant="destructive"
                                      className="flex-1 order-2 sm:order-1"
                                      size="lg"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Project
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        setDeleteProjectId(null);
                                        setDeletePasswordInput('');
                                      }}
                                      variant="outline"
                                      className="flex-1 order-1 sm:order-2"
                                      size="lg"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <p className="text-gray-600 text-base sm:text-lg mb-2">No projects found</p>
                <p className="text-gray-500 text-sm px-4 sm:px-0">Create your first project to get started with data collection</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg mb-2">No projects found</p>
              <p className="text-gray-500 text-sm px-4 sm:px-0">Create your first project to get started with data collection</p>
            </div>
          )}

          {/* Create New Project Section */}
          <div className="border-t pt-4 sm:pt-6">
            {!showNewProject ? (
              <div className="text-center">
                <Button 
                  onClick={() => setShowNewProject(true)} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  size="lg"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Project
                </Button>
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-green-800 flex items-center gap-2 text-lg sm:text-xl">
                    <Sparkles className="h-5 w-5" />
                    Create New Project
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">
                      Project Name *
                    </Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter a descriptive project name"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="projectDescription"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Describe the purpose and scope of this project"
                      rows={3}
                      className="border-green-200 focus:border-green-400 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectPassword" className="text-sm font-medium text-gray-700">
                      Project Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="projectPassword"
                        type={showPassword ? "text" : "password"}
                        value={newProjectPassword}
                        onChange={(e) => setNewProjectPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="pr-12 border-green-200 focus:border-green-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      This password will be required to access the project
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 sm:pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowNewProject(false);
                        setNewProjectName('');
                        setNewProjectDescription('');
                        setNewProjectPassword('');
                      }}
                      size="lg"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateProject} 
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      size="lg"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Report Issue Form */}
      <ReportIssueForm 
        isOpen={showReportIssue}
        onClose={() => setShowReportIssue(false)}
        defaultIssueType="password"
      />
    </div>
  );
};

export default ProjectSelector;
