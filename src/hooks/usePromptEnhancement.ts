import { useState } from "react";
import { useEchoOpenAI } from "@zdql/echo-react-sdk";

interface PromptSuggestion {
  id: string;
  text: string;
  category: string;
}

export function usePromptEnhancement() {
  const { openai } = useEchoOpenAI();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);

  // Detect if a prompt is low-effort
  const isLowEffortPrompt = (prompt: string): boolean => {
    const trimmed = prompt.trim().toLowerCase();
    
    console.log("Checking prompt:", trimmed);
    
    // Check for very short prompts - make this more aggressive
    if (trimmed.length < 20) {
      console.log("Prompt too short:", trimmed.length);
      return true;
    }
    
    // Check for generic/vague terms
    const genericTerms = [
      "cool", "awesome", "nice", "good", "bad", "funny", "cute", "pretty",
      "ugly", "weird", "strange", "random", "something", "anything", "whatever"
    ];
    
    const hasGenericTerms = genericTerms.some(term => 
      trimmed.includes(term) && trimmed.split(" ").length <= 3
    );
    
    // Check for single words or very basic phrases
    if (trimmed.split(" ").length <= 3) {
      console.log("Prompt too few words:", trimmed.split(" ").length);
      return true;
    }
    
    // Check for repetitive patterns
    const words = trimmed.split(" ");
    const uniqueWords = new Set(words);
    if (words.length > 2 && uniqueWords.size <= 2) {
      console.log("Repetitive pattern detected");
      return true;
    }
    
    const result = hasGenericTerms;
    console.log("Is low effort:", result);
    return result;
  };

  // Generate varied suggestions for low-effort prompts
  const enhancePrompt = async (originalPrompt: string): Promise<PromptSuggestion[]> => {
    console.log("Enhance prompt called with:", originalPrompt);
    
    // Always show suggestions for any input
    if (originalPrompt.trim().length > 0) {
      console.log("Showing suggestions for any input");
      setIsEnhancing(true);
      
      try {
        const enhancementPrompt = `The user entered this prompt: "${originalPrompt}"

Please provide 3 varied, creative suggestions to help them develop their idea. Each suggestion should be:
- 15-40 words long
- Specific and descriptive
- Creative and unique
- NOT include any style tags, art styles, or technical specifications
- Focus on the core concept/idea
- Vary significantly from each other

Format your response as a JSON array with objects containing:
- "id": unique identifier
- "text": the suggestion text
- "category": what type of suggestion this is (e.g., "character", "scene", "concept", "action", "emotion")

Example format:
[
  {"id": "1", "text": "A mischievous cat wearing a tiny wizard hat", "category": "character"},
  {"id": "2", "text": "A cozy coffee shop with steam rising from cups", "category": "scene"}
]`;

        console.log("Calling OpenAI...");
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a creative assistant that helps users develop their ideas into more detailed, specific prompts. Focus on the core concept and avoid style specifications."
            },
            {
              role: "user",
              content: enhancementPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 400
        });

        const content = response.choices[0]?.message?.content;
        console.log("OpenAI response:", content);
        
        if (!content) {
          throw new Error("No response from LLM");
        }

        // Try to parse JSON from the response
        let parsedSuggestions: PromptSuggestion[] = [];
        try {
          // Extract JSON from the response (it might be wrapped in markdown)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            parsedSuggestions = JSON.parse(jsonMatch[0]);
            console.log("Parsed suggestions:", parsedSuggestions);
          } else {
            console.log("No JSON found, using fallback");
            // Fallback: create suggestions from the text
            const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
            parsedSuggestions = lines.slice(0, 3).map((line: string, index: number) => ({
              id: `fallback-${index + 1}`,
              text: line.replace(/^\d+\.\s*/, '').trim(),
              category: "suggestion"
            }));
          }
        } catch (parseError) {
          console.error("Failed to parse LLM response:", parseError);
          // Create fallback suggestions
          parsedSuggestions = [
            {
              id: "fallback-1",
              text: "A detailed character with unique personality traits and interesting background",
              category: "character"
            },
            {
              id: "fallback-2", 
              text: "An interesting scene with specific details, atmosphere, and mood",
              category: "scene"
            },
            {
              id: "fallback-3",
              text: "A creative concept with unexpected elements and unique details",
              category: "concept"
            }
          ];
        }

        console.log("Setting suggestions:", parsedSuggestions);
        setSuggestions(parsedSuggestions);
        console.log("Suggestions set, count:", parsedSuggestions.length);
        return parsedSuggestions;
      } catch (error) {
        console.error("Failed to enhance prompt:", error);
        // Show fallback suggestions even on error
        const fallbackSuggestions = [
          {
            id: "error-1",
            text: "A detailed character with unique personality traits and interesting background",
            category: "character"
          },
          {
            id: "error-2", 
            text: "An interesting scene with specific details, atmosphere, and mood",
            category: "scene"
          },
          {
            id: "error-3",
            text: "A creative concept with unexpected elements and unique details",
            category: "concept"
          }
        ];
        console.log("Setting fallback suggestions:", fallbackSuggestions);
        setSuggestions(fallbackSuggestions);
        console.log("Fallback suggestions set, count:", fallbackSuggestions.length);
        return fallbackSuggestions;
      } finally {
        console.log("Setting isEnhancing to false");
        setIsEnhancing(false);
      }
    }
    
    return [];
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  // Test function to manually trigger suggestions
  const testSuggestions = () => {
    const testSuggestions = [
      {
        id: "test-1",
        text: "A mischievous cat wearing a tiny wizard hat and casting spells",
        category: "character"
      },
      {
        id: "test-2",
        text: "A cozy coffee shop with steam rising from cups and warm lighting",
        category: "scene"
      },
      {
        id: "test-3",
        text: "A creative concept with unexpected elements and unique details",
        category: "concept"
      }
    ];
    setSuggestions(testSuggestions);
  };

  return {
    isLowEffortPrompt,
    enhancePrompt,
    suggestions,
    isEnhancing,
    clearSuggestions,
    testSuggestions
  };
} 