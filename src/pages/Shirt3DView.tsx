import { Shirt3D } from "@/components/Shirt3D";
import { Button } from "@/components/ui/button";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ShirtData {
  prompt: string;
  imageUrl?: string;
  generatedAt?: string;
}

type TexturePlacement = "front" | "back" | "full-shirt";

export function Shirt3DView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shirtData, setShirtData] = useState<ShirtData | null>(null);
  const [texturePlacement, setTexturePlacement] =
    useState<TexturePlacement>("front");

  useEffect(() => {
    // Check if data was passed via router state
    if (location.state) {
      setShirtData(location.state as ShirtData);
    } else {
      // Fallback to localStorage for backward compatibility
      const stored = localStorage.getItem("shirtGenData");
      if (stored) {
        setShirtData(JSON.parse(stored));
      }
    }
  }, [location.state]);

  if (!shirtData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            No Design Found
          </h2>
          <p className="text-gray-500 mb-8">
            Create your first shirt design to see it here.
          </p>
          <Button 
            onClick={() => navigate("/")} 
            className="bg-black text-white hover:bg-gray-800 px-8 py-3"
          >
            Create Design
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-light text-gray-900">InstaShirt</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* 3D Scene - Takes most of the screen */}
        <div className="flex-1 bg-gray-50 w-full h-full">
          <Canvas className="w-full h-full">
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={8}
          />
          <Environment preset="studio" />
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 3]} intensity={0.4} />
          <Suspense fallback={null}>
            {shirtData.imageUrl && (
              <Shirt3D
                imageUrl={shirtData.imageUrl}
                texturePlacement={texturePlacement}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Texture Placement */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <Button
                variant={texturePlacement === "front" ? "default" : "outline"}
                size="sm"
                onClick={() => setTexturePlacement("front")}
                className="px-4 py-2"
              >
                Front
              </Button>
              <Button
                variant={texturePlacement === "back" ? "default" : "outline"}
                size="sm"
                onClick={() => setTexturePlacement("back")}
                className="px-4 py-2"
              >
                Back
              </Button>
              <Button
                variant={texturePlacement === "full-shirt" ? "default" : "outline"}
                size="sm"
                onClick={() => setTexturePlacement("full-shirt")}
                className="px-4 py-2"
              >
                Full Shirt
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!shirtData.imageUrl}
              onClick={() => {
                if (shirtData.imageUrl) {
                  const link = document.createElement("a");
                  link.href = shirtData.imageUrl;
                  link.download = `shirt_design_${Date.now()}.png`;
                  link.click();
                }
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!shirtData.imageUrl}
              onClick={() => {
                if (shirtData.imageUrl && navigator.share) {
                  navigator.share({
                    title: "InstaShirt Design",
                    text: "Check out this AI-generated shirt design!",
                    url: window.location.href,
                  });
                } else if (shirtData.imageUrl) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Design URL copied to clipboard!");
                }
              }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/")}
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
