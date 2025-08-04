import { useShirtData } from "@/context/ShirtDataContext";
import { PromptInput } from "@/components/forms/PromptInput";
import { PromptHistory } from "@/components/forms/PromptHistory";
import { TypingStats } from "@/components/forms/TypingStats";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { ThemeButtons } from "@/components/ui/theme-buttons";
import { FavoritesDisplay } from "@/components/ui/FavoritesDisplay";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { useTypingStats } from "@/hooks/useTypingStats";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { useFavoriteThemes } from "@/hooks/useFavoriteThemes";

interface PromptSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onSelectFromHistory: (prompt: string) => void;
  createFullPrompt: (userPrompt: string, themes: string[]) => string;
}

export function PromptSection({
  prompt,
  setPrompt,
  onGenerate,
  onSelectFromHistory,
  createFullPrompt,
}: PromptSectionProps) {
  const { isAuthenticated, signIn } = useShirtData();
  const { typingStats, handleInputChange, setPromptWithoutStats } =
    useTypingStats(prompt);
  const {
    selectedThemes,
    toggleTheme,
  } = useThemeSuggestions();
  const { addToFavorites } = useFavoriteThemes();

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
    // Add selected themes to favorites when used
    selectedThemes.forEach(theme => addToFavorites(theme));
    onGenerate();
  };

  const handleSelectFromHistory = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setPromptWithoutStats();
    onSelectFromHistory(selectedPrompt);
  };

  const handleThemeSelect = (theme: string) => {
    toggleTheme(theme);
  };

  const fullPromptPreview = createFullPrompt(prompt, selectedThemes);

  return (
    <div className="mx-auto mt-8 w-full max-w-7xl px-8">
      {/* Chat UI Container - with blur overlay when not authenticated */}
      <div className="relative">
        {/* Main Chat UI */}
        <div
          className={`${!isAuthenticated ? "pointer-events-none blur-sm" : ""}`}
        >
          {/* Top Section */}
          <div className="mb-1 flex items-start justify-between">
            {/* Favorites Display - Top Left */}
            <div className="flex-1">
              <FavoritesDisplay
                onThemeSelect={handleThemeSelect}
                activeThemes={selectedThemes}
              />
            </div>
            {/* History Button - Top Right */}
            <div className="flex-shrink-0">
              <PromptHistory onSelectPrompt={handleSelectFromHistory} />
            </div>
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
        </div>

        {/* Sign-in overlay for non-authenticated users */}
        {!isAuthenticated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PulsatingButton
              onClick={signIn}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
              pulseColor="var(--primary-light)"
              disabledAnimation={false}
            >
              Login to create
            </PulsatingButton>
          </div>
        )}
      </div>
    </div>
  );
}
