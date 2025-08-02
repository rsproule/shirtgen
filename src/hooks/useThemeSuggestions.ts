import { useState } from "react";

interface ThemeSuggestion {
  theme: string;
  description: string;
  promptEnhancer: string;
  examples: string[];
}

const themeSuggestions: ThemeSuggestion[] = [
  {
    theme: "Vintage",
    description: "Retro t-shirt designs",
    promptEnhancer: "in a vintage retro t-shirt design style with distressed graphics and nostalgic 80s/90s aesthetic. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["vintage t-shirt", "retro graphics", "distressed design", "80s/90s style"]
  },
  {
    theme: "Cyberpunk",
    description: "Neon & futuristic",
    promptEnhancer: "in a cyberpunk aesthetic with vivid neon accents, futuristic textures, glowing details, and high-contrast lighting. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["neon colors", "futuristic design", "glowing elements", "high contrast"]
  },
  {
    theme: "Anime",
    description: "Japanese animation style",
    promptEnhancer: "in a detailed anime aesthetic with expressive eyes, smooth cel-shaded coloring, and clean linework. Emphasize emotion and character presence, with a sense of motion or atmosphere typical of anime scenes. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["anime style", "cel-shaded", "expressive eyes", "clean linework"]
  },
  {
    theme: "Ultrarealistic",
    description: "Fine grain film camera",
    promptEnhancer: "in an ultrarealistic style with fine grain film camera aesthetic and photorealistic details. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["photorealistic", "fine grain", "film camera", "ultra detailed"]
  },
  {
    theme: "80s Glamour",
    description: "Mall portrait studio",
    promptEnhancer: "styled like a cheesy 1980s mall glamour shot, foggy soft lighting, teal and magenta lasers in the background, feathered hair, shoulder pads, portrait studio vibes. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["80s glamour", "mall portrait", "feathered hair", "shoulder pads"]
  },
  {
    theme: "Art Nouveau",
    description: "Flowing organic elegance",
    promptEnhancer: "in an Art Nouveau style with flowing lines, organic shapes, floral motifs, and soft, decorative elegance. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["flowing lines", "organic shapes", "floral motifs", "decorative elegance"]
  },
  {
    theme: "B&W Portrait",
    description: "High-contrast headshot",
    promptEnhancer: "as an ultra-realistic high-contrast black-and-white headshot, close up, black shadow background, 35mm lens, 4K quality, aspect ratio 4:3. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["black and white", "high contrast", "35mm lens", "4K quality"]
  },
  {
    theme: "50s Cartoon",
    description: "Retro UPA animation",
    promptEnhancer: "in a retro 1950s cartoon style, minimal vector art, Art Deco inspired, clean flat colors, geometric shapes, mid-century modern design, elegant silhouettes, UPA style animation, smooth lines, limited color palette (black, red, beige, brown, white), grainy paper texture background, vintage jazz club atmosphere, subtle lighting, slightly exaggerated character proportions, classy and stylish mood. NEVER add text, captions, or typography unless explicitly specified in the prompt. Focus purely on visual elements and imagery",
    examples: ["50s cartoon", "UPA style", "Art Deco", "mid-century modern"]
  }
];

export function useThemeSuggestions() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const getThemeSuggestion = (theme: string): ThemeSuggestion | undefined => {
    return themeSuggestions.find(t => t.theme === theme);
  };

  const enhancePromptWithTheme = (basePrompt: string, theme: string): string => {
    const themeSuggestion = getThemeSuggestion(theme);
    if (!themeSuggestion) return basePrompt;
    
    return `${basePrompt} ${themeSuggestion.promptEnhancer}`;
  };

  const getRandomThemeExample = (theme: string): string => {
    const themeSuggestion = getThemeSuggestion(theme);
    if (!themeSuggestion || themeSuggestion.examples.length === 0) return "";
    
    const randomIndex = Math.floor(Math.random() * themeSuggestion.examples.length);
    return themeSuggestion.examples[randomIndex];
  };

  const selectTheme = (theme: string) => {
    // If clicking the same theme, deselect it
    if (selectedTheme === theme) {
      setSelectedTheme(null);
    } else {
      setSelectedTheme(theme);
    }
  };

  const clearTheme = () => {
    setSelectedTheme(null);
  };

  return {
    selectedTheme,
    selectTheme,
    clearTheme,
    enhancePromptWithTheme,
    getRandomThemeExample,
    getThemeSuggestion,
    themeSuggestions
  };
} 