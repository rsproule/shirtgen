import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Move, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ImagePositionControlsProps {
  onPositionChange: (position: { x: number; y: number }) => void;
  onReset: () => void;
  currentPosition: { x: number; y: number };
  disabled?: boolean;
}

export function ImagePositionControls({
  onPositionChange,
  onReset,
  currentPosition,
  disabled = false,
}: ImagePositionControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.x * 100,
      y: e.clientY - currentPosition.y * 100,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;

    const newX = (e.clientX - dragStart.x) / 100;
    const newY = (e.clientY - dragStart.y) / 100;

    // Clamp values to reasonable bounds (-1 to 1)
    const clampedX = Math.max(-1, Math.min(1, newX));
    const clampedY = Math.max(-1, Math.min(1, newY));

    onPositionChange({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, currentPosition, disabled]);

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-foreground">Position</Label>
        
        <div
          ref={containerRef}
          className={`relative h-8 w-24 cursor-move rounded border border-dashed bg-muted/30 transition-all duration-200 ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50'
          }`}
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Design indicator dot */}
          <div
            className="absolute h-2 w-2 rounded-full bg-primary shadow-sm ring-1 ring-background transition-all duration-200"
            style={{
              left: `${((currentPosition.x + 1) / 2) * 100}%`,
              top: `${((currentPosition.y + 1) / 2) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          
          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 h-full w-px bg-muted-foreground/20" />
          <div className="absolute left-1/2 top-1/2 h-px w-full bg-muted-foreground/20" />
        </div>

        <div className="flex items-center gap-1">
          <div className="text-xs text-muted-foreground min-w-[4rem] text-center">
            X: {currentPosition.x.toFixed(1)} Y: {currentPosition.y.toFixed(1)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-6 w-6 p-0 text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
} 