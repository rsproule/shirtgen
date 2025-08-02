import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import {
  useShirtHistory,
  type ShirtHistoryItem,
} from "@/hooks/useShirtHistory";
import { useNavigate } from "react-router-dom";
import { useShirtData } from "@/context/ShirtDataContext";

export function ShirtHistory() {
  const { history, clearHistory, removeFromHistory } = useShirtHistory();
  const { setShirtData } = useShirtData();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (history.length === 0) {
    return (
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-6 text-lg font-medium text-gray-900">
          Recent Designs
        </h2>
        <p className="py-8 text-center text-gray-500">
          No designs yet. Generate your first shirt to see it here!
        </p>
      </div>
    );
  }

  const displayHistory = showAll ? history : history.slice(0, 6);

  const handleViewShirt = (item: ShirtHistoryItem) => {
    const shirtData = {
      prompt: item.prompt,
      imageUrl: item.imageUrl,
      generatedAt: item.generatedAt,
      isPartial: false,
      partialIndex: -1,
    };

    setShirtData(shirtData);
    navigate("/view");
  };

  const formatTimestamp = (timestamp: number) => {
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
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Recent Designs</h2>
        <div className="flex items-center gap-3">
          {history.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showAll ? "Show Less" : `Show All ${history.length}`}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-red-500 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {displayHistory.map((item: ShirtHistoryItem) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-gray-300"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <img
                src={item.imageUrl}
                alt={item.prompt}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              {/* Overlay with actions */}
              <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center gap-2 bg-black transition-opacity">
                <Button
                  size="sm"
                  onClick={() => handleViewShirt(item)}
                  className="h-8 w-8 bg-white p-0 text-black opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                  title="View shirt"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="h-8 w-8 bg-red-500 p-0 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p
                className="mb-1 overflow-hidden text-xs text-gray-600"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.prompt}
              </p>
              <p className="text-xs text-gray-400">
                {formatTimestamp(item.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
