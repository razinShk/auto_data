import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AutoCompleteManager, AutoCompleteSuggestions } from '@/utils/autoCompleteManager';

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  field: keyof AutoCompleteSuggestions;
  projectId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'input' | 'textarea';
  rows?: number;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChange,
  onBlur,
  field,
  projectId,
  placeholder,
  className,
  disabled = false,
  type = 'input',
  rows = 3
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      const matches = AutoCompleteManager.searchSuggestions(field, value, projectId);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0 && document.activeElement === inputRef.current);
    } else {
      // Show recent suggestions when input is empty and focused
      const recent = AutoCompleteManager.getSuggestions(projectId)[field].slice(0, 10);
      setSuggestions(recent);
      setShowSuggestions(recent.length > 0 && document.activeElement === inputRef.current);
    }
    setSelectedIndex(-1);
  }, [value, field, projectId]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Save suggestion when user types something meaningful
    if (newValue.trim().length > 2) {
      AutoCompleteManager.addSuggestion(field, newValue, projectId);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    AutoCompleteManager.addSuggestion(field, suggestion, projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    // Always show suggestions when focused, whether empty or not
    if (value.length === 0) {
      const allSuggestions = AutoCompleteManager.getSuggestions(projectId);
      const recent = allSuggestions[field].slice(0, 10);
      setSuggestions(recent);
      setShowSuggestions(recent.length > 0); // Show only if we have suggestions
    } else {
      const matches = AutoCompleteManager.searchSuggestions(field, value, projectId);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0); // Show only if we have matches
    }
  };

  const handleClick = () => {
    // Same as focus - show suggestions when clicked
    handleFocus();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Small delay to allow suggestion clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onBlur?.();
    }, 150);
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onClick={handleClick}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {value.length === 0 && suggestions.length > 0 && (
            <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-b">
              Recent entries
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              ref={(el) => suggestionRefs.current[index] = el}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0",
                "hover:bg-blue-50 transition-colors",
                selectedIndex === index && "bg-blue-100 text-blue-800"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="truncate" title={suggestion}>
                {suggestion}
              </div>
              {suggestion.length > 50 && (
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.substring(0, 50)}...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 