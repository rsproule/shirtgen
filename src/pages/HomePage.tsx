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
import FileUploadDemo from "@/components/file-upload-demo";
import { ThemeButtons } from "@/components/ui/theme-buttons";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";

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
  const { selectedTheme, selectTheme, enhancePromptWithTheme } = useThemeSuggestions();

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
    
    // Enhance prompt with selected theme if any
    const enhancedPrompt = selectedTheme 
      ? enhancePromptWithTheme(prompt, selectedTheme)
      : prompt;
    
    generateImage(enhancedPrompt, uploadedImage);
  };

  const handleRetryGeneration = () => {
    setError(null);
    
    // Enhance prompt with selected theme if any
    const enhancedPrompt = selectedTheme 
      ? enhancePromptWithTheme(prompt, selectedTheme)
      : prompt;
    
    generateImage(enhancedPrompt, uploadedImage);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleSelectFromHistory = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setPromptWithoutStats();
  };

  const handleImageUpload = (file: File | null) => {
    setUploadedImage(file);
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
          <h1 className="mb-2 text-6xl font-light text-gray-900">InstaShirt</h1>
          <p className="text-gray-500">AI-powered shirt design</p>
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

        {/* Theme Buttons */}
        <div className="mt-4">
          <ThemeButtons 
            onThemeSelect={selectTheme}
            selectedTheme={selectedTheme || undefined}
          />
        </div>

        {/* Stats Bar */}
        <TypingStats stats={typingStats} promptLength={prompt.length} />

        {/* Action Buttons */}
        <ActionButtons
          onGenerate={handleGenerate}
          promptLength={prompt.length}
        />

        {/* File Upload Demo */}
        <div className="mt-6 flex justify-start">
          <FileUploadDemo onImageUpload={handleImageUpload} />
        </div>

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
