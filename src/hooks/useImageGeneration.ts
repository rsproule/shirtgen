import { useShirtData } from "@/context/ShirtDataContext";
import { ImageGenerationStreamProcessor } from "@/hooks/streamProcessor";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { generateDataUrlHash } from "@/services/imageHash";
import { useNameGeneration } from "@/services/nameGeneration";
import type { ShirtData } from "@/types";
import { useEchoOpenAI } from "@merit-systems/echo-react-sdk";
import { useNavigate } from "react-router-dom";

type Quality = "high" | "medium" | "low";

const QUALITY_LEVELS: Record<
  Quality,
  {
    model: string;
    partial_images: number;
    quality: string;
  }
> = {
  high: {
    model: "gpt-5",
    partial_images: 3,
    quality: "high",
  },
  medium: {
    model: "gpt-4o",
    partial_images: 3,
    quality: "medium",
  },
  low: {
    model: "gpt-4o",
    partial_images: 3,
    quality: "low",
  },
};

export function useImageGeneration(
  onShirtComplete?: (shirtData: ShirtData) => void,
  onError?: (error: string) => void,
) {
  const { openai } = useEchoOpenAI();
  const navigate = useNavigate();
  const { setShirtData, setIsLoading, setShowInsufficientBalanceModal } =
    useShirtData();
  const { generateName } = useNameGeneration();
  const { updateExternalIds } = useShirtHistory();

  // Generate smart title in background
  const generateSmartTitle = async (prompt: string, imageUrl: string) => {
    try {
      const imageHash = await generateDataUrlHash(imageUrl);
      const generatedTitle = await generateName(prompt);
      await updateExternalIds(imageHash, { generatedTitle });
      console.log("✨ Generated smart title:", generatedTitle);
    } catch (error) {
      console.warn("Failed to generate smart title:", error);
    }
  };

  // Handle errors consistently
  const handleError = (error: string, originalError?: unknown) => {
    console.error("Image generation error:", originalError || error);
    setIsLoading(false);
    setShirtData(null);

    if (window.location.pathname === "/view") {
      navigate("/");
    }

    if (onError) {
      onError(error);
    } else {
      alert(error);
    }
  };

  // Create stream request configuration
  const createStreamRequest = (
    prompt: string,
    base64Images?: string[],
    quality: Quality = "high",
    editResponseId?: string,
  ) => {
    const imagePrompt = `Generate an image for: ${prompt}.
     
    IMPORTANT: DO NOT INCLUDE AN IMAGE ON A SHIRT. JUST INCLUDE THE IMAGE`;

    let input: unknown;

    if (editResponseId) {
      // Edit mode: reference previous generation
      input = [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
        {
          type: "image_generation_call",
          id: editResponseId,
        },
      ];
    } else if (base64Images && base64Images.length > 0) {
      // Image input mode
      const content = [
        {
          type: "input_text",
          text: imagePrompt,
        },
        ...base64Images.map(base64Image => ({
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64Image}`,
        })),
      ];

      input = [
        {
          role: "user",
          content,
        },
      ];
    } else {
      // Text-only mode
      input = imagePrompt;
    }

    return {
      model: QUALITY_LEVELS[quality].model,
      input: input as string,
      stream: true,
      tools: [
        {
          type: "image_generation" as const,
          quality: QUALITY_LEVELS[quality].quality,
          size: "1024x1536",
          partial_images: QUALITY_LEVELS[quality].partial_images,
          moderation: "low",
          input_fidelity:
            (base64Images && base64Images.length > 0) || editResponseId
              ? "high"
              : "low",
        },
      ],
    } as unknown; // Type assertion for custom Echo API format
  };

  // Core image generation logic
  const performImageGeneration = async (
    prompt: string,
    base64Images?: string[],
    quality?: Quality,
    editResponseId?: string,
  ) => {
    if (prompt.length < 10) {
      alert("Please write at least 10 characters to describe your design");
      return;
    }

    setIsLoading(true);

    try {
      openai.baseURL = "http://localhost:3070";

      const requestConfig = createStreamRequest(
        prompt,
        base64Images,
        quality,
        editResponseId,
      );
      const stream = await openai.responses.create(
        requestConfig as Parameters<typeof openai.responses.create>[0],
      );

      let hasNavigated = false;
      let responseId: string | undefined;
      let lastPartialImage:
        | { imageUrl: string; partialIndex: number }
        | undefined;

      const processor = new ImageGenerationStreamProcessor({
        onResponseId: id => {
          responseId = id;
        },
        onPartialImage: (imageUrl, partialIndex) => {
          console.log(`🖼️ Partial image received - Index: ${partialIndex}`);

          // Store the last partial image
          lastPartialImage = { imageUrl, partialIndex };

          const shirtData: ShirtData = {
            prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
            isPartial: true, // Always partial until response.completed
            partialIndex,
            responseId,
          };

          setShirtData(shirtData);

          // Navigate on first partial image
          if (!hasNavigated) {
            navigate("/view");
            hasNavigated = true;
          }
        },
        onResponseCompleted: () => {
          console.log(
            "🎯 Response completed - finalizing with last partial image",
          );

          if (lastPartialImage) {
            const finalData: ShirtData = {
              prompt,
              imageUrl: lastPartialImage.imageUrl,
              generatedAt: new Date().toISOString(),
              isPartial: false,
              partialIndex: -1,
              responseId,
            };

            setShirtData(finalData);
            setIsLoading(false);
            generateSmartTitle(prompt, lastPartialImage.imageUrl);
            onShirtComplete?.(finalData);
          } else {
            console.warn(
              "⚠️ Response completed but no partial images received",
            );
          }
        },
        onFinalImage: imageUrl => {
          console.log("🎯 Final image received via onFinalImage callback");
          const finalData: ShirtData = {
            prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
            responseId,
            isPartial: false,
            partialIndex: -1,
          };

          setShirtData(finalData);
          setIsLoading(false);
          generateSmartTitle(prompt, imageUrl);
          onShirtComplete?.(finalData);

          if (!hasNavigated) {
            navigate("/view");
          }
        },
        onError: error => {
          handleError(error);
        },
      });

      await processor.processStream(stream);
    } catch (apiError: unknown) {
      let errorMessage = "Failed to start image generation. Please try again.";

      const error = apiError as {
        message?: string;
        error?: { message?: string };
        status?: number;
      };

      if (error?.status === 401) {
        errorMessage = "Authentication failed. Please try logging in again.";
      } else if (error?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.status === 402) {
        setShowInsufficientBalanceModal(true);
        setIsLoading(false);
        return;
      } else if (error?.message || error?.error?.message) {
        errorMessage = error.message || error?.error?.message || errorMessage;
      }

      handleError(errorMessage, apiError);
    }
  };

  // Public API
  const generateImage = async (
    prompt: string,
    base64Images?: string[],
    quality?: Quality,
  ) => {
    return performImageGeneration(prompt, base64Images, quality);
  };

  const editImage = async (newPrompt: string, originalResponseId: string) => {
    return performImageGeneration(
      newPrompt,
      undefined,
      "high",
      originalResponseId,
    );
  };

  const generateDebugImage = (prompt: string) => {
    const shirtData: ShirtData = {
      prompt: prompt || "Debug: Gorilla image for testing",
      imageUrl: "/gorilla.jpg",
      generatedAt: new Date().toISOString(),
    };

    setShirtData(shirtData);
    onShirtComplete?.(shirtData);
    navigate("/view");
  };

  return { generateImage, editImage, generateDebugImage };
}
