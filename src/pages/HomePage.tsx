import { useEffect, useState } from "react";
import { useShirtData } from "@/context/ShirtDataContext";
import { useTypingStats } from "@/hooks/useTypingStats";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { PromptInput } from "@/components/forms/PromptInput";
import { PromptHistory } from "@/components/forms/PromptHistory";
import { TypingStats } from "@/components/forms/TypingStats";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { ShirtHistory } from "@/components/forms/ShirtHistory";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { ThemeButtons } from "@/components/ui/theme-buttons";
import { FavoritesDisplay } from "@/components/ui/FavoritesDisplay";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { useFavoriteThemes } from "@/hooks/useFavoriteThemes";

export function HomePage() {
  const { isLoading, setIsLoading, isAuthLoading } = useShirtData();
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
  const { addToFavorites } = useFavoriteThemes();

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

    // Add selected themes to favorites when used
    selectedThemes.forEach(theme => addToFavorites(theme));

    // Enhance prompt with selected themes invisibly
    const enhancedPrompt = enhancePromptWithThemes(prompt, selectedThemes);
    generateImage(enhancedPrompt);
  };

  const handleRetryGeneration = () => {
    setError(null);

    // Add selected themes to favorites when used
    selectedThemes.forEach(theme => addToFavorites(theme));

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
      .map(theme => theme!.promptEnhancers[0]);

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

  // Show blank page while auth state is being determined
  if (isAuthLoading) {
    return <div className="min-h-screen bg-white" />;
  }

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
      {/* Navbar */}
      <Navbar />

      {/* Main Input Area */}
      <div className="mx-auto mt-8 w-full max-w-7xl px-8">
        {/* Top Section */}
        <div className="mb-1 flex justify-between items-start">
          {/* Favorites Display - Top Left */}
          <FavoritesDisplay
            onThemeSelect={handleThemeSelect}
            activeThemes={selectedThemes}
          />
          {/* History Button - Top Right */}
          <PromptHistory onSelectPrompt={handleSelectFromHistory} />
        </div>

        <PromptInput
          value={prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          fullPrompt={fullPromptPreview}
          activeThemes={selectedThemes}
          onThemeRemove={handleThemeSelect}
        />

        {/* Stats Bar */}
        <TypingStats stats={typingStats} promptLength={prompt.length} />

        {/* Action Buttons */}
        <ActionButtons
          onGenerate={handleGenerate}
          promptLength={prompt.length}
        />

        {/* Theme Buttons */}
        <div className="mt-4">
          <ThemeButtons
            onThemeSelect={handleThemeSelect}
            activeThemes={selectedThemes}
          />
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
