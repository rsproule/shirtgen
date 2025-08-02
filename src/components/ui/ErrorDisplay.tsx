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
  autoHideDelay = 5000 
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
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Generation Error
            </h3>
            <p className="text-sm text-red-700 break-words">
              {error}
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {onRetry && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-red-600 hover:text-red-800"
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