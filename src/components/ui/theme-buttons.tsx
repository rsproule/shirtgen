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
        "px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium",
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
      description: "Retro & classic styles",
    },
    {
      theme: "Minimalist",
      description: "Clean & simple designs",
    },
    {
      theme: "Abstract",
      description: "Geometric & artistic",
    },
    {
      theme: "Nature",
      description: "Floral & organic",
    },
    {
      theme: "Urban",
      description: "Street & city vibes",
    },
    {
      theme: "Tech",
      description: "Futuristic & digital",
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Design Themes
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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