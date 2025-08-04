import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import {
  usePromptHistory,
  type PromptHistoryItem,
} from "@/hooks/usePromptHistory";

interface PromptHistoryProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptHistory({ onSelectPrompt }: PromptHistoryProps) {
  const { history, clearHistory, removeFromHistory } = usePromptHistory();
  const [isOpen, setIsOpen] = useState(false);
  
  const hasHistory = history.length > 0;

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
        onClick={() => hasHistory && setIsOpen(!isOpen)}
        disabled={!hasHistory}
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center border-0 p-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={hasHistory ? `Recent prompts (${history.length})` : "No recent prompts"}
      >
        <Clock className="h-4 w-4" />
      </Button>

      {isOpen && hasHistory && (
        <div className="border-border bg-background absolute top-full right-0 z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-lg border shadow-lg">
          <div className="border-border flex items-center justify-between border-b p-3">
            <h3 className="text-foreground text-sm font-medium">
              Recent Prompts
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive/80 h-auto p-1 text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {history.map(item => (
              <div
                key={item.id}
                className="group border-border hover:bg-muted/50 flex items-start gap-3 border-b p-3 last:border-b-0"
              >
                <button
                  onClick={() => handleSelectPrompt(item)}
                  className="flex-1 text-left"
                >
                  <p
                    className="text-foreground mb-1 overflow-hidden text-sm"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.text}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="hover:bg-muted rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
