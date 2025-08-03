import { useEffect, useState, useCallback, useRef } from "react";
import { useShirtData } from "@/context/ShirtDataContext";
import { useTypingStats } from "@/hooks/useTypingStats";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { usePromptEnhancement } from "@/hooks/usePromptEnhancement";
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
import { PulsatingButton } from "@/components/magicui/pulsating-button";

export function HomePage() {
  const { isLoading, setIsLoading, isAuthLoading, isAuthenticated, signIn } =
    useShirtData();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { typingStats, handleInputChange, setPromptWithoutStats } =
    useTypingStats(prompt);
  const { addToHistory: addPromptToHistory } = usePromptHistory();
  const { addToHistory: addShirtToHistory } = useShirtHistory();
  const { 
    enhancePrompt, 
    suggestions, 
    isEnhancing, 
    clearSuggestions,
    isLowEffortPrompt
  } = usePromptEnhancement();

  const { generateImage } = useImageGeneration(addShirtToHistory, setError);
  const {
    selectedThemes,
    toggleTheme,
    enhancePromptWithThemes,
    getThemeSuggestion,
  } = useThemeSuggestions();
  const { addToFavorites } = useFavoriteThemes();

  // Ref to track if we're already processing
  const processingRef = useRef(false);

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);

  // Check for low-effort prompts and generate suggestions
  const checkPrompt = useCallback(async () => {
    console.log("=== checkPrompt called ===");
    console.log("Current prompt:", prompt);
    console.log("Prompt length:", prompt.length);
    
    // Don't show suggestions if user has typed more than 3 words
    const wordCount = prompt.trim().split(/\s+/).length;
    if (wordCount > 3) {
      console.log("More than 3 words, clearing suggestions");
      clearSuggestions();
      return;
    }
    
    if (prompt.trim().length > 0) {
      console.log("Prompt has content, calling enhancePrompt...");
      await enhancePrompt(prompt);
    } else {
      console.log("Empty prompt, clearing suggestions");
      clearSuggestions();
    }
  }, [prompt, enhancePrompt, clearSuggestions]);

  useEffect(() => {
    console.log("=== useEffect triggered ===");
    console.log("Prompt changed:", prompt);
    console.log("Prompt length:", prompt.length);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Suggestions count:", suggestions.length);
    console.log("Is enhancing:", isEnhancing);
    
    // Only run if authenticated
    if (isAuthenticated) {
      console.log("User is authenticated, setting timeout...");
      // Trigger immediately when typing starts
      const timeoutId = setTimeout(() => {
        console.log("Timeout fired, calling checkPrompt");
        checkPrompt();
      }, 300);
      return () => {
        console.log("Clearing timeout");
        clearTimeout(timeoutId);
      };
    } else {
      console.log("User not authenticated, skipping");
    }
  }, [prompt, isAuthenticated]); // Remove checkPrompt from dependencies

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

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    console.log("Suggestion selected:", suggestion);
    setPrompt(suggestion);
    setPromptWithoutStats();
    clearSuggestions(); // Clear suggestions after selection
  }, [setPromptWithoutStats, clearSuggestions]);

  const handleDismissSuggestions = useCallback(() => {
    clearSuggestions();
  }, [clearSuggestions]);

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
        <div className="mb-1 flex items-start justify-between">
          {/* Favorites Display - Top Left */}
          <FavoritesDisplay
            onThemeSelect={handleThemeSelect}
            activeThemes={selectedThemes}
          />
          {/* History Button - Top Right */}
          <PromptHistory onSelectPrompt={handleSelectFromHistory} />
        </div>

        {/* Chat UI Container - with blur overlay when not authenticated */}
        <div className="relative">
          {/* Main Chat UI */}
          <div
            className={`${!isAuthenticated ? "pointer-events-none blur-sm" : ""}`}
          >
            <PromptInput
              value={prompt}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              fullPrompt={fullPromptPreview}
              activeThemes={selectedThemes}
              onThemeRemove={handleThemeSelect}
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionSelect}
              onDismissSuggestions={handleDismissSuggestions}
              isEnhancing={isEnhancing}
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
          </div>

          {/* Sign-in overlay for non-authenticated users */}
          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <PulsatingButton
                onClick={signIn}
                className="bg-primary text-primary-foreground hover:bg-primary/80"
                pulseColor="hsl(var(--muted-foreground))"
              >
                Sign in to create a shirt
              </PulsatingButton>
            </div>
          )}
        </div>

        {/* Shirt History - always show */}
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
