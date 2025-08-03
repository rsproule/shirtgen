import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Check, Edit3, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShirtData } from "@/context/ShirtDataContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Header } from "@/components/layout/Header";
import { Scene3D } from "@/components/3d/Scene3D";
import { PlacementControls } from "@/components/3d/PlacementControls";
import { ShirtColorPicker } from "@/components/3d/ShirtColorPicker";
import { Shirt3D } from "@/components/Shirt3D";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";
import { PublishButton } from "@/components/ui/PublishButton";
import type { ShirtData } from "@/types";
import { generateDataUrlHash } from "@/services/imageHash";
import { useShirtHistory } from "@/hooks/useShirtHistory";

export function ViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const {
    shirtData,
    setShirtData,
    texturePlacement,
    setTexturePlacement,
    setIsLoading,
  } = useShirtData();
  const { autoSaveStatus, lastSavedAt } = useAutoSave();
  const { updateExternalIds, getByHash, getLastViewed, setLastViewed, history, isLoading: isHistoryLoading } = useShirtHistory();

  useEffect(() => {
    const loadShirtData = async () => {
      // Only reset loading when component mounts if we don't have partial data
      if (!shirtData || !shirtData.isPartial) {
        setIsLoading(false);
      }

      // Check if data was passed via router state (highest priority)
      if (location.state && !shirtData) {
        const stateData = location.state as ShirtData;
        setShirtData(stateData);
        // Track this as last viewed if it has an imageUrl
        if (stateData.imageUrl) {
          try {
            const hash = await generateDataUrlHash(stateData.imageUrl);
            await setLastViewed(hash);
          } catch (error) {
            console.warn("Failed to track last viewed:", error);
          }
        }
        return;
      }

      // If no shirt data, try to load last viewed
      if (!shirtData) {
        try {
          const lastViewed = await getLastViewed();
          if (lastViewed) {
            const shirtDataFromHistory: ShirtData = {
              prompt: lastViewed.originalPrompt,
              imageUrl: lastViewed.imageUrl,
              generatedAt: lastViewed.createdAt,
              isPartial: false,
            };
            setShirtData(shirtDataFromHistory);
            return;
          }
        } catch (error) {
          console.warn("Failed to load last viewed:", error);
        }

        // Final fallback to localStorage for backward compatibility
        const stored = localStorage.getItem("shirtGenData");
        if (stored) {
          setShirtData(JSON.parse(stored));
        }
      }
    };

    loadShirtData();
  }, [location.state, shirtData, setShirtData, setIsLoading, getLastViewed, setLastViewed]);

  // Load title from database when shirtData changes (but not when editing)
  useEffect(() => {
    const loadTitle = async () => {
      // Don't overwrite title if user is currently editing
      if (isEditingTitle) return;

      if (shirtData?.imageUrl) {
        try {
          const imageHash = await generateDataUrlHash(shirtData.imageUrl);
          const record = await getByHash(imageHash);
          if (record?.generatedTitle) {
            setTitle(record.generatedTitle);
          } else {
            // Fallback to a truncated prompt if no generated title yet
            setTitle(shirtData.prompt?.substring(0, 30) || "Untitled Design");
          }
        } catch (error) {
          console.warn("Failed to load title:", error);
          setTitle(shirtData.prompt?.substring(0, 30) || "Untitled Design");
        }
      }
    };

    loadTitle();
  }, [shirtData?.imageUrl, shirtData?.prompt, getByHash, isEditingTitle]);

  if (!shirtData) {
    // Show loading while history is still loading
    if (isHistoryLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      );
    }
    
    // Only show empty state if no shirts exist in history at all
    if (history.length === 0) {
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
    
    // If we have history but no shirt data loaded yet, show loading
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500">Loading your last design...</p>
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

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(shirtData.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  const handleSaveTitle = async () => {
    if (!shirtData?.imageUrl) return;

    setIsSavingTitle(true);
    try {
      const imageHash = await generateDataUrlHash(shirtData.imageUrl);
      await updateExternalIds(imageHash, {
        generatedTitle: title.trim() || "Untitled Design",
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to save title:", error);
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelEdit = async () => {
    // Reload title from database
    if (shirtData?.imageUrl) {
      try {
        const imageHash = await generateDataUrlHash(shirtData.imageUrl);
        const record = await getByHash(imageHash);
        if (record?.generatedTitle) {
          setTitle(record.generatedTitle);
        }
      } catch (error) {
        console.warn("Failed to reload title:", error);
      }
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
        {/* Header with Navigation and Publish button */}
        <div className="relative">
          <Header showBackButton />

          {/* Publish button - Top right, aligned with header */}
          <div className="absolute top-3 right-6">
            <PublishButton />
          </div>
        </div>

        {/* Separate Title Section */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-white px-2 py-1">
          <div className="text-center">
            {isEditingTitle ? (
              <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-2">
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handleSaveTitle();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  className="h-auto min-w-0 flex-1 border-none bg-transparent px-2 py-1 text-left text-sm font-semibold text-gray-900 shadow-none focus-visible:ring-0"
                  maxLength={30}
                  placeholder="Enter design title..."
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-gray-100"
                  title="Save"
                >
                  {isSavingTitle ? (
                    <Save className="h-3 w-3 animate-pulse" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingTitle}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-gray-100"
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-all hover:bg-gray-50"
                title="Click to edit title"
              >
                <h1 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                  {title || "Untitled Design"}
                </h1>
                <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

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
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-2 sm:p-4">
          <div className="mx-auto max-w-4xl">
            {/* User Prompt Display */}
            {shirtData.prompt && (
              <div className="mb-2 text-center sm:mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopyPrompt}
                        className="group max-w-full cursor-pointer rounded-lg px-3 py-1 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <p className="max-w-md truncate text-sm text-gray-500 italic group-hover:text-gray-700">
                            "{shirtData.prompt}"
                          </p>
                          {copied && (
                            <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">"{shirtData.prompt}"</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Click to copy
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {shirtData.isPartial && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs text-gray-600">
                      Generating your design...
                    </div>
                    <div className="mx-auto h-2 w-48 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-300 transition-all duration-500 ease-out"
                        style={{
                          width: `${((shirtData.partialIndex !== undefined ? shirtData.partialIndex + 1 : 1) / 3) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {shirtData.partialIndex !== undefined
                        ? shirtData.partialIndex + 1
                        : 1}{" "}
                      of 3
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Controls - Responsive Layout */}
            <div className="mb-1 flex flex-col items-center gap-1 sm:flex-row sm:justify-between sm:gap-3">
              {/* Shirt Color Selection */}
              <div>
                <ShirtColorPicker />
              </div>

              {/* Texture Placement */}
              <div>
                <PlacementControls
                  placement={texturePlacement}
                  onPlacementChange={setTexturePlacement}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save indicator - Bottom right of entire page */}
      <div className="fixed right-4 bottom-4 z-50">
        <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
      </div>
    </div>
  );
}
