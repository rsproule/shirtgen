import { useEffect, useState } from "react";
import { useShirtData } from "@/context/ShirtDataContext";
import { useTypingStats } from "@/hooks/useTypingStats";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { AuthSection } from "@/components/auth/AuthSection";
import { PromptInput } from "@/components/forms/PromptInput";
import { PromptHistory } from "@/components/forms/PromptHistory";
import { TypingStats } from "@/components/forms/TypingStats";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { ShirtHistory } from "@/components/forms/ShirtHistory";

export function HomePage() {
  const { isLoading, setIsLoading } = useShirtData();
  const [prompt, setPrompt] = useState("");
  const { typingStats, handleInputChange, setPromptWithoutStats } = useTypingStats(prompt);
  const { generateImage } = useImageGeneration();
  const { addToHistory } = usePromptHistory();

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    handleInputChange(newValue);
    setPrompt(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    if (prompt.trim().length >= 10) {
      addToHistory(prompt);
    }
    generateImage(prompt);
  };

  const handleSelectFromHistory = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setPromptWithoutStats();
  };


  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with conditional auth positioning */}
      <div className="relative">
        {/* Title */}
        <div className="max-w-7xl mx-auto text-left pt-8 pb-4 px-8">
          <h1 className="text-6xl font-light text-gray-900 mb-2">InstaShirt</h1>
          <p className="text-gray-500">AI-powered shirt design</p>
        </div>

        {/* Auth Section */}
        <AuthSection />
      </div>

      {/* Main Input Area */}
      <div className="max-w-7xl mx-auto px-8 mt-8 w-full">
        {/* History Button - Top Right */}
        <div className="flex justify-end mb-1">
          <PromptHistory onSelectPrompt={handleSelectFromHistory} />
        </div>
        
        <PromptInput
          value={prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />

        {/* Stats Bar */}
        <TypingStats stats={typingStats} promptLength={prompt.length} />

        {/* Action Buttons */}
        <ActionButtons
          onGenerate={handleGenerate}
          promptLength={prompt.length}
        />

        {/* Shirt History */}
        <ShirtHistory />
      </div>
    </div>
  );
}