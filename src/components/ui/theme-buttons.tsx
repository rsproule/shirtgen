import { useThemeSuggestions } from "@/hooks/useThemeSuggestions";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { X } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(activeThemes);

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

  return (
    <div className="w-full">
      <div className="relative overflow-hidden w-full">
        <div className="flex gap-1 animate-scroll whitespace-nowrap min-w-max">
          {/* Duplicate many times for infinite loop */}
          {[...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions, ...themeSuggestions].map((themeData, index) => (
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
      
      {/* View Full List Button */}
      <div className="mt-2 text-left">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
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
            className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Select Themes</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {themeSuggestions.map((themeData) => (
                <button
                  key={themeData.theme}
                  onClick={() => handleThemeToggle(themeData.theme)}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all duration-200",
                    "hover:shadow-md",
                    activeThemes.includes(themeData.theme)
                      ? "border-blue-300 bg-blue-50 text-gray-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50",
                  )}
                >
                  <div className="font-semibold text-xs">{themeData.theme}</div>
                  <div className="text-xs text-gray-500 mt-1">{themeData.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
