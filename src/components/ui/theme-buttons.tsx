import { useFavoriteThemes } from "@/hooks/useFavoriteThemes";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { cn } from "@/lib/utils";
import { Palette, Star, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./button";

interface ThemeButtonProps {
  theme: string;
  description: string;
  onClick: (theme: string) => void;
  isSelected?: boolean;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  theme,
  onClick,
  isSelected = false,
}) => {
  return (
    <button
      onClick={() => onClick(theme)}
      className={cn(
        "rounded-lg border px-2 py-1 text-xs font-medium transition-all duration-200",
        "hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/10",
      )}
    >
      <div className="text-center">
        <div className="font-semibold">{theme}</div>
        {/* <div className="mt-1 text-xs opacity-80">{description}</div> */}
      </div>
    </button>
  );
};

interface ThemeButtonsProps {
  onThemeSelect: (theme: string) => void;
  activeThemes?: string[];
}

export const ThemeButtons: React.FC<ThemeButtonsProps> = ({
  onThemeSelect,
  activeThemes = [],
}) => {
  const { themeSuggestions } = useThemeSuggestions();
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoriteThemes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(activeThemes);
  const [isHovered, setIsHovered] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  const handleThemeToggle = (theme: string) => {
    const newSelectedThemes = selectedThemes.includes(theme)
      ? selectedThemes.filter(t => t !== theme)
      : [...selectedThemes, theme];

    setSelectedThemes(newSelectedThemes);

    // Auto-apply the change
    if (selectedThemes.includes(theme)) {
      // Remove theme
      onThemeSelect(theme);
    } else {
      // Add theme
      onThemeSelect(theme);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleThemeClick = (theme: string) => {
    onThemeSelect(theme);
  };

  const handleFavoriteToggle = (theme: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Clear any existing error
    setFavoritesError(null);

    if (isFavorite(theme)) {
      removeFromFavorites(theme);
    } else {
      const success = addToFavorites(theme);
      if (!success) {
        setFavoritesError(
          "Maximum 10 favorites allowed. Remove one to add another.",
        );
        // Clear error after 3 seconds
        setTimeout(() => setFavoritesError(null), 3000);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Mobile: Minimal Button */}
      <div className="block flex justify-center sm:hidden">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          className="justify-start gap-2"
        >
          <Palette className="h-4 w-4" />
          <span>Choose Themes</span>
          {activeThemes.length > 0 && (
            <span className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
              {activeThemes.length}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop: Scrolling Themes Section */}
      <div className="hidden sm:block">
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          onTouchCancel={() => setIsHovered(false)}
        >
          <div
            className={cn(
              "flex min-w-max gap-1 whitespace-nowrap",
              "animate-scroll",
              isHovered && "animate-scroll-paused",
            )}
          >
            {/* Duplicate many times for infinite loop */}
            {[
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
              ...themeSuggestions,
            ].map((themeData, index) => (
              <ThemeButton
                key={`${themeData.theme}-${index}`}
                theme={themeData.theme}
                description={themeData.description}
                onClick={handleThemeClick}
                isSelected={activeThemes.includes(themeData.theme)}
              />
            ))}
          </div>
        </div>

        {/* View Full List Button */}
        <div className="mt-2 text-left">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            View Full List
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleCloseModal}
        >
          <div
            className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-border bg-background flex-shrink-0 border-b p-3 sm:p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Select Themes</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-muted-foreground hover:text-foreground p-2 touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Error Message in Modal */}
              {favoritesError && (
                <div className="border-destructive/20 bg-destructive/10 text-destructive mt-3 rounded-lg border px-3 py-2 text-xs">
                  {favoritesError}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {themeSuggestions.map(themeData => (
                  <button
                    key={themeData.theme}
                    onClick={(e) => {
                      // Don't trigger if clicking on the star
                      if ((e.target as Element).closest('[data-star-button]')) {
                        return;
                      }
                      handleThemeToggle(themeData.theme);
                    }}
                    className={cn(
                      "h-16 rounded-lg border p-3 text-left transition-all duration-200 touch-manipulation",
                      "relative flex flex-col justify-center hover:shadow-md",
                      activeThemes.includes(themeData.theme)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/10",
                    )}
                  >
                    <div className="truncate pr-8 text-xs leading-tight font-semibold">
                      {themeData.theme}
                    </div>
                    <div className="truncate pr-8 text-xs leading-tight text-gray-500">
                      {themeData.description}
                    </div>
                    <div
                      data-star-button
                      onClick={e => handleFavoriteToggle(themeData.theme, e)}
                      className="absolute top-2 right-2 cursor-pointer rounded p-2 hover:bg-gray-100 touch-manipulation"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          isFavorite(themeData.theme)
                            ? "fill-current text-yellow-500"
                            : "text-gray-400 hover:text-yellow-500",
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
