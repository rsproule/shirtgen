import { useShirtData } from "@/context/ShirtDataContext";
import { useEchoOpenAI } from "@zdql/echo-react-sdk";
import { useNavigate } from "react-router-dom";
import { useShirtHistory } from "./useShirtHistory";

export function useImageGeneration() {
  const { openai } = useEchoOpenAI();
  const navigate = useNavigate();
  const { setShirtData, setIsLoading } = useShirtData();
  const { addToHistory } = useShirtHistory();

  const generateImage = async (prompt: string) => {
    if (prompt.length < 10) {
      alert("Please write at least 10 characters to describe your design");
      return;
    }

    setIsLoading(true);

    try {
      // Create a detailed prompt for image generation
      const imagePrompt = `Generate an image for: ${prompt}.
     
      IMPORTANT: DO NOT INCLUDE AN IMAGE ON A SHIRT. JUST INCLUDE THE IMAGE
      `;

      // Use streaming OpenAI responses API via Echo SDK for partial images
      const stream = await openai.responses.create({
        model: "gpt-4o",
        input: imagePrompt,
        stream: true,
        tools: [
          {
            type: "image_generation",
            quality: "high",
            size: "1024x1536",
            partial_images: 3,
            moderation: "low",
          },
        ],
      });

      let hasNavigated = false;

      for await (const event of stream) {
        console.log("Stream event:", event);

        // Type assertion to handle the stream event types
        const streamEvent = event as {
          type: string;
          partial_image_b64?: string;
          partial_image_index?: number;
          result?: string;
        };

        if (
          streamEvent.type === "response.image_generation_call.partial_image"
        ) {
          const imageBase64 = streamEvent.partial_image_b64;
          const imageUrl = `data:image/png;base64,${imageBase64}`;
          const partialIndex = streamEvent.partial_image_index ?? 0;

          const shirtData = {
            prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
            isPartial: partialIndex < 2, // Mark as partial until final image
            partialIndex,
          };

          // Update context state with partial image
          setShirtData(shirtData);

          // Navigate on first partial image
          if (!hasNavigated) {
            navigate("/view");
            hasNavigated = true;
            // Keep loading state active for partial images
          }
        } else if (
          streamEvent.type === "response.image_generation_call.complete"
        ) {
          // Final complete image
          const imageData = streamEvent.result;
          if (imageData) {
            const imageUrl = `data:image/png;base64,${imageData}`;

            const finalShirtData = {
              prompt,
              imageUrl,
              generatedAt: new Date().toISOString(),
              isPartial: false,
              partialIndex: -1,
            };

            setShirtData(finalShirtData);
            // Save to history when image generation is complete
            addToHistory(finalShirtData);
            setIsLoading(false); // Stop loading on final image
          }
        }
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
    // Save debug image to history too
    addToHistory(shirtData);
    navigate("/view");
  };

  return { generateImage, generateDebugImage };
}
