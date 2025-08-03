import { useState } from "react";

interface PromptSuggestion {
  id: string;
  text: string;
  category: string;
}

interface PromptSuggestionsProps {
  suggestions: PromptSuggestion[];
  onSelectSuggestion: (suggestion: string) => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export function PromptSuggestions({
  suggestions,
  onSelectSuggestion,
  onDismiss,
  isLoading = false
}: PromptSuggestionsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    setSelectedId(suggestion.id);
    onSelectSuggestion(suggestion.text);
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 text-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <span className="text-sm">Generating suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Suggestions</span>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left p-2 rounded transition-colors duration-150 ${
                selectedId === suggestion.id 
                  ? "bg-blue-50 text-blue-900" 
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight line-clamp-2">
                    {suggestion.text}
                  </p>
                </div>
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                  {suggestion.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 