import { useState } from "react";

interface ThemeSuggestion {
  theme: string;
  description: string;
  promptEnhancers: string[]; // Multiple variations of the prompt enhancer
  examples: string[];
  keyword: string; // Short keyword to add to prompt
}

const themeSuggestions: ThemeSuggestion[] = [
  {
    theme: "Ultrarealistic",
    description: "Fine grain film camera",
    promptEnhancers: [
      "in an ultrarealistic style with fine grain film camera aesthetic and photorealistic details",
      "photorealistic rendering with ultrarealistic quality and fine grain film texture",
      "ultrarealistic photography style, fine grain film aesthetic, photorealistic details",
      "rendered with ultrarealistic precision, fine grain film camera quality, photorealistic finish",
    ],
    examples: ["photorealistic", "fine grain", "film camera", "ultra detailed"],
    keyword: "ultrarealistic",
  },
  {
    theme: "Grainy Film Camera",
    description: "Vintage film aesthetic",
    promptEnhancers: [
      "with a grainy film camera aesthetic, vintage photography style, and authentic film grain texture",
      "vintage film grain aesthetic, authentic analog camera texture, retro photography style",
      "grainy film camera style, vintage photography aesthetic, authentic film grain texture",
      "retro film grain aesthetic, vintage camera style, authentic analog photography texture",
    ],
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
    promptEnhancers: [
      "as an ultra-realistic high-contrast black-and-white headshot, close up, with dramatic lighting and 35mm lens quality",
      "high-contrast black-and-white portrait, ultra-realistic close-up, dramatic lighting, 35mm lens quality",
      "ultra-realistic B&W headshot, high-contrast close-up, dramatic lighting, 35mm lens quality",
      "black-and-white portrait style, ultra-realistic close-up, high-contrast dramatic lighting, 35mm lens",
    ],
    examples: ["black and white", "high contrast", "35mm lens", "4K quality"],
    keyword: "black and white",
  },
  {
    theme: "Vintage",
    description: "Retro t-shirt designs",
    promptEnhancers: [
      "in a vintage retro t-shirt design style with distressed graphics and nostalgic 80s/90s aesthetic",
      "vintage t-shirt design aesthetic, retro graphics style, distressed and nostalgic 80s/90s look",
      "retro vintage t-shirt design, distressed graphics aesthetic, nostalgic 80s/90s style",
      "nostalgic 80s/90s vintage t-shirt design, retro graphics, distressed aesthetic",
    ],
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
    promptEnhancers: [
      "styled like a cheesy 1980s mall glamour shot with foggy soft lighting, teal and magenta lasers in the background, feathered hair, and shoulder pads",
      "1980s mall glamour shot aesthetic, cheesy style, foggy soft lighting, teal and magenta lasers, feathered hair, shoulder pads",
      "cheesy 80s mall glamour shot style, foggy soft lighting, teal and magenta laser background, feathered hair, shoulder pads",
      "80s mall portrait studio aesthetic, cheesy glamour shot, foggy lighting, teal and magenta lasers, feathered hair, shoulder pads",
    ],
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
    promptEnhancers: [
      "in a cyberpunk aesthetic with vivid neon accents, futuristic textures, glowing details, and high-contrast lighting",
      "cyberpunk style aesthetic, vivid neon accents, futuristic textures, glowing details, high-contrast lighting",
      "futuristic cyberpunk aesthetic, vivid neon accents, glowing details, high-contrast lighting, futuristic textures",
      "neon cyberpunk aesthetic, vivid accents, futuristic textures, glowing details, high-contrast lighting",
    ],
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
    promptEnhancers: [
      "in an Art Nouveau style with flowing lines, organic shapes, floral motifs, and decorative elegance",
      "Art Nouveau aesthetic, flowing organic lines, floral motifs, decorative elegance",
      "flowing Art Nouveau style, organic shapes, floral motifs, decorative elegance",
      "organic Art Nouveau aesthetic, flowing lines, floral motifs, decorative elegance",
    ],
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
    promptEnhancers: [
      "in a detailed anime aesthetic with expressive eyes, smooth cel-shaded coloring, and clean linework",
      "anime style aesthetic, detailed rendering, expressive eyes, smooth cel-shaded coloring, clean linework",
      "detailed anime aesthetic, expressive eyes, smooth cel-shaded coloring, clean linework",
      "cel-shaded anime style, detailed aesthetic, expressive eyes, clean linework",
    ],
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
    promptEnhancers: [
      "in a retro 1950s cartoon style with minimal vector art, Art Deco inspiration, clean flat colors, geometric shapes, and mid-century modern design aesthetic",
      "retro 1950s cartoon aesthetic, minimal vector art, Art Deco inspiration, clean flat colors, geometric shapes, mid-century modern design",
      "1950s cartoon style, minimal vector art, Art Deco inspiration, clean flat colors, geometric shapes, mid-century modern aesthetic",
      "UPA-style 1950s cartoon, minimal vector art, Art Deco inspiration, clean flat colors, geometric shapes, mid-century modern design",
    ],
    examples: ["50s cartoon", "UPA style", "Art Deco", "mid-century modern"],
    keyword: "50s cartoon",
  },
  {
    theme: "Renaissance",
    description: "Classical oil painting",
    promptEnhancers: [
      "in a Renaissance style with classical oil painting technique, rich colors, dramatic lighting, and masterful brushwork",
      "Renaissance aesthetic, classical oil painting style, rich colors, dramatic lighting, masterful brushwork",
      "classical Renaissance, oil painting technique, rich colors, dramatic lighting, masterful brushwork",
      "Renaissance oil painting style, classical aesthetic, rich colors, dramatic lighting, masterful brushwork",
    ],
    examples: ["Renaissance", "oil painting", "classical", "dramatic lighting"],
    keyword: "renaissance",
  },
  {
    theme: "Engraving",
    description: "Fine line etching",
    promptEnhancers: [
      "in an engraving style with fine line etching technique, detailed cross-hatching, monochromatic tones, and intricate linework",
      "engraving aesthetic, fine line etching style, detailed cross-hatching, monochromatic tones, intricate linework",
      "fine line engraving, etching technique, detailed cross-hatching, monochromatic tones, intricate linework",
      "engraved style, fine line etching aesthetic, detailed cross-hatching, monochromatic tones, intricate linework",
    ],
    examples: ["engraving", "etching", "cross-hatching", "fine lines"],
    keyword: "engraving",
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
      .map(suggestion => {
        const randomIndex = Math.floor(Math.random() * suggestion!.promptEnhancers.length);
        return suggestion!.promptEnhancers[randomIndex];
      });

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
