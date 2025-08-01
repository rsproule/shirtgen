import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  EchoSignIn,
  EchoTokenPurchase,
  useEcho,
  useEchoOpenAI,
} from "@zdql/echo-react-sdk";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeTyping: number;
  correctChars: number;
  totalChars: number;
}

export function InputForm() {
  const navigate = useNavigate();
  const { isAuthenticated } = useEcho();
  const { openai } = useEchoOpenAI();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [typingStats, setTypingStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    timeTyping: 0,
    correctChars: 0,
    totalChars: 0,
  });

  // All loading videos to display
  const loadingVideos = [
    "/loading-video-ss.mp4",
    "/loading-video-2.mp4",
    "/loading-video-3.mp4",
  ];

  // Random video for mobile
  const [mobileVideo] = useState(() => {
    return loadingVideos[Math.floor(Math.random() * loadingVideos.length)];
  });

  const typingStartRef = useRef<number | null>(null);
  const lastKeystrokeRef = useRef<number>(Date.now());
  const totalActiveTimeRef = useRef<number>(0);
  const lastActiveCheckRef = useRef<number>(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update typing stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (typingStartRef.current) {
        const now = Date.now();
        const timeSinceLastKeystroke = now - lastKeystrokeRef.current;

        // If actively typing (less than 2 seconds since last keystroke)
        if (timeSinceLastKeystroke < 2000) {
          const timeSinceLastCheck = now - lastActiveCheckRef.current;
          totalActiveTimeRef.current += timeSinceLastCheck;
        }

        lastActiveCheckRef.current = now;

        // Calculate WPM based on active time only
        const activeTimeMin = totalActiveTimeRef.current / 60000;
        const wordCount = prompt
          .split(" ")
          .filter((word) => word.length > 0).length;

        setTypingStats((prev) => ({
          ...prev,
          timeTyping: Math.floor(totalActiveTimeRef.current / 1000), // active time in seconds
          wpm: activeTimeMin > 0 ? Math.round(wordCount / activeTimeMin) : 0,
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [prompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const now = Date.now();

    // Reset everything if prompt is completely cleared
    if (newValue.length === 0) {
      typingStartRef.current = null;
      totalActiveTimeRef.current = 0;
      lastActiveCheckRef.current = now;
      setTypingStats({
        wpm: 0,
        accuracy: 100,
        timeTyping: 0,
        correctChars: 0,
        totalChars: 0,
      });
    } else {
      // Start timing if this is the first character
      if (!typingStartRef.current) {
        typingStartRef.current = now;
        totalActiveTimeRef.current = 0;
        lastActiveCheckRef.current = now;
      }

      // Add time since last keystroke to active time (if reasonable)
      const timeSinceLastKeystroke = now - lastKeystrokeRef.current;
      if (timeSinceLastKeystroke < 2000) {
        // Only count if less than 2 seconds gap
        totalActiveTimeRef.current += timeSinceLastKeystroke;
      }

      // Update stats immediately
      const activeTimeMin = totalActiveTimeRef.current / 60000;
      const wordCount = newValue
        .split(" ")
        .filter((word) => word.length > 0).length;

      setTypingStats((prev) => ({
        ...prev,
        timeTyping: Math.floor(totalActiveTimeRef.current / 1000),
        wpm: activeTimeMin > 0 ? Math.round(wordCount / activeTimeMin) : 0,
      }));
    }

    lastKeystrokeRef.current = now;
    lastActiveCheckRef.current = now;
    setPrompt(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to generate shirt designs");
      return;
    }

    if (prompt.length < 10) {
      alert("Please write at least 10 characters to describe your design");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a detailed prompt for image generation
      const imagePrompt = `Generate an image for: ${prompt}.`;

      // Use OpenAI responses API via Echo SDK
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: imagePrompt,
        tools: [{ type: "image_generation" }],
      });

      console.log("OpenAI response:", response);

      // Extract image data from the response
      const imageData = response.output
        .filter(
          (output: unknown) =>
            (output as { type: string }).type === "image_generation_call",
        )
        .map((output: unknown) => (output as { result: string }).result);

      if (imageData.length > 0) {
        // Convert base64 to data URL for display
        const imageBase64 = imageData[0];
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        // Navigate to view with image data in state
        navigate("/view", {
          state: {
            prompt: prompt,
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
    navigate("/view", {
      state: {
        prompt: "Debug: Gorilla image for testing",
        imageUrl: "/gorilla.jpg",
        generatedAt: new Date().toISOString(),
      },
    });
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center w-full">
          <p className="text-white text-lg lg:text-xl font-light mb-8">
            Creating your design... This may take a few seconds.
          </p>

          {/* Desktop: Show all 3 videos */}
          <div className="hidden lg:flex flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
            {loadingVideos.map((videoSrc) => (
              <video
                key={videoSrc}
                autoPlay
                loop
                muted
                className={`max-w-md w-full h-auto rounded-none shadow-lg ${
                  videoSrc === "/loading-video-3.mp4"
                    ? "border-1 border-white"
                    : ""
                }`}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            ))}
          </div>

          {/* Mobile: Show 1 random video */}
          <div className="lg:hidden flex justify-center">
            <video
              autoPlay
              loop
              muted
              className={`w-full max-w-sm h-auto rounded-none shadow-lg ${
                mobileVideo === "/loading-video-3.mp4"
                  ? "border-1 border-white"
                  : ""
              }`}
            >
              <source src={mobileVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with conditional auth positioning */}
      <div className="relative">
        {/* Title */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-6xl font-light text-gray-900 mb-2">InstaShirt</h1>
          <p className="text-gray-500">AI-powered shirt design</p>
        </div>

        {/* Auth Section - positioned based on login status */}
        {isAuthenticated ? (
          // Top right when logged in
          <div className="absolute top-4 right-4">
            <EchoTokenPurchase />
          </div>
        ) : (
          // Dead center when not logged in
          <div className="flex justify-center mt-6 mb-4">
            <EchoSignIn />
          </div>
        )}
      </div>

      {/* Main Input Area */}
      <div className="flex justify-center px-8 mt-8">
        <div className="w-full max-w-4xl">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your shirt design..."
            className="w-full h-64 text-xl p-8 border-2 border-gray-200 rounded-lg resize-none focus:border-gray-400 focus:ring-0 bg-gray-50"
            disabled={!isAuthenticated}
          />

          {/* Stats Bar */}
          <div className="flex justify-between items-center mt-3 text-xs">
            <div className="flex space-x-4">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {typingStats.wpm} WPM
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {typingStats.timeTyping}s
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {prompt.length} chars
              </span>
            </div>
            <div className="text-gray-400 text-xs">⌘ + ↵ to generate</div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            <Button
              onClick={handleSubmit}
              disabled={!isAuthenticated || prompt.length < 10}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-lg"
            >
              Generate Design
            </Button>

            <Button
              onClick={onDebugSubmit}
              variant="outline"
              className="px-8 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              Quick Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
