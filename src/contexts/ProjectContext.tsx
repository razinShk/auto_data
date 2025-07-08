import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  loadProjects: () => Promise<void>;
  createProject: (name: string, description: string, password: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  verifyProjectPassword: (projectId: string, password: string) => Promise<boolean>;
  changeProjectPassword: (projectId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load current project from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && !currentProject) {
      // Load the project details from the database
      loadSavedProject(savedProjectId);
    }
  }, []);

  const loadSavedProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at')
        .eq('id', projectId)
        .single();

      if (error) {
        // If project doesn't exist, clear from localStorage
        localStorage.removeItem('currentProjectId');
        return;
      }

      setCurrentProject(data);
    } catch (error) {
      console.error('Error loading saved project:', error);
      localStorage.removeItem('currentProjectId');
    }
  };

  const setCurrentProjectWithPersistence = (project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, description: string, password: string) => {
    setIsLoading(true);
    try {
      // Hash the password (simple implementation - in production use proper hashing)
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name,
          description,
          password_hash: passwordHash
        }])
        .select('id, name, description, created_at, updated_at')
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      setCurrentProjectWithPersistence(data);
      
      toast({
        title: "Success",
        description: "Project created successfully"
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
      if (currentProject?.id === id) {
        setCurrentProjectWithPersistence(null);
      }
      
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyProjectPassword = async (projectId: string, password: string): Promise<boolean> => {
    try {
      // Check universal password first
      const universalPassword = "Razinshk@123";
      if (password === universalPassword) {
        return true;
      }

      // Check project-specific password
      const { data, error } = await supabase
        .from('projects')
        .select('password_hash')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      const passwordHash = btoa(password);
      return data.password_hash === passwordHash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const changeProjectPassword = async (projectId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // Verify the current password
      const isPasswordValid = await verifyProjectPassword(projectId, currentPassword);
      if (!isPasswordValid) {
        console.error('Current password is invalid');
        return false;
      }

      // Hash the new password
      const newPasswordHash = btoa(newPassword);

      // Update the project password
      const { data, error } = await supabase
        .from('projects')
        .update({
          password_hash: newPasswordHash
        })
        .eq('id', projectId)
        .select('id, name, description, created_at, updated_at')
        .single();

      if (error) throw error;
      
      setCurrentProjectWithPersistence(data);
      
      toast({
        title: "Success",
        description: "Project password changed successfully"
      });
      return true;
    } catch (error) {
      console.error('Error changing project password:', error);
      toast({
        title: "Error",
        description: "Failed to change project password",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      setCurrentProject: setCurrentProjectWithPersistence,
      loadProjects,
      createProject,
      deleteProject,
      verifyProjectPassword,
      changeProjectPassword,
      isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
