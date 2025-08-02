import { useShirtData } from "@/context/ShirtDataContext";
import type { ShirtData } from "@/types";
import { useEchoOpenAI } from "@zdql/echo-react-sdk";
import { useNavigate } from "react-router-dom";

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export function useImageGeneration(
  onShirtComplete?: (shirtData: ShirtData) => void,
  onError?: (error: string) => void,
) {
  const { openai } = useEchoOpenAI();
  const navigate = useNavigate();
  const { setShirtData, setIsLoading } = useShirtData();

  const handleError = (error: string, originalError?: unknown) => {
    console.error("Image generation error:", originalError || error);
    setIsLoading(false);

    // Reset shirt data on error
    setShirtData(null);

    // Navigate back to home page if we're on view page
    if (window.location.pathname === "/view") {
      navigate("/");
    }

    if (onError) {
      onError(error);
    } else {
      // Fallback to alert if no error handler provided
      alert(error);
    }
  };

  const generateImage = async (prompt: string, uploadedImage?: File | null) => {
    if (prompt.length < 10) {
      alert("Please write at least 10 characters to describe your design");
      return;
    }

    setIsLoading(true);

    try {
      // Create a detailed prompt for image generation
      let imagePrompt = `Generate an image for: ${prompt}.
     
      IMPORTANT: DO NOT INCLUDE AN IMAGE ON A SHIRT. JUST INCLUDE THE IMAGE
      `;

      // If there's an uploaded image, modify the prompt to reference it
      if (uploadedImage) {
        imagePrompt = `Generate an image based on this reference image and the description: ${prompt}.
        
        Use the uploaded image as inspiration and reference for style, composition, or elements.
        IMPORTANT: DO NOT INCLUDE AN IMAGE ON A SHIRT. JUST INCLUDE THE IMAGE
        `;
      }

      let stream;
      try {
        // Convert uploaded image to base64 if it exists
        let imageInput = undefined;
        if (uploadedImage) {
          const base64Image = await fileToBase64(uploadedImage);
          imageInput = {
            type: "image_url",
            image_url: {
              url: base64Image,
            },
          };
        }

        // Use streaming OpenAI responses API via Echo SDK for partial images
        stream = await openai.responses.create({
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
          ...(imageInput && { images: [imageInput] }),
        });
      } catch (apiError: unknown) {
        let errorMessage =
          "Failed to start image generation. Please try again.";

        const error = apiError as any;
        if (error?.message?.includes("safety system")) {
          errorMessage =
            "Your request was blocked by content safety filters. Please try a different prompt that doesn't involve potentially harmful content.";
        } else if (error?.message?.includes("safety_violations")) {
          errorMessage =
            "Content policy violation detected. Please revise your prompt to avoid inappropriate content.";
        } else if (error?.message) {
          errorMessage = `Generation failed: ${error.message}`;
        } else if (error?.error?.message) {
          errorMessage = `API Error: ${error.error.message}`;
        } else if (error?.status === 401) {
          errorMessage =
            "Authentication failed. Please check your login status.";
        } else if (error?.status === 429) {
          errorMessage =
            "Rate limit exceeded. Please wait a moment and try again.";
        } else if (error?.status >= 500) {
          errorMessage = "Server error. Please try again in a few moments.";
        }

        return handleError(errorMessage, apiError);
      }

      let hasNavigated = false;
      let finalImageUrl = "";
      let streamErrorOccurred = false;

      try {
        for await (const event of stream) {
          console.log("Stream event:", event);

          // Type assertion to handle the stream event types
          const streamEvent = event as {
            type: string;
            partial_image_b64?: string;
            partial_image_index?: number;
            result?: string;
            error?: {
              message?: string;
              type?: string;
              code?: string;
            };
            response?: {
              error?: {
                message?: string;
                type?: string;
              };
            };
          };

          // Handle stream errors
          if (streamEvent.type === "error" || streamEvent.error) {
            streamErrorOccurred = true;
            const errorMessage =
              streamEvent.error?.message ||
              streamEvent.response?.error?.message ||
              "An error occurred during image generation";
            return handleError(
              `Generation Error: ${errorMessage}`,
              streamEvent,
            );
          }

          // Handle response-level errors
          if (
            streamEvent.type === "response.error" ||
            streamEvent.response?.error
          ) {
            streamErrorOccurred = true;
            const errorMessage =
              streamEvent.response?.error?.message || "Response error occurred";
            return handleError(`Response Error: ${errorMessage}`, streamEvent);
          }

          if (
            streamEvent.type === "response.image_generation_call.partial_image"
          ) {
            const imageBase64 = streamEvent.partial_image_b64;
            const imageUrl = `data:image/png;base64,${imageBase64}`;
            const partialIndex = streamEvent.partial_image_index ?? 0;

            // Track the latest image URL for final saving
            finalImageUrl = imageUrl;

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
          } else if (streamEvent.type === "response.completed") {
            // Response is fully complete - save the final state
            console.log(
              "Response completed, saving to history with image:",
              finalImageUrl,
            );

            if (finalImageUrl) {
              const finalShirtData = {
                prompt,
                imageUrl: finalImageUrl,
                generatedAt: new Date().toISOString(),
                isPartial: false,
                partialIndex: -1,
              };

              // Update final state
              setShirtData(finalShirtData);
              // Save to history
              onShirtComplete?.(finalShirtData);
            }

            setIsLoading(false);
          } else if (
            streamEvent.type === "response.image_generation_call.complete"
          ) {
            // Legacy handler - keeping for backward compatibility
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
              onShirtComplete?.(finalShirtData);
              setIsLoading(false);
            }
          }
        } // Close for await loop
      } catch (streamError: unknown) {
        if (!streamErrorOccurred) {
          let errorMessage = "Stream processing failed. Please try again.";

          const error = streamError as any;
          if (error?.message?.includes("network")) {
            errorMessage =
              "Network error during generation. Please check your connection and try again.";
          } else if (error?.message?.includes("timeout")) {
            errorMessage = "Generation timed out. Please try again.";
          } else if (error?.message) {
            errorMessage = `Stream Error: ${error.message}`;
          }

          return handleError(errorMessage, streamError);
        }
      }

      // If we reach here and no image was generated, it's an error
      if (!finalImageUrl && !streamErrorOccurred) {
        return handleError(
          "No image was generated. Please try again with a different prompt.",
        );
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      const err = error as any;
      if (err?.message?.includes("fetch")) {
        errorMessage =
          "Network connection failed. Please check your internet connection.";
      } else if (err?.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }

      return handleError(errorMessage, error);
    }
  };

  const generateDebugImage = (prompt: string) => {
    const shirtData = {
      prompt: prompt || "Debug: Gorilla image for testing",
      imageUrl: "/gorilla.jpg",
      generatedAt: new Date().toISOString(),
    };

    setShirtData(shirtData);
    // Notify parent component that shirt is complete
    onShirtComplete?.(shirtData);
    navigate("/view");
  };

  return { generateImage, generateDebugImage };
}
