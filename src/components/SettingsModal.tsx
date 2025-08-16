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
  const [vibrance, setVibrance] = useState(0);
  const [tint, setTint] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
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
      
      // Apply flip horizontal if needed
      if (flipHorizontal) {
        ctx!.scale(-1, 1);
        ctx!.drawImage(img, -img.width, 0);
      } else {
        ctx!.drawImage(img, 0, 0);
      }
      
      // Apply vibrance (increase saturation of muted colors)
      if (vibrance !== 0) {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          
          // Apply vibrance to muted colors
          if (saturation < 0.5) {
            const factor = 1 + (vibrance / 100);
            data[i] = Math.min(255, r * factor);
            data[i + 1] = Math.min(255, g * factor);
            data[i + 2] = Math.min(255, b * factor);
          }
        }
        
        ctx!.putImageData(imageData, 0, 0);
      }
      
      // Apply tint
      if (tint !== 0) {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Apply warm/cool tint
          if (tint > 0) {
            // Warm tint (more red/yellow)
            data[i] = Math.min(255, data[i] + (tint * 0.5));
            data[i + 1] = Math.min(255, data[i + 1] + (tint * 0.3));
          } else {
            // Cool tint (more blue)
            data[i + 2] = Math.min(255, data[i + 2] + (Math.abs(tint) * 0.5));
          }
        }
        
        ctx!.putImageData(imageData, 0, 0);
      }
      
      // Apply vignette
      if (vignette !== 0) {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const vignetteFactor = 1 - (distance / maxDistance) * (vignette / 100);
            
            const i = (y * canvas.width + x) * 4;
            data[i] = Math.max(0, data[i] * vignetteFactor);
            data[i + 1] = Math.max(0, data[i + 1] * vignetteFactor);
            data[i + 2] = Math.max(0, data[i + 2] * vignetteFactor);
          }
        }
        
        ctx!.putImageData(imageData, 0, 0);
      }
      
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
    setVibrance(0);
    setTint(0);
    setVignette(0);
    setFlipHorizontal(false);
    
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
                      filter: `
                        brightness(${brightness}%) 
                        saturate(${saturation}%) 
                        grayscale(${grayscale}%)
                        ${vibrance !== 0 ? `contrast(${100 + vibrance * 0.5}%)` : ''}
                        ${tint !== 0 ? `sepia(${Math.abs(tint) * 0.3}%) hue-rotate(${tint > 0 ? '30deg' : '240deg'})` : ''}
                        ${vignette !== 0 ? `brightness(${100 - vignette * 0.3}%)` : ''}
                      `.replace(/\s+/g, ' ').trim(),
                      transform: flipHorizontal ? 'scaleX(-1)' : 'scaleX(1)'
                    }}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Image Adjustments</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="brightness" className="text-sm font-medium text-foreground">
                          Brightness
                        </Label>
                        <Input
                          id="brightness"
                          type="range"
                          min="0"
                          max="200"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>100%</span>
                          <span>200%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="saturation" className="text-sm font-medium text-foreground">
                          Saturation
                        </Label>
                        <Input
                          id="saturation"
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>100%</span>
                          <span>200%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="grayscale" className="text-sm font-medium text-foreground">
                          Grayscale
                        </Label>
                        <Input
                          id="grayscale"
                          type="range"
                          min="0"
                          max="100"
                          value={grayscale}
                          onChange={(e) => setGrayscale(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="vibrance" className="text-sm font-medium text-foreground">
                          Vibrance
                        </Label>
                        <Input
                          id="vibrance"
                          type="range"
                          min="-100"
                          max="100"
                          value={vibrance}
                          onChange={(e) => setVibrance(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>-100</span>
                          <span>0</span>
                          <span>100</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="tint" className="text-sm font-medium text-foreground">
                          Tint
                        </Label>
                        <Input
                          id="tint"
                          type="range"
                          min="-100"
                          max="100"
                          value={tint}
                          onChange={(e) => setTint(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Cool</span>
                          <span>Neutral</span>
                          <span>Warm</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="vignette" className="text-sm font-medium text-foreground">
                          Vignette
                        </Label>
                        <Input
                          id="vignette"
                          type="range"
                          min="0"
                          max="100"
                          value={vignette}
                          onChange={(e) => setVignette(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                          <span>50%</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flip Horizontal - Full Width Below */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground">
                        Flip Horizontal
                      </Label>
                      <Button
                        variant={flipHorizontal ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                        className="w-20"
                      >
                        {flipHorizontal ? "ON" : "OFF"}
                      </Button>
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
