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
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/10",
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
    <div className="flex flex-wrap justify-start gap-1">
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
