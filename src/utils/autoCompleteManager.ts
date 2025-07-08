export interface AutoCompleteSuggestions {
  partName: string[];
  observation: string[];
  actionPlan: string[];
  responsibility: string[];
  remarks: string[];
  opNumber: string[];
}

const AUTO_COMPLETE_STORAGE_KEY = 'excel_observer_autocomplete';

export class AutoCompleteManager {
  // Store database entries for suggestions
  private static databaseEntries: { [projectId: string]: any[] } = {};
  private static currentProjectId: string | null = null;

  static setCurrentProject(projectId: string | null): void {
    this.currentProjectId = projectId;
  }

  static setDatabaseEntries(entries: any[], projectId?: string): void {
    const key = projectId || this.currentProjectId || 'global';
    this.databaseEntries[key] = entries;
  }

  static getSuggestions(projectId?: string): AutoCompleteSuggestions {
    const key = projectId || this.currentProjectId || 'global';
    const entries = this.databaseEntries[key] || [];
    
    // Extract unique values from database entries
    const suggestions: AutoCompleteSuggestions = {
      partName: [],
      observation: [],
      actionPlan: [],
      responsibility: [],
      remarks: [],
      opNumber: []
    };

    entries.forEach(entry => {
      // Add to suggestions if not already present (case-insensitive)
      if (entry.partName && entry.partName.trim()) {
        const value = entry.partName.trim();
        if (!suggestions.partName.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.partName.push(value);
        }
      }
      
      if (entry.observation && entry.observation.trim()) {
        const value = entry.observation.trim();
        if (!suggestions.observation.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.observation.push(value);
        }
      }
      
      if (entry.actionPlan && entry.actionPlan.trim()) {
        const value = entry.actionPlan.trim();
        if (!suggestions.actionPlan.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.actionPlan.push(value);
        }
      }
      
      if (entry.responsibility && entry.responsibility.trim()) {
        const value = entry.responsibility.trim();
        if (!suggestions.responsibility.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.responsibility.push(value);
        }
      }
      
      if (entry.remarks && entry.remarks.trim()) {
        const value = entry.remarks.trim();
        if (!suggestions.remarks.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.remarks.push(value);
        }
      }
      
      if (entry.opNumber && entry.opNumber.trim()) {
        const value = entry.opNumber.trim();
        if (!suggestions.opNumber.some(item => item.toLowerCase() === value.toLowerCase())) {
          suggestions.opNumber.push(value);
        }
      }
    });

    // Sort suggestions by frequency (most used first) and alphabetically
    Object.keys(suggestions).forEach(key => {
      const field = key as keyof AutoCompleteSuggestions;
      suggestions[field] = suggestions[field].sort((a, b) => {
        // Count frequency in entries
        const countA = entries.filter(entry => {
          const fieldValue = entry[field === 'partName' ? 'partName' : 
                                   field === 'opNumber' ? 'opNumber' :
                                   field === 'actionPlan' ? 'actionPlan' :
                                   field === 'responsibility' ? 'responsibility' :
                                   field === 'remarks' ? 'remarks' : 'observation'];
          return fieldValue && fieldValue.toLowerCase() === a.toLowerCase();
        }).length;
        
        const countB = entries.filter(entry => {
          const fieldValue = entry[field === 'partName' ? 'partName' : 
                                   field === 'opNumber' ? 'opNumber' :
                                   field === 'actionPlan' ? 'actionPlan' :
                                   field === 'responsibility' ? 'responsibility' :
                                   field === 'remarks' ? 'remarks' : 'observation'];
          return fieldValue && fieldValue.toLowerCase() === b.toLowerCase();
        }).length;
        
        if (countA !== countB) return countB - countA; // Most frequent first
        return a.localeCompare(b); // Alphabetical for same frequency
      });
    });

    return suggestions;
  }

  static addSuggestion(field: keyof AutoCompleteSuggestions, value: string, projectId?: string): void {
    // This method is no longer needed since we get suggestions directly from database entries
    // But we keep it for compatibility - it does nothing now
    return;
  }

  static searchSuggestions(field: keyof AutoCompleteSuggestions, query: string, projectId?: string): string[] {
    const suggestions = this.getSuggestions(projectId);
    const fieldSuggestions = suggestions[field] || [];
    
    if (!query.trim()) {
      return fieldSuggestions.slice(0, 10); // Return first 10 if no query
    }

    const lowercaseQuery = query.toLowerCase();
    const matches = fieldSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(lowercaseQuery)
    );

    // Sort by relevance: exact match first, then starts with, then contains
    return matches.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower === lowercaseQuery) return -1;
      if (bLower === lowercaseQuery) return 1;
      if (aLower.startsWith(lowercaseQuery) && !bLower.startsWith(lowercaseQuery)) return -1;
      if (bLower.startsWith(lowercaseQuery) && !aLower.startsWith(lowercaseQuery)) return 1;
      
      return a.localeCompare(b);
    }).slice(0, 10); // Limit to 10 suggestions
  }

  static initializeFromExistingData(entries: any[], projectId?: string): void {
    // Store the entries directly for suggestions
    this.setDatabaseEntries(entries, projectId);
  }

  static clearSuggestions(projectId?: string): void {
    const key = projectId || 'global';
    this.databaseEntries[key] = [];
  }
} 