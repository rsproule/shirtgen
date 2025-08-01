import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  EchoSignIn,
  EchoTokenPurchase,
  useEcho,
  useEchoOpenAI,
} from "@zdql/echo-react-sdk";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

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
  
  const typingStartRef = useRef<number | null>(null);
  const lastKeystrokeRef = useRef<number>(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update typing stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (typingStartRef.current) {
        const now = Date.now();
        const timeTypingMs = now - typingStartRef.current;
        const timeTypingMin = timeTypingMs / 60000;
        
        setTypingStats(prev => ({
          ...prev,
          timeTyping: Math.floor(timeTypingMs / 1000), // in seconds
          wpm: timeTypingMin > 0 ? Math.round((prompt.split(' ').length - 1) / timeTypingMin) : 0,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const now = Date.now();
    
    if (!typingStartRef.current && newValue.length > 0) {
      typingStartRef.current = now;
    }
    
    // Reset timer if stopped typing for more than 3 seconds
    if (now - lastKeystrokeRef.current > 3000 && newValue.length === 0) {
      typingStartRef.current = null;
      setTypingStats({
        wpm: 0,
        accuracy: 100,
        timeTyping: 0,
        correctChars: 0,
        totalChars: 0,
      });
    }
    
    lastKeystrokeRef.current = now;
    setPrompt(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
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
        .filter((output: any) => output.type === "image_generation_call")
        .map((output: any) => output.result);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <video
            autoPlay
            loop
            muted
            className="w-96 h-96 object-cover rounded-lg mb-4"
          >
            <source src="/loading-video-ss.mp4" type="video/mp4" />
          </video>
          <p className="text-white text-lg">Creating your design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-6xl font-light text-gray-900 mb-2">InstaShirt</h1>
        <p className="text-gray-500">AI-powered shirt design</p>
      </div>

      {/* Auth Section */}
      <div className="flex justify-center mb-8">
        {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
      </div>

      {/* Main Input Area */}
      <div className="flex-1 flex items-center justify-center px-8">
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
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <div className="flex space-x-8">
              <span>WPM: {typingStats.wpm}</span>
              <span>Time: {typingStats.timeTyping}s</span>
              <span>Chars: {prompt.length}</span>
            </div>
            <div className="text-gray-400">
              ⌘ + ↵ to generate
            </div>
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
