import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { cn } from "@/lib/utils";
import React from "react";

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

interface ThemeButtonsProps {
  onThemeSelect: (theme: string) => void;
  activeThemes?: string[];
}

export const ThemeButtons: React.FC<ThemeButtonsProps> = ({
  onThemeSelect,
  activeThemes = [],
}) => {
  const { themeSuggestions } = useThemeSuggestions();

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1">
        {themeSuggestions.map((themeData, index) => (
          <ThemeButton
            key={`${themeData.theme}-${index}`}
            theme={themeData.theme}
            description={themeData.description}
            onClick={onThemeSelect}
            isSelected={activeThemes.includes(themeData.theme)}
          />
        ))}
      </div>
    </div>
  );
};
