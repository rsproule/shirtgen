import { useEchoOpenAI } from "@zdql/echo-react-sdk";
import { useNavigate } from "react-router-dom";
import { useShirtData } from "@/context/ShirtDataContext";
import type { ImageGenerationResponse } from "@/types";

export function useImageGeneration() {
  const { openai } = useEchoOpenAI();
  const navigate = useNavigate();
  const { setShirtData, setIsLoading } = useShirtData();

  const generateImage = async (prompt: string) => {
    if (prompt.length < 10) {
      alert("Please write at least 10 characters to describe your design");
      return;
    }

    setIsLoading(true);

    try {
      // Create a detailed prompt for image generation
      const imagePrompt = `Generate an image for: ${prompt}.`;

      // Use OpenAI responses API via Echo SDK
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: imagePrompt,
        tools: [{ type: "image_generation" }],
      }) as ImageGenerationResponse;

      console.log("OpenAI response:", response);

      // Extract image data from the response
      const imageData = response.output
        .filter(
          (output) => output.type === "image_generation_call",
        )
        .map((output) => output.result);

      if (imageData.length > 0) {
        // Convert base64 to data URL for display
        const imageBase64 = imageData[0];
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        const shirtData = {
          prompt,
          imageUrl,
          generatedAt: new Date().toISOString(),
        };

        // Update context state
        setShirtData(shirtData);

        // Navigate to view
        navigate("/view");
        
        // Keep loading state until navigation completes
        return;
      } else {
        throw new Error("No image data returned from OpenAI");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
      setIsLoading(false);
    }
  };

  const generateDebugImage = (prompt: string) => {
    const shirtData = {
      prompt: prompt || "Debug: Gorilla image for testing",
      imageUrl: "/gorilla.jpg",
      generatedAt: new Date().toISOString(),
    };

    setShirtData(shirtData);
    navigate("/view");
  };

  return { generateImage, generateDebugImage };
}