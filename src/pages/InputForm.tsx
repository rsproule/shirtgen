import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from "@zdql/echo-react-sdk";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { EchoStyleWrapper } from "@/components/EchoStyleWrapper";

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
      // Create a detailed prompt for DALL-E 2
      const imagePrompt = `A high-quality t-shirt design featuring: ${data.prompt}. Clean, professional design suitable for printing on a t-shirt. White background, centered design.`;

      // Generate image using OpenAI via Echo (DALL-E 2)
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        // Store form data and image URL in localStorage
        localStorage.setItem(
          "shirtGenData",
          JSON.stringify({
            prompt: data.prompt,
            imageUrl,
            generatedAt: new Date().toISOString(),
          }),
        );

        navigate("/view");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Echo Authentication */}
        {!isAuthenticated && (
          <Card className="shadow-xl mb-6">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to start generating shirt designs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <EchoStyleWrapper>
                <EchoSignIn />
              </EchoStyleWrapper>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && (
          <Card className="shadow-xl mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <EchoStyleWrapper>
                  <EchoTokenPurchase />
                </EchoStyleWrapper>
              </div>
            </CardContent>
          </Card>
        )}

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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
