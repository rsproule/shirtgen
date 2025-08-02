import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  autoHide = false,
  autoHideDelay = 5000,
}: ErrorDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(), 300); // Wait for fade out
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300); // Wait for fade out
  };

  if (!error) return null;

  return (
    <div
      className={`fixed top-4 right-4 left-4 z-50 transform transition-all duration-300 sm:top-4 sm:right-4 sm:left-auto ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-3 shadow-lg sm:w-auto sm:p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-sm font-medium text-red-800">
              Generation Error
            </h3>
            <p className="text-sm break-words text-red-700">{error}</p>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-400 transition-colors hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {onRetry && (
          <div className="mt-3 border-t border-red-200 pt-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="flex w-full items-center justify-center gap-1 border-red-300 text-red-700 hover:bg-red-100 sm:w-auto"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="w-full text-red-600 hover:text-red-800 sm:w-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
