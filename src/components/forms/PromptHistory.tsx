import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { usePromptHistory, type PromptHistoryItem } from "@/hooks/usePromptHistory";

interface PromptHistoryProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptHistory({ onSelectPrompt }: PromptHistoryProps) {
  const { history, clearHistory, removeFromHistory } = usePromptHistory();
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  const handleSelectPrompt = (item: PromptHistoryItem) => {
    onSelectPrompt(item.text);
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0 transition-colors"
        title={`Recent prompts (${history.length})`}
      >
        <Clock className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Recent Prompts</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-700 h-auto p-1"
            >
              Clear All
            </Button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
              >
                <button
                  onClick={() => handleSelectPrompt(item)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm text-gray-900 mb-1 overflow-hidden" style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical' 
                  }}>
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}