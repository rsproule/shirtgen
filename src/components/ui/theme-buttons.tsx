import React from "react";
import { cn } from "@/lib/utils";

interface ThemeButtonProps {
  theme: string;
  description: string;
  onClick: (theme: string) => void;
  isSelected?: boolean;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  theme,
  description,
  onClick,
  isSelected = false,
}) => {
  return (
    <button
      onClick={() => onClick(theme)}
      className={cn(
        "px-2 py-1 rounded-lg border transition-all duration-200 text-xs font-medium",
        "hover:scale-105 hover:shadow-md",
        isSelected
          ? "bg-blue-500 text-white border-blue-500 shadow-md"
          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      )}
    >
      <div className="text-center">
        <div className="font-semibold">{theme}</div>
        <div className="text-xs opacity-80 mt-1">{description}</div>
      </div>
    </button>
  );
};

interface ThemeButtonsProps {
  onThemeSelect: (theme: string) => void;
  selectedTheme?: string;
}

export const ThemeButtons: React.FC<ThemeButtonsProps> = ({
  onThemeSelect,
  selectedTheme,
}) => {
  const themes = [
    {
      theme: "Vintage",
      description: "Retro t-shirt designs",
    },
    {
      theme: "Cyberpunk",
      description: "Neon & futuristic",
    },
    {
      theme: "Anime",
      description: "Japanese animation style",
    },
    {
      theme: "Ultrarealistic",
      description: "Fine grain film camera",
    },
    {
      theme: "80s Glamour",
      description: "Mall portrait studio",
    },
    {
      theme: "Art Nouveau",
      description: "Flowing organic elegance",
    },
    {
      theme: "B&W Portrait",
      description: "High-contrast headshot",
    },
    {
      theme: "50s Cartoon",
      description: "Retro UPA animation",
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Design Themes
      </h3>
      <div className="flex flex-wrap gap-1">
        {themes.map((themeData, index) => (
          <ThemeButton
            key={`${themeData.theme}-${index}`}
            theme={themeData.theme}
            description={themeData.description}
            onClick={onThemeSelect}
            isSelected={selectedTheme === themeData.theme}
          />
        ))}
      </div>
    </div>
  );
}; 