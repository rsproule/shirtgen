import { useEffect, useState } from "react";
import { useShirtData } from "@/context/ShirtDataContext";
import { useTypingStats } from "@/hooks/useTypingStats";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { AuthSection } from "@/components/auth/AuthSection";
import { PromptInput } from "@/components/forms/PromptInput";
import { PromptHistory } from "@/components/forms/PromptHistory";
import { TypingStats } from "@/components/forms/TypingStats";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { ShirtHistory } from "@/components/forms/ShirtHistory";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

export function HomePage() {
  const { isLoading, setIsLoading } = useShirtData();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { typingStats, handleInputChange, setPromptWithoutStats } =
    useTypingStats(prompt);
  const { addToHistory: addPromptToHistory } = usePromptHistory();
  const { addToHistory: addShirtToHistory } = useShirtHistory();
  const { generateImage } = useImageGeneration(addShirtToHistory, setError);

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    handleInputChange(newValue);
    setPrompt(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    // Clear any previous errors
    setError(null);

    if (prompt.trim().length >= 10) {
      addPromptToHistory(prompt);
    }
    
    generateImage(prompt, uploadedImage);
  };

  const handleRetryGeneration = () => {
    setError(null);
    generateImage(prompt, uploadedImage);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleSelectFromHistory = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setPromptWithoutStats();
  };

  if (isLoading) {
    return (
      <>
        <LoadingScreen />
        {/* Error Display - Show even during loading */}
        <ErrorDisplay
          error={error}
          onDismiss={handleDismissError}
          onRetry={
            prompt.trim().length >= 10 ? handleRetryGeneration : undefined
          }
          autoHide={false}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header with conditional auth positioning */}
      <div className="relative">
        {/* Title */}
        <div className="mx-auto max-w-7xl px-8 pt-8 pb-4 text-left">
          <div className="flex items-center justify-start gap-6 mb-3">
            <img 
              src="/shirtslop.png" 
              alt="ShirtSlop Logo" 
              className="h-32 w-auto drop-shadow-lg object-contain" 
            />
            <h1 className="text-7xl font-bold text-gray-900 tracking-tight">ShirtSlop</h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">AI-powered shirt design</p>
        </div>

        {/* Auth Section */}
        <AuthSection />
      </div>

      {/* Main Input Area */}
      <div className="mx-auto mt-8 w-full max-w-7xl px-8">
        {/* History Button - Top Right */}
        <div className="mb-1 flex justify-end">
          <PromptHistory onSelectPrompt={handleSelectFromHistory} />
        </div>

        <PromptInput
          value={prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />

        {/* Stats Bar */}
        <TypingStats stats={typingStats} promptLength={prompt.length} />

        {/* Action Buttons */}
        <ActionButtons
          onGenerate={handleGenerate}
          promptLength={prompt.length}
        />

        {/* Shirt History */}
        <ShirtHistory />
      </div>

      {/* Error Display */}
      <ErrorDisplay
        error={error}
        onDismiss={handleDismissError}
        onRetry={prompt.trim().length >= 10 ? handleRetryGeneration : undefined}
        autoHide={false}
      />
    </div>
  );
}
