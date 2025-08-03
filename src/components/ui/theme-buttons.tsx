import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { useFavoriteThemes } from "@/hooks/useFavoriteThemes";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { X, Star, X as XIcon } from "lucide-react";

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
          ? "border-blue-300 bg-blue-50 text-gray-700"
          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50",
      )}
    >
      <div className="text-center">
        <div className="font-semibold">{theme}</div>
        {/* <div className="mt-1 text-xs opacity-80">{description}</div> */}
      </div>
    </button>
  );
};

interface FavoriteThemeButtonProps {
  theme: string;
  onClick: (theme: string) => void;
  onDelete: (theme: string) => void;
  isSelected?: boolean;
}

const FavoriteThemeButton: React.FC<FavoriteThemeButtonProps> = ({
  theme,
  onClick,
  onDelete,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onClick(theme)}
        className={cn(
          "rounded-lg border px-2 py-1 text-xs font-medium transition-all duration-200",
          "hover:shadow-md",
          isSelected
            ? "border-blue-300 bg-blue-50 text-gray-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50",
        )}
      >
        <div className="text-center">
          <div className="font-semibold">{theme}</div>
        </div>
      </button>

      {/* Delete button - appears on hover */}
      {isHovered && (
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(theme);
          }}
          className="absolute top-0 right-0 z-10 rounded-full bg-red-500 p-0.5 text-white shadow-sm transition-colors hover:bg-red-600"
        >
          <XIcon className="h-1.5 w-1.5" />
        </button>
      )}
    </div>
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
  const { favoriteThemes, addToFavorites, removeFromFavorites, isFavorite } =
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
          "Maximum 3 favorites allowed. Remove one to add another.",
        );
        // Clear error after 3 seconds
        setTimeout(() => setFavoritesError(null), 3000);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Favorites and Active Themes Section - Always show */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Favorite themes on the left */}
          <div className="flex-1">
            <div className="mb-2 text-left">
              <span className="text-xs text-gray-500 underline">Favorites</span>
            </div>
            {favoriteThemes.length > 0 ? (
              <div className="relative w-full overflow-hidden">
                <div className="flex min-w-max gap-1 whitespace-nowrap">
                  {favoriteThemes.map(favoriteTheme => {
                    const themeData = themeSuggestions.find(
                      t => t.theme === favoriteTheme.theme,
                    );
                    if (!themeData) return null;

                    return (
                      <FavoriteThemeButton
                        key={favoriteTheme.theme}
                        theme={favoriteTheme.theme}
                        onClick={handleThemeClick}
                        onDelete={removeFromFavorites}
                        isSelected={activeThemes.includes(favoriteTheme.theme)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[32px] items-center justify-center text-xs text-gray-400 italic">
                No favorite themes yet
              </div>
            )}
          </div>

          {/* Selected themes on the right - always present */}
          <div className="flex-shrink-0">
            <div className="mb-2 text-left">
              <span className="text-xs text-gray-500 underline">Active</span>
            </div>
            {activeThemes.length > 0 ? (
              <div className="flex items-center gap-1">
                {activeThemes.slice(0, 3).map(theme => {
                  const themeData = themeSuggestions.find(
                    t => t.theme === theme,
                  );
                  if (!themeData) return null;

                  return (
                    <ThemeButton
                      key={theme}
                      theme={theme}
                      description={themeData.description}
                      onClick={handleThemeClick}
                      isSelected={true}
                    />
                  );
                })}
                {activeThemes.length > 3 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                    <div className="text-center">
                      <div className="font-semibold">
                        +{activeThemes.length - 3} more
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[32px] items-center justify-center text-xs text-gray-400 italic">
                No active themes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrolling Themes Section */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <div
            className="mx-4 max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Select Themes</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Message in Modal */}
            {favoritesError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {favoritesError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {themeSuggestions.map(themeData => (
                <button
                  key={themeData.theme}
                  onClick={() => handleThemeToggle(themeData.theme)}
                  className={cn(
                    "h-14 rounded-lg border p-3 text-left transition-all duration-200",
                    "relative flex flex-col justify-center hover:shadow-md",
                    activeThemes.includes(themeData.theme)
                      ? "border-blue-300 bg-blue-50 text-gray-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50",
                  )}
                >
                  <div className="truncate text-xs leading-tight font-semibold">
                    {themeData.theme}
                  </div>
                  <div className="truncate text-xs leading-tight text-gray-500">
                    {themeData.description}
                  </div>
                  <button
                    onClick={e => handleFavoriteToggle(themeData.theme, e)}
                    className="absolute top-1 right-1 rounded p-1 hover:bg-gray-100"
                  >
                    <Star
                      className={cn(
                        "h-3 w-3",
                        isFavorite(themeData.theme)
                          ? "fill-current text-yellow-500"
                          : "text-gray-400 hover:text-yellow-500",
                      )}
                    />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
