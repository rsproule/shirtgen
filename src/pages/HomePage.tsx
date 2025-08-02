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
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { ThemeButtons } from "@/components/ui/theme-buttons";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";

export function HomePage() {
  const { isLoading, setIsLoading } = useShirtData();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { typingStats, handleInputChange, setPromptWithoutStats } =
    useTypingStats(prompt);
  const { addToHistory: addPromptToHistory } = usePromptHistory();
  const { addToHistory: addShirtToHistory } = useShirtHistory();

  const { generateImage } = useImageGeneration(addShirtToHistory, setError);
  const {
    selectedThemes,
    toggleTheme,
    enhancePromptWithThemes,
    getThemeSuggestion,
  } = useThemeSuggestions();

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
      // Add to history asynchronously (don't wait for it)
      addPromptToHistory(prompt).catch(console.error);
    }

    // Enhance prompt with selected themes invisibly
    const enhancedPrompt = enhancePromptWithThemes(prompt, selectedThemes);
    generateImage(enhancedPrompt);
  };

  const handleRetryGeneration = () => {
    setError(null);

    // Enhance prompt with selected themes invisibly
    const enhancedPrompt = enhancePromptWithThemes(prompt, selectedThemes);
    generateImage(enhancedPrompt);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleSelectFromHistory = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setPromptWithoutStats();
  };

  const handleThemeSelect = (theme: string) => {
    toggleTheme(theme);
  };

  // Create the full prompt that would be sent to the API
  const createFullPrompt = (userPrompt: string, themes: string[]): string => {
    if (!userPrompt.trim()) return "";

    // Get the full prompt enhancer strings for selected themes
    const themeEnhancers = themes
      .map(themeName => getThemeSuggestion(themeName))
      .filter(Boolean)
      .map(theme => theme!.promptEnhancer);

    const styleGuide =
      themeEnhancers.length > 0
        ? `Style guide: ${themeEnhancers.join(", ")}`
        : "";

    const fullPrompt = `Generate an image for: ${userPrompt}.
     
${styleGuide}

IMPORTANT: DO NOT INCLUDE AN IMAGE ON A SHIRT. JUST INCLUDE THE IMAGE
      `;

    return fullPrompt;
  };

  const fullPromptPreview = createFullPrompt(prompt, selectedThemes);

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
          <div className="mb-3 flex items-center justify-start gap-0">
            <img
              src="/shirtslop.png"
              alt="ShirtSlop Logo"
              className="h-32 w-auto object-contain drop-shadow-lg"
            />
            <div
              className="-mt-2 flex items-center"
              style={{
                fontFamily:
                  "Comic Sans MS, Comic Sans, Chalkboard SE, Comic Neue, cursive",
              }}
            >
              <TypewriterEffect
                cursorClassName="hidden"
                words={[
                  {
                    text: "ShirtSlop",
                    className:
                      "text-7xl font-comic text-gray-900 tracking-tight",
                  },
                ]}
                className="font-comic text-7xl tracking-tight text-gray-900"
              />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600">
            AI-powered shirt design
          </p>
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
          fullPrompt={fullPromptPreview}
        />

        {/* Stats Bar */}
        <TypingStats stats={typingStats} promptLength={prompt.length} />

        {/* Theme Buttons */}
        <div className="mt-4">
          <ThemeButtons
            onThemeSelect={handleThemeSelect}
            activeThemes={selectedThemes}
          />
        </div>

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
