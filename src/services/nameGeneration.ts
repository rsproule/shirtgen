import { useEchoOpenAI } from "@zdql/echo-react-sdk";

export interface NameGenerationService {
  generateName: (prompt: string) => Promise<string>;
}

// Hook for name generation service
export function useNameGeneration(): NameGenerationService {
  const { openai } = useEchoOpenAI();

  const generateName = async (prompt: string): Promise<string> => {
    try {
      // Fallback to truncated prompt if anything goes wrong
      const fallbackName =
        prompt.length > 30
          ? prompt.substring(0, 30).trim() + "..."
          : prompt.trim();

      // Create a concise name generation prompt
      const namePrompt = `Generate a short, creative project name (3-5 words max) for this t-shirt design description: "${prompt}"

Example:
- "Create a dragon breathing fire" → "Dragon Fire Design"
- "Make a cute cat with sunglasses" → "Cool Cat Vibes"
- "Minimalist geometric pattern" → "Geometric Minimal"

Just return the name, nothing else:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use smaller, faster model for name generation
        messages: [
          {
            role: "user",
            content: namePrompt,
          },
        ],
        max_tokens: 20,
        temperature: 0.7,
      });

      const generatedName = response.choices[0]?.message?.content?.trim();

      if (generatedName && generatedName.length > 0) {
        // Clean up the generated name (remove quotes, extra punctuation)
        const cleanName = generatedName
          .replace(/^["']|["']$/g, "") // Remove surrounding quotes
          .replace(/[.!?]+$/, "") // Remove trailing punctuation
          .trim();

        return cleanName.length > 0 ? cleanName : fallbackName;
      }

      return fallbackName;
    } catch (error) {
      console.warn("Name generation failed, using fallback:", error);
      // Return truncated prompt as fallback
      return prompt.length > 30
        ? prompt.substring(0, 30).trim() + "..."
        : prompt.trim();
    }
  };

  return { generateName };
}

// Utility function to create a DesignConfig ID
export function generateDesignId(): string {
  return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
