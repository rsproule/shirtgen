import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EchoSignIn,
  EchoTokenPurchase,
  useEcho,
  useEchoOpenAI,
} from "@zdql/echo-react-sdk";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe your shirt design (at least 10 characters)")
    .max(2000, "Prompt must be less than 2000 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function InputForm() {
  const navigate = useNavigate();
  const { isAuthenticated } = useEcho();
  const { openai } = useEchoOpenAI();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      alert("Please sign in to generate shirt designs");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a detailed prompt for image generation
      const imagePrompt = `Generate an image for: ${data.prompt}.`;

      // Use OpenAI responses API via Echo SDK
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: imagePrompt,
        tools: [{ type: "image_generation" }],
      });

      console.log("OpenAI response:", response);

      // Extract image data from the response
      const imageData = response.output
        .filter((output: any) => output.type === "image_generation_call")
        .map((output: any) => output.result);

      if (imageData.length > 0) {
        // Convert base64 to data URL for display
        const imageBase64 = imageData[0];
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        // Navigate to 3D view with image data in state
        navigate("/3d-view", {
          state: {
            prompt: data.prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
          },
        });
      } else {
        throw new Error("No image data returned from OpenAI");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDebugSubmit = () => {
    // Use gorilla.jpg for quick testing
    navigate("/3d-view", {
      state: {
        prompt: "Debug: Gorilla image for testing",
        imageUrl: "/gorilla.jpg",
        generatedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ShirtGen</h1>
          <p className="text-lg text-gray-600">
            Create amazing AI-generated shirt designs
          </p>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center">
          {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
        </div>

        <Card
          className={`shadow-xl ${
            !isAuthenticated ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="text-2xl">Design Your Shirt</CardTitle>
            <CardDescription className="text-base">
              Describe your ideal shirt design and let AI bring it to life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your shirt design in detail... 

For example:
• A minimalist mountain landscape with sunset colors
• Vintage 80s neon geometric patterns
• Abstract watercolor flowers in pastel tones
• Bold typography with inspirational quote
• Retro pixel art video game character

Be as creative and specific as you want!"
                          className="min-h-48 text-base resize-y text-left"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-600">
                        The more detailed your description, the better the AI
                        can create your perfect design. Include colors, style,
                        mood, and any specific elements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg py-6 font-semibold"
                    disabled={isSubmitting || !isAuthenticated}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Your Design...
                      </>
                    ) : (
                      "Generate Shirt Design ✨"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full text-lg py-4"
                    onClick={onDebugSubmit}
                  >
                    🦍 Debug Shirt (Gorilla)
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
