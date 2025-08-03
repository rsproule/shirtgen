import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { useShirtData } from "@/context/ShirtDataContext";

interface ActionButtonsProps {
  onGenerate: () => void;
  promptLength: number;
}

export function ActionButtons({
  onGenerate,
  promptLength,
}: ActionButtonsProps) {
  const { isAuthenticated } = useShirtData();

  const handleGenerate = () => {
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
        disabled={!isAuthenticated || promptLength < 10}
        disabledAnimation={!isAuthenticated || promptLength < 10}
        className={`text-white ${
          !isAuthenticated || promptLength < 10
            ? "cursor-not-allowed bg-muted"
            : "bg-black"
        }`}
      >
        Generate Design
      </PulsatingButton>
    </div>
  );
}
