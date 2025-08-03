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
        className="flex h-8 w-8 items-center justify-center border-0 p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={`Recent prompts (${history.length})`}
      >
        <Clock className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="text-sm font-medium text-foreground">
              Recent Prompts
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="h-auto p-1 text-xs text-destructive hover:text-destructive/80"
            >
              Clear All
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {history.map(item => (
              <div
                key={item.id}
                className="group flex items-start gap-3 border-b border-border p-3 last:border-b-0 hover:bg-muted/50"
              >
                <button
                  onClick={() => handleSelectPrompt(item)}
                  className="flex-1 text-left"
                >
                  <p
                    className="mb-1 overflow-hidden text-sm text-foreground"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
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
