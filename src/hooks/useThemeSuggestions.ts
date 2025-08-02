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
    description: "Retro & classic styles",
    promptEnhancer: "in a vintage, retro style with classic typography and nostalgic elements",
    examples: ["vintage typography", "retro colors", "classic design", "nostalgic elements"]
  },
  {
    theme: "Minimalist",
    description: "Clean & simple designs",
    promptEnhancer: "in a minimalist, clean style with simple shapes and typography",
    examples: ["clean lines", "simple shapes", "minimal typography", "white space"]
  },
  {
    theme: "Abstract",
    description: "Geometric & artistic",
    promptEnhancer: "in an abstract, geometric style with bold shapes and artistic composition",
    examples: ["geometric shapes", "abstract patterns", "bold colors", "artistic composition"]
  },
  {
    theme: "Nature",
    description: "Floral & organic",
    promptEnhancer: "in a nature-inspired style with organic shapes and natural elements",
    examples: ["floral patterns", "organic shapes", "natural colors", "botanical elements"]
  },
  {
    theme: "Urban",
    description: "Street & city vibes",
    promptEnhancer: "in an urban, street art style with bold graphics and city elements",
    examples: ["street art", "urban graphics", "bold typography", "city elements"]
  },
  {
    theme: "Tech",
    description: "Futuristic & digital",
    promptEnhancer: "in a futuristic, tech-inspired style with digital elements and modern aesthetics",
    examples: ["digital elements", "futuristic design", "tech aesthetics", "modern graphics"]
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
    setSelectedTheme(theme);
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