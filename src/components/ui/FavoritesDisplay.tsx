import { useFavoriteThemes } from "@/hooks/useFavoriteThemes";
import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { cn } from "@/lib/utils";

interface FavoritesDisplayProps {
  onThemeSelect: (theme: string) => void;
  activeThemes?: string[];
}

const FavoriteThemeButton: React.FC<{
  theme: string;
  onClick: (theme: string) => void;
  isSelected?: boolean;
}> = ({ theme, onClick, isSelected = false }) => {
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
      </div>
    </button>
  );
};

export const FavoritesDisplay: React.FC<FavoritesDisplayProps> = ({
  onThemeSelect,
  activeThemes = [],
}) => {
  const { favoriteThemes } = useFavoriteThemes();
  const { themeSuggestions } = useThemeSuggestions();

  // Don't render anything if no favorites
  if (favoriteThemes.length === 0) {
    return null;
  }

  const handleThemeClick = (theme: string) => {
    onThemeSelect(theme);
  };

  return (
    <div className="flex gap-1 flex-wrap justify-start">
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
            isSelected={activeThemes.includes(favoriteTheme.theme)}
          />
        );
      })}
    </div>
  );
};