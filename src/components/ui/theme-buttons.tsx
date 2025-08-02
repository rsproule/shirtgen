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
          ? "border-blue-500 bg-blue-500 text-white shadow-md"
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
