import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShirtData } from "@/context/ShirtDataContext";
import { Header } from "@/components/layout/Header";
import { Scene3D } from "@/components/3d/Scene3D";
import { PlacementControls } from "@/components/3d/PlacementControls";
import { ShirtColorPicker } from "@/components/3d/ShirtColorPicker";
import { Shirt3D } from "@/components/Shirt3D";
import type { ShirtData } from "@/types";

export function ViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    shirtData,
    setShirtData,
    texturePlacement,
    setTexturePlacement,
    setIsLoading,
  } = useShirtData();

  useEffect(() => {
    // Only reset loading when component mounts if we don't have partial data
    // Let the image generation hook control loading state for partial images
    if (!shirtData || !shirtData.isPartial) {
      setIsLoading(false);
    }

    // Check if data was passed via router state (fallback for direct navigation)
    if (location.state && !shirtData) {
      setShirtData(location.state as ShirtData);
    } else if (!shirtData) {
      // Fallback to localStorage for backward compatibility
      const stored = localStorage.getItem("shirtGenData");
      if (stored) {
        setShirtData(JSON.parse(stored));
      }
    }
  }, [location.state, shirtData, setShirtData, setIsLoading]);

  if (!shirtData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-light text-gray-900">
            No Design Found
          </h2>
          <p className="mb-8 text-gray-500">
            Create your first shirt design to see it here.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-black px-8 py-3 text-white hover:bg-gray-800"
          >
            Create Design
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (shirtData.imageUrl) {
      const link = document.createElement("a");
      link.href = shirtData.imageUrl;
      link.download = `shirt_design_${Date.now()}.png`;
      link.click();
    }
  };

  const handleNewDesign = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
        {/* Header */}
        <Header showBackButton />

        {/* 3D Scene - Takes remaining space */}
        <div className="min-h-0 flex-1">
          <Scene3D>
            {shirtData.imageUrl && (
              <Shirt3D
                imageUrl={shirtData.imageUrl}
                texturePlacement={texturePlacement}
              />
            )}
          </Scene3D>
        </div>

        {/* Bottom Controls */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="mx-auto max-w-4xl">
            {/* User Prompt Display */}
            {shirtData.prompt && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500 italic">
                  "{shirtData.prompt}"
                </p>
                {shirtData.isPartial && (
                  <p className="mt-1 animate-pulse text-xs text-blue-500">
                    Generating... (
                    {shirtData.partialIndex !== undefined
                      ? shirtData.partialIndex + 1
                      : 1}
                    /3)
                  </p>
                )}
              </div>
            )}

            {/* Simplified Controls Row */}
            <div className="mb-4 flex items-center justify-between">
              {/* Shirt Color Selection */}
              <div className="flex-shrink-0">
                <ShirtColorPicker />
              </div>

              {/* Texture Placement */}
              <div className="flex-shrink-0">
                <PlacementControls
                  placement={texturePlacement}
                  onPlacementChange={setTexturePlacement}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                disabled={!shirtData.imageUrl}
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                size="sm"
                onClick={handleNewDesign}
                className="bg-black text-white hover:bg-gray-800"
              >
                New Design
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
