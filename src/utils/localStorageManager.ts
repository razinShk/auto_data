export interface LocalRowData {
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
  lastModified: string;
  projectId?: string;
}

const LOCAL_STORAGE_KEY = 'excel_observer_entries';
const LOCAL_STORAGE_PROJECT_KEY = 'excel_observer_current_project';

export class LocalStorageManager {
  static saveEntries(entries: LocalRowData[], projectId?: string): void {
    try {
      const storageData = {
        entries,
        projectId,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  static loadEntries(projectId?: string): LocalRowData[] {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedData) return [];

      const parsed = JSON.parse(storedData);
      
      // If we have a specific project, filter entries for that project
      if (projectId && parsed.projectId === projectId) {
        return parsed.entries || [];
      } else if (!projectId) {
        // Return all entries if no project specified
        return parsed.entries || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return [];
    }
  }

  static addEntry(entry: LocalRowData, projectId?: string): void {
    const existingEntries = this.loadEntries(projectId);
    const updatedEntries = [...existingEntries.filter(e => e.id !== entry.id), entry];
    this.saveEntries(updatedEntries, projectId);
  }

  static updateEntry(entryId: string, updates: Partial<LocalRowData>, projectId?: string): void {
    const existingEntries = this.loadEntries(projectId);
    const updatedEntries = existingEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, ...updates, lastModified: new Date().toISOString() }
        : entry
    );
    this.saveEntries(updatedEntries, projectId);
  }

  static removeEntry(entryId: string, projectId?: string): void {
    const existingEntries = this.loadEntries(projectId);
    const updatedEntries = existingEntries.filter(entry => entry.id !== entryId);
    this.saveEntries(updatedEntries, projectId);
  }

  static clearEntries(projectId?: string): void {
    if (projectId) {
      this.saveEntries([], projectId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  static hasUnsyncedEntries(projectId?: string): boolean {
    const entries = this.loadEntries(projectId);
    return entries.length > 0;
  }

  static getUnsyncedCount(projectId?: string): number {
    const entries = this.loadEntries(projectId);
    return entries.length;
  }

  static setCurrentProject(projectId: string): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, projectId);
    } catch (error) {
      console.error('Error saving current project to local storage:', error);
    }
  }

  static getCurrentProject(): string | null {
    try {
      return localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY);
    } catch (error) {
      console.error('Error loading current project from local storage:', error);
      return null;
    }
  }
} 