import { Check, AlertCircle, Loader2 } from "lucide-react";
import type { AutoSaveStatus } from "@/types/design";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt?: string | null;
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  if (status === "idle") {
    return null; // No indicator when idle
  }

  const getStatusConfig = () => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Saving...",
          className: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "saved":
        return {
          icon: <Check className="h-3 w-3" />,
          text: "Saved",
          className: "text-green-600 bg-green-50 border-green-200",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Save failed",
          className: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all duration-200 ${config.className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
