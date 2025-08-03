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
    description: "Film camera",
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
    description: "Film aesthetic",
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
    description: "High contrast",
    promptEnhancers: [
      "in ultra-realistic high-contrast black-and-white style with dramatic lighting and 35mm lens quality",
      "high-contrast black-and-white aesthetic, ultra-realistic style, dramatic lighting, 35mm lens quality",
      "ultra-realistic B&W style, high-contrast aesthetic, dramatic lighting, 35mm lens quality",
      "black-and-white portrait style, ultra-realistic aesthetic, high-contrast dramatic lighting, 35mm lens",
    ],
    examples: ["black and white", "high contrast", "35mm lens", "4K quality"],
    keyword: "black and white",
  },
  {
    theme: "Vintage",
    description: "Retro designs",
    promptEnhancers: [
      "in a vintage retro t-shirt design style with distressed graphics and nostalgic 80s/90s aesthetic",
      "vintage t-shirt design aesthetic, retro graphics style, distressed and nostalgic 80s/90s look",
      "retro vintage, distressed graphics aesthetic, nostalgic 80s/90s style",
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
    description: "Portrait studio",
    promptEnhancers: [
      "in cheesy 1980s mall glamour shot style with foggy soft lighting, teal and magenta color palette",
      "1980s mall glamour shot aesthetic, cheesy style, foggy soft lighting, teal and magenta color scheme",
      "cheesy 80s mall glamour shot style, foggy soft lighting, teal and magenta color palette",
      "80s mall portrait studio aesthetic, cheesy glamour shot style, foggy lighting, teal and magenta colors",
    ],
    examples: [
      "80s glamour",
      "mall portrait",
      "soft lighting",
      "teal and magenta",
    ],
    keyword: "80s glamour",
  },
  {
    theme: "Cyberpunk",
    description: "Neon futuristic",
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
    description: "Organic elegance",
    promptEnhancers: [
      "in an Art Nouveau style with flowing lines, organic shapes, and decorative elegance",
      "Art Nouveau aesthetic, flowing organic lines, decorative elegance",
      "flowing Art Nouveau style, organic shapes, decorative elegance",
      "organic Art Nouveau aesthetic, flowing lines, decorative elegance",
    ],
    examples: [
      "flowing lines",
      "organic shapes",
      "decorative elegance",
      "Art Nouveau",
    ],
    keyword: "art nouveau",
  },
  {
    theme: "Anime",
    description: "Animation style",
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
    description: "UPA animation",
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
    description: "Oil painting",
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
    description: "Line etching",
    promptEnhancers: [
      "in an engraving style with fine line etching technique, detailed cross-hatching, monochromatic tones, and intricate linework",
      "engraving aesthetic, fine line etching style, detailed cross-hatching, monochromatic tones, intricate linework",
      "fine line engraving, etching technique, detailed cross-hatching, monochromatic tones, intricate linework",
      "engraved style, fine line etching aesthetic, detailed cross-hatching, monochromatic tones, intricate linework",
    ],
    examples: ["engraving", "etching", "cross-hatching", "fine lines"],
    keyword: "engraving",
  },
  {
    theme: "Gothic",
    description: "Medieval aesthetic",
    promptEnhancers: [
      "in a gothic style with dark medieval aesthetic, dramatic shadows, ornate details, and mysterious atmosphere",
      "gothic aesthetic, dark medieval style, dramatic shadows, ornate details, mysterious atmosphere",
      "dark gothic style, medieval aesthetic, dramatic shadows, ornate details, mysterious atmosphere",
      "gothic medieval style, dark aesthetic, dramatic shadows, ornate details, mysterious atmosphere",
    ],
    examples: ["gothic", "medieval", "dark", "ornate"],
    keyword: "gothic",
  },
  {
    theme: "Pop Art",
    description: "Colorful style",
    promptEnhancers: [
      "in a pop art style with bold colors, high contrast, comic book aesthetic, and vibrant saturation",
      "pop art aesthetic, bold colorful style, high contrast, comic book aesthetic, vibrant saturation",
      "bold pop art style, high contrast colors, comic book aesthetic, vibrant saturation",
      "pop art comic style, bold colors, high contrast aesthetic, vibrant saturation",
    ],
    examples: ["pop art", "bold colors", "high contrast", "comic book"],
    keyword: "pop art",
  },
  {
    theme: "Film Noir",
    description: "Dramatic lighting",
    promptEnhancers: [
      "in a film noir style with dramatic shadows, high contrast black and white, moody lighting, and atmospheric darkness",
      "film noir aesthetic, dramatic shadow style, high contrast black and white, moody lighting, atmospheric darkness",
      "dark film noir style, dramatic shadows, high contrast black and white, moody lighting, atmospheric darkness",
      "noir film style, dramatic shadow aesthetic, high contrast black and white, moody lighting, atmospheric darkness",
    ],
    examples: ["film noir", "dramatic shadows", "high contrast", "moody"],
    keyword: "film noir",
  },
  {
    theme: "Polaroid",
    description: "Instant photo",
    promptEnhancers: [
      "in a polaroid style with vintage instant photo aesthetic, warm tones, soft focus, and nostalgic film quality",
      "polaroid aesthetic, vintage instant photo style, warm tones, soft focus, nostalgic film quality",
      "vintage polaroid style, instant photo aesthetic, warm tones, soft focus, nostalgic film quality",
      "polaroid instant style, vintage photo aesthetic, warm tones, soft focus, nostalgic film quality",
    ],
    examples: ["polaroid", "vintage", "warm tones", "soft focus"],
    keyword: "polaroid",
  },
  {
    theme: "Watercolor",
    description: "Painted style",
    promptEnhancers: [
      "in a watercolor style with soft painted aesthetic, flowing colors, transparent washes, and artistic brushwork",
      "watercolor aesthetic, soft painted style, flowing colors, transparent washes, artistic brushwork",
      "soft watercolor style, painted aesthetic, flowing colors, transparent washes, artistic brushwork",
      "watercolor painted style, soft aesthetic, flowing colors, transparent washes, artistic brushwork",
    ],
    examples: ["watercolor", "soft", "flowing colors", "transparent"],
    keyword: "watercolor",
  },
  {
    theme: "Sketch",
    description: "Pencil style",
    promptEnhancers: [
      "in a sketch style with hand-drawn pencil aesthetic, loose linework, rough texture, and artistic spontaneity",
      "sketch aesthetic, hand-drawn pencil style, loose linework, rough texture, artistic spontaneity",
      "hand-drawn sketch style, pencil aesthetic, loose linework, rough texture, artistic spontaneity",
      "pencil sketch style, hand-drawn aesthetic, loose linework, rough texture, artistic spontaneity",
    ],
    examples: ["sketch", "hand-drawn", "pencil", "loose lines"],
    keyword: "sketch",
  },
  {
    theme: "Surrealist",
    description: "Artistic style",
    promptEnhancers: [
      "in a surrealist style with dreamlike aesthetic, ethereal atmosphere, otherworldly lighting, and artistic imagination",
      "surrealist aesthetic, dreamlike style, ethereal atmosphere, otherworldly lighting, artistic imagination",
      "dreamlike surrealist style, ethereal aesthetic, otherworldly lighting, artistic imagination",
      "surrealist dream style, ethereal atmosphere, otherworldly lighting, artistic imagination",
    ],
    examples: ["surrealist", "dreamlike", "ethereal", "otherworldly"],
    keyword: "surrealist",
  },
  {
    theme: "Documentary",
    description: "Cinematic realism",
    promptEnhancers: [
      "in a documentary style with cinematic realism, natural lighting, authentic atmosphere, and observational photography",
      "documentary aesthetic, cinematic realism style, natural lighting, authentic atmosphere, observational photography",
      "cinematic documentary style, realism aesthetic, natural lighting, authentic atmosphere, observational photography",
      "documentary cinematic style, realism aesthetic, natural lighting, authentic atmosphere, observational photography",
    ],
    examples: ["documentary", "cinematic", "natural lighting", "authentic"],
    keyword: "documentary",
  },
  {
    theme: "Double Exposure",
    description: "Photographic effect",
    promptEnhancers: [
      "in a double exposure style with layered photographic effect, overlapping imagery, transparent blending, and artistic layering",
      "double exposure aesthetic, layered photographic style, overlapping imagery, transparent blending, artistic layering",
      "layered double exposure style, photographic effect, overlapping imagery, transparent blending, artistic layering",
      "double exposure photographic style, layered aesthetic, overlapping imagery, transparent blending, artistic layering",
    ],
    examples: ["double exposure", "layered", "overlapping", "transparent"],
    keyword: "double exposure",
  },
  {
    theme: "Kawaii",
    description: "Japanese aesthetic",
    promptEnhancers: [
      "in a kawaii style with cute Japanese aesthetic, pastel colors, soft lighting, and adorable charm",
      "kawaii aesthetic, cute Japanese style, pastel colors, soft lighting, adorable charm",
      "cute kawaii style, Japanese aesthetic, pastel colors, soft lighting, adorable charm",
      "kawaii Japanese style, cute aesthetic, pastel colors, soft lighting, adorable charm",
    ],
    examples: ["kawaii", "cute", "pastel colors", "soft lighting"],
    keyword: "kawaii",
  },
  {
    theme: "Cottage Core",
    description: "Romantic aesthetic",
    promptEnhancers: [
      "in a cottage core style with rustic romantic aesthetic, warm natural lighting, earthy tones, and pastoral charm",
      "cottage core aesthetic, rustic romantic style, warm natural lighting, earthy tones, pastoral charm",
      "rustic cottage core style, romantic aesthetic, warm natural lighting, earthy tones, pastoral charm",
      "cottage core romantic style, rustic aesthetic, warm natural lighting, earthy tones, pastoral charm",
    ],
    examples: ["cottage core", "rustic", "warm lighting", "earthy tones"],
    keyword: "cottage core",
  },
  {
    theme: "Long Exposure",
    description: "Blur photography",
    promptEnhancers: [
      "in a long exposure style with motion blur photography, flowing light trails, ethereal movement, and artistic blur effects",
      "long exposure aesthetic, motion blur photography style, flowing light trails, ethereal movement, artistic blur effects",
      "motion blur long exposure style, photography aesthetic, flowing light trails, ethereal movement, artistic blur effects",
      "long exposure photography style, motion blur aesthetic, flowing light trails, ethereal movement, artistic blur effects",
    ],
    examples: ["long exposure", "motion blur", "light trails", "flowing"],
    keyword: "long exposure",
  },
  {
    theme: "Ukiyo-e",
    description: "Japanese woodblock",
    promptEnhancers: [
      "in a ukiyo-e style with traditional Japanese woodblock aesthetic, flat colors, bold outlines, and classical composition",
      "ukiyo-e aesthetic, traditional Japanese woodblock style, flat colors, bold outlines, classical composition",
      "traditional ukiyo-e style, Japanese woodblock aesthetic, flat colors, bold outlines, classical composition",
      "ukiyo-e woodblock style, traditional Japanese aesthetic, flat colors, bold outlines, classical composition",
    ],
    examples: ["ukiyo-e", "woodblock", "flat colors", "bold outlines"],
    keyword: "ukiyo-e",
  },
  {
    theme: "Vaporwave",
    description: "Futuristic aesthetic",
    promptEnhancers: [
      "in a vaporwave style with retro-futuristic aesthetic, neon pink and cyan colors, glitch effects, and 80s nostalgia",
      "vaporwave aesthetic, retro-futuristic style, neon pink and cyan colors, glitch effects, 80s nostalgia",
      "retro-futuristic vaporwave style, neon pink and cyan aesthetic, glitch effects, 80s nostalgia",
      "vaporwave retro style, futuristic aesthetic, neon pink and cyan colors, glitch effects, 80s nostalgia",
    ],
    examples: ["vaporwave", "retro-futuristic", "neon pink", "cyan"],
    keyword: "vaporwave",
  },
  {
    theme: "Dark Academia",
    description: "Scholarly aesthetic",
    promptEnhancers: [
      "in a dark academia style with moody scholarly aesthetic, rich browns and golds, dramatic shadows, and intellectual atmosphere",
      "dark academia aesthetic, moody scholarly style, rich browns and golds, dramatic shadows, intellectual atmosphere",
      "moody dark academia style, scholarly aesthetic, rich browns and golds, dramatic shadows, intellectual atmosphere",
      "dark academia scholarly style, moody aesthetic, rich browns and golds, dramatic shadows, intellectual atmosphere",
    ],
    examples: ["dark academia", "moody", "rich browns", "golds"],
    keyword: "dark academia",
  },
  {
    theme: "Sci-Fi",
    description: "Design aesthetic",
    promptEnhancers: [
      "in a sci-fi style with futuristic design aesthetic, sleek metallic surfaces, advanced technology lighting, and otherworldly atmosphere",
      "sci-fi aesthetic, futuristic design style, sleek metallic surfaces, advanced technology lighting, otherworldly atmosphere",
      "futuristic sci-fi style, design aesthetic, sleek metallic surfaces, advanced technology lighting, otherworldly atmosphere",
      "sci-fi design style, futuristic aesthetic, sleek metallic surfaces, advanced technology lighting, otherworldly atmosphere",
    ],
    examples: ["sci-fi", "futuristic", "metallic", "advanced lighting"],
    keyword: "sci-fi",
  },
  {
    theme: "Tattoo",
    description: "Ink aesthetic",
    promptEnhancers: [
      "in a tattoo style with traditional ink aesthetic, bold black outlines, solid colors, and permanent art quality",
      "tattoo aesthetic, traditional ink style, bold black outlines, solid colors, permanent art quality",
      "traditional tattoo style, ink aesthetic, bold black outlines, solid colors, permanent art quality",
      "tattoo ink style, traditional aesthetic, bold black outlines, solid colors, permanent art quality",
    ],
    examples: ["tattoo", "traditional", "bold outlines", "solid colors"],
    keyword: "tattoo",
  },
  {
    theme: "Charcoal",
    description: "Charcoal drawing",
    promptEnhancers: [
      "in a charcoal style with soft monochromatic drawing aesthetic, rich blacks and grays, smudged textures, and artistic depth",
      "charcoal aesthetic, soft monochromatic drawing style, rich blacks and grays, smudged textures, artistic depth",
      "soft charcoal style, monochromatic drawing aesthetic, rich blacks and grays, smudged textures, artistic depth",
      "charcoal drawing style, soft monochromatic aesthetic, rich blacks and grays, smudged textures, artistic depth",
    ],
    examples: ["charcoal", "monochromatic", "rich blacks", "smudged"],
    keyword: "charcoal",
  },
  {
    theme: "Mid-Century Modern",
    description: "Geometric aesthetic",
    promptEnhancers: [
      "in a mid-century modern style with clean geometric aesthetic, warm earth tones, organic curves, and minimalist elegance",
      "mid-century modern aesthetic, clean geometric style, warm earth tones, organic curves, minimalist elegance",
      "clean mid-century modern style, geometric aesthetic, warm earth tones, organic curves, minimalist elegance",
      "mid-century modern geometric style, clean aesthetic, warm earth tones, organic curves, minimalist elegance",
    ],
    examples: ["mid-century modern", "geometric", "earth tones", "minimalist"],
    keyword: "mid-century modern",
  },
];

export function useThemeSuggestions() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Sort themes alphabetically
  const sortedThemeSuggestions = [...themeSuggestions].sort((a, b) => 
    a.theme.localeCompare(b.theme)
  );

  const getThemeSuggestion = (theme: string): ThemeSuggestion | undefined => {
    return sortedThemeSuggestions.find(t => t.theme === theme);
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
    themeSuggestions: sortedThemeSuggestions,
  };
}
