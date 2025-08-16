import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsModalProps {
  className?: string;
  imageUrl?: string;
}

export function SettingsModal({ className = '', imageUrl }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 border rounded hover:bg-muted transition-colors ${className}`}
            >
              <Settings className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm bg-background/80"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-background border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Edit Image</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt="User's image"
                    className="max-w-full max-h-64 rounded-lg border border-border object-contain"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="text-muted-foreground">Image editor coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
