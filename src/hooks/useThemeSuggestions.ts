import { useState } from "react";

interface ThemeSuggestion {
  theme: string;
  description: string;
  promptEnhancer: string;
  examples: string[];
  keyword: string; // Short keyword to add to prompt
}

const themeSuggestions: ThemeSuggestion[] = [
  {
    theme: "Ultrarealistic",
    description: "Fine grain film camera",
    promptEnhancer:
      "in an ultrarealistic style with fine grain film camera aesthetic and photorealistic details",
    examples: ["photorealistic", "fine grain", "film camera", "ultra detailed"],
    keyword: "ultrarealistic",
  },
  {
    theme: "Grainy Film Camera",
    description: "Vintage film aesthetic",
    promptEnhancer:
      "with a grainy film camera aesthetic, vintage photography style, and authentic film grain texture",
    examples: [
      "grainy film",
      "vintage photography",
      "film grain",
      "analog camera",
    ],
    keyword: "grainy film",
  },
  {
    theme: "B&W Portrait",
    description: "High-contrast headshot",
    promptEnhancer:
      "as an ultra-realistic high-contrast black-and-white headshot, close up, with dramatic lighting and 35mm lens quality",
    examples: ["black and white", "high contrast", "35mm lens", "4K quality"],
    keyword: "black and white",
  },
  {
    theme: "Vintage",
    description: "Retro t-shirt designs",
    promptEnhancer:
      "in a vintage retro t-shirt design style with distressed graphics and nostalgic 80s/90s aesthetic",
    examples: [
      "vintage t-shirt",
      "retro graphics",
      "distressed design",
      "80s/90s style",
    ],
    keyword: "vintage",
  },
  {
    theme: "80s Glamour",
    description: "Mall portrait studio",
    promptEnhancer:
      "styled like a cheesy 1980s mall glamour shot with foggy soft lighting, teal and magenta lasers in the background, feathered hair, and shoulder pads",
    examples: [
      "80s glamour",
      "mall portrait",
      "feathered hair",
      "shoulder pads",
    ],
    keyword: "80s glamour",
  },
  {
    theme: "Cyberpunk",
    description: "Neon & futuristic",
    promptEnhancer:
      "in a cyberpunk aesthetic with vivid neon accents, futuristic textures, glowing details, and high-contrast lighting",
    examples: [
      "neon colors",
      "futuristic design",
      "glowing elements",
      "high contrast",
    ],
    keyword: "cyberpunk",
  },
  {
    theme: "Art Nouveau",
    description: "Flowing organic elegance",
    promptEnhancer:
      "in an Art Nouveau style with flowing lines, organic shapes, floral motifs, and decorative elegance",
    examples: [
      "flowing lines",
      "organic shapes",
      "floral motifs",
      "decorative elegance",
    ],
    keyword: "art nouveau",
  },
  {
    theme: "Anime",
    description: "Japanese animation style",
    promptEnhancer:
      "in a detailed anime aesthetic with expressive eyes, smooth cel-shaded coloring, and clean linework",
    examples: [
      "anime style",
      "cel-shaded",
      "expressive eyes",
      "clean linework",
    ],
    keyword: "anime",
  },
  {
    theme: "50s Cartoon",
    description: "Retro UPA animation",
    promptEnhancer:
      "in a retro 1950s cartoon style with minimal vector art, Art Deco inspiration, clean flat colors, geometric shapes, and mid-century modern design aesthetic",
    examples: ["50s cartoon", "UPA style", "Art Deco", "mid-century modern"],
    keyword: "50s cartoon",
  },
];

export function useThemeSuggestions() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const getThemeSuggestion = (theme: string): ThemeSuggestion | undefined => {
    return themeSuggestions.find(t => t.theme === theme);
  };

  const enhancePromptWithThemes = (
    basePrompt: string,
    themes: string[],
  ): string => {
    if (themes.length === 0) return basePrompt;

    const enhancements = themes
      .map(theme => getThemeSuggestion(theme))
      .filter(Boolean)
      .map(suggestion => suggestion!.promptEnhancer);

    return `${basePrompt} ${enhancements.join(" ")}`;
  };

  const getRandomThemeExample = (theme: string): string => {
    const themeSuggestion = getThemeSuggestion(theme);
    if (!themeSuggestion || themeSuggestion.examples.length === 0) return "";

    const randomIndex = Math.floor(
      Math.random() * themeSuggestion.examples.length,
    );
    return themeSuggestion.examples[randomIndex];
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        return prev.filter(t => t !== theme);
      } else {
        return [...prev, theme];
      }
    });
  };

  const clearAllThemes = () => {
    setSelectedThemes([]);
  };

  return {
    selectedThemes,
    toggleTheme,
    clearAllThemes,
    enhancePromptWithThemes,
    getRandomThemeExample,
    getThemeSuggestion,
    themeSuggestions,
  };
}
