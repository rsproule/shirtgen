import { useShirtData } from "@/context/ShirtDataContext";
import { ImageGenerationStreamProcessor } from "@/hooks/streamProcessor";
import { useShirtHistory } from "@/hooks/useShirtHistory";
import { generateDataUrlHash } from "@/services/imageHash";
import { useNameGeneration } from "@/services/nameGeneration";
import type { ShirtData } from "@/types";
import { useEchoOpenAI } from "@merit-systems/echo-react-sdk";
import { useNavigate } from "react-router-dom";

// Type for Echo API request
type EchoStreamRequest = Record<string, unknown>;
type EchoStream = AsyncIterable<unknown>;

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
    base64Image?: string,
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
    } else if (base64Image) {
      // Image input mode
      input = [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: imagePrompt,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ];
    } else {
      // Text-only mode
      input = imagePrompt;
    }

    return {
      model: editResponseId ? "gpt-5" : "gpt-4o",
      input: input as string,
      stream: true,
      tools: [
        {
          type: "image_generation" as const,
          quality: editResponseId ? "high" : "low",
          size: "1024x1536",
          partial_images: 3,
          moderation: "low",
          input_fidelity: base64Image || editResponseId ? "high" : "low",
        },
      ],
    } as unknown; // Type assertion for custom Echo API format
  };

  // Core image generation logic
  const performImageGeneration = async (
    prompt: string,
    base64Image?: string,
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
        base64Image,
        editResponseId,
      );
      const stream = await openai.responses.create(
        requestConfig as unknown as EchoStreamRequest,
      );

      let hasNavigated = false;
      let responseId: string | undefined;

      const processor = new ImageGenerationStreamProcessor({
        onResponseId: id => {
          responseId = id;
        },
        onPartialImage: (imageUrl, partialIndex) => {
          const shirtData: ShirtData = {
            prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
            isPartial: partialIndex < 2,
            partialIndex,
            responseId,
          };

          setShirtData(shirtData);

          // Navigate on first partial image
          if (!hasNavigated) {
            navigate("/view");
            hasNavigated = true;
          }

          // Mark as final on last partial
          if (partialIndex >= 2) {
            const finalData = {
              ...shirtData,
              isPartial: false,
              partialIndex: -1,
            };
            setShirtData(finalData);
            setIsLoading(false);
            generateSmartTitle(prompt, imageUrl);
            onShirtComplete?.(finalData);
          }
        },
        onFinalImage: imageUrl => {
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

      await processor.processStream(stream as unknown as EchoStream);
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
  const generateImage = async (prompt: string, base64Image?: string) => {
    return performImageGeneration(prompt, base64Image);
  };

  const editImage = async (newPrompt: string, originalResponseId: string) => {
    return performImageGeneration(newPrompt, undefined, originalResponseId);
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
