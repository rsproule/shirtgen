import { PlacementControls } from "@/components/3d/PlacementControls";
import { Scene3D } from "@/components/3d/Scene3D";
import { ShirtColorPicker } from "@/components/3d/ShirtColorPicker";
import { Header } from "@/components/layout/Header";
import { SettingsModal } from "@/components/SettingsModal";
import { Shirt3D } from "@/components/Shirt3D";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublishButton } from "@/components/ui/PublishButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShirtData } from "@/context/ShirtDataContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { generateDataUrlHash } from "@/services/imageHash";
import { ImageProcessor } from "@/services/printify/ImageProcessor";
import type { ShirtData } from "@/types";
import { Check, Download, Edit3, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const {
    updateExternalIds,
    getByHash,
    getLastViewed,
    setLastViewed,
    history,
    isLoading: isHistoryLoading,
  } = useShirtHistory();

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
  }, [
    location.state,
    shirtData,
    setShirtData,
    setIsLoading,
    getLastViewed,
    setLastViewed,
  ]);

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

  // Prevent navigation/refresh during progressive generation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shirtData?.isPartial) {
        event.preventDefault();
        // Modern browsers require returnValue to be set
        event.returnValue =
          "Your design is still generating. Are you sure you want to leave?";
        return "Your design is still generating. Are you sure you want to leave?";
      }
    };

    if (shirtData?.isPartial) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shirtData?.isPartial]);

  if (!shirtData) {
    // Show loading while history is still loading
    if (isHistoryLoading) {
      return (
        <div className="bg-background flex min-h-svh items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Only show empty state if no shirts exist in history at all
    if (history.length === 0) {
      return (
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <h2 className="text-foreground mb-4 text-2xl font-light">
              No Design Found
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your first shirt design to see it here.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground hover:bg-primary/80 px-8 py-3"
            >
              Create Design
            </Button>
          </div>
        </div>
      );
    }

    // If we have history but no shirt data loaded yet, show loading
    return (
      <div className="bg-background flex min-h-svh items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your last design...</p>
        </div>
      </div>
    );
  }

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

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFullRes = () => {
    if (shirtData?.imageUrl) {
      downloadImage(shirtData.imageUrl, `shirt-design-full-${Date.now()}.png`);
    }
  };

  const handleDownloadCompressed = async () => {
    if (!shirtData?.imageUrl) return;

    try {
      // Convert data URL to blob
      const imageBlob = await ImageProcessor.fetchImageAsBlob(
        shirtData.imageUrl,
      );

      // Compress it
      const compressedBlob = await ImageProcessor.compressImage(
        imageBlob,
        0.75,
      );

      // Convert back to data URL
      const reader = new FileReader();
      reader.onload = () => {
        const compressedDataUrl = reader.result as string;
        downloadImage(
          compressedDataUrl,
          `shirt-design-compressed-${Date.now()}.png`,
        );
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      console.error("Failed to compress and download image:", error);
    }
  };

  return (
    <div className="bg-background flex h-svh flex-col">
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
        <div className="border-border bg-background flex-shrink-0 border-b px-2 py-1">
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
                  className="text-foreground h-auto min-w-0 flex-1 border-none bg-transparent px-2 py-1 text-left text-sm font-semibold shadow-none focus-visible:ring-0"
                  maxLength={30}
                  placeholder="Enter design title..."
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={isSavingTitle}
                  className="hover:bg-muted flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors"
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
                  className="hover:bg-muted flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors"
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group hover:bg-muted/50 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-all"
                title="Click to edit title"
              >
                <h1 className="text-foreground group-hover:text-muted-foreground text-sm font-semibold">
                  {title || "Untitled Design"}
                </h1>
                <Edit3 className="text-muted-foreground group-hover:text-foreground h-4 w-4" />
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
        <div className="border-border bg-background flex-shrink-0 border-t p-2 sm:p-4">
          <div className="mx-auto max-w-4xl">
            {/* User Prompt Display */}
            {shirtData.prompt && (
              <div className="mb-2 text-center sm:mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopyPrompt}
                        className="group hover:bg-muted max-w-full cursor-pointer rounded-lg px-3 py-1 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-muted-foreground group-hover:text-foreground max-w-md truncate text-sm italic">
                            "{shirtData.prompt}"
                          </p>
                          {copied && (
                            <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
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
                    <div className="text-muted-foreground mb-2 text-xs">
                      Generating your design...
                    </div>
                    <div className="bg-muted mx-auto h-2 w-48 rounded-full">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-300 transition-all duration-500 ease-out"
                        style={{
                          width: `${((shirtData.partialIndex !== undefined ? shirtData.partialIndex + 1 : 1) / 3) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
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
              <div className="flex items-center gap-2">
                <ShirtColorPicker />
                {shirtData.imageUrl && (
                  <SettingsModal imageUrl={shirtData.imageUrl} />
                )}
              </div>

              {/* Texture Placement */}
              <div>
                <PlacementControls
                  placement={texturePlacement}
                  onPlacementChange={setTexturePlacement}
                />
              </div>
            </div>

            {/* Debug Controls - Only in development */}
            {import.meta.env.DEV && shirtData.imageUrl && (
              <div className="border-border mt-2 flex justify-center gap-2 border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFullRes}
                  className="text-xs"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Full Res
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCompressed}
                  className="text-xs"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Compressed
                </Button>
              </div>
            )}
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
