import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  className?: string;
  imageUrl?: string;
  onApply?: (editedImageUrl: string) => void;
}

export function SettingsModal({ className = '', imageUrl, onApply }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | undefined>();

  const handleApply = () => {
    if (!originalImageUrl || !onApply) return;
    
    // Create a canvas to apply the filters and get the edited image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply the filters using canvas
      ctx!.filter = `brightness(${brightness}%) saturate(${saturation}%) grayscale(${grayscale}%)`;
      ctx!.drawImage(img, 0, 0);
      
      // Convert canvas to data URL
      const editedImageUrl = canvas.toDataURL('image/png');
      
      // Pass the edited image back to parent
      onApply(editedImageUrl);
      
      // Close the modal
      setIsOpen(false);
    };
    
    img.src = originalImageUrl;
  };

  // Capture original image when modal opens
  useEffect(() => {
    if (isOpen && imageUrl && !originalImageUrl) {
      setOriginalImageUrl(imageUrl);
    }
  }, [isOpen, imageUrl, originalImageUrl]);

  const handleReset = () => {
    setBrightness(100);
    setSaturation(100);
    setGrayscale(0);
    
    // Apply the original image back to the shirt
    if (originalImageUrl && onApply) {
      onApply(originalImageUrl);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 border rounded hover:bg-muted transition-colors ${className}`}
              title="Edit Image"
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
            
            {imageUrl && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={originalImageUrl || imageUrl}
                    alt="User's image"
                    className="max-w-full max-h-64 rounded-lg border border-border object-contain"
                    style={{
                      filter: `brightness(${brightness}%) saturate(${saturation}%) grayscale(${grayscale}%)`
                    }}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Image Adjustments</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="brightness" className="text-xs text-muted-foreground">
                        Brightness: {brightness}%
                      </Label>
                      <Input
                        id="brightness"
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="saturation" className="text-xs text-muted-foreground">
                        Saturation: {saturation}%
                      </Label>
                      <Input
                        id="saturation"
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grayscale" className="text-xs text-muted-foreground">
                        Grayscale: {grayscale}%
                      </Label>
                      <Input
                        id="grayscale"
                        type="range"
                        min="0"
                        max="100"
                        value={grayscale}
                        onChange={(e) => setGrayscale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleApply}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
