import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { useShirtData } from "@/context/useShirtData";

interface ActionButtonsProps {
  onGenerate: (enhancedPrompt?: string) => void;
  promptLength: number;
}

export function ActionButtons({
  onGenerate,
  promptLength,
}: ActionButtonsProps) {
  const { isAuthenticated } = useShirtData();

  const handleGenerate = () => {
    console.log(
      "Generate button clicked - isAuthenticated:",
      isAuthenticated,
      "promptLength:",
      promptLength,
    );
    if (!isAuthenticated) {
      alert("Please sign in to generate shirt designs");
      return;
    }
    onGenerate();
  };

  return (
    <div className="mt-8 flex justify-center sm:justify-end">
      <PulsatingButton
        onClick={handleGenerate}
        onTouchEnd={handleGenerate}
        disabled={!isAuthenticated || promptLength < 10}
        disabledAnimation={!isAuthenticated || promptLength < 10}
        pulseColor="var(--primary-light)"
        className={`text-primary-foreground touch-manipulation ${
          !isAuthenticated || promptLength < 10
            ? "bg-muted cursor-not-allowed"
            : "bg-primary"
        }`}
      >
        Generate Design
      </PulsatingButton>
    </div>
  );
}
