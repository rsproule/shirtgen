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
    <div className="flex justify-end mt-8">
      <PulsatingButton
        onClick={handleGenerate}
        disabled={!isAuthenticated || promptLength < 10}
        disabledAnimation={!isAuthenticated || promptLength < 10}
        className={`text-white ${!isAuthenticated || promptLength < 10 ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}
      >
        {!isAuthenticated 
          ? "Sign In to Generate" 
          : promptLength < 10 
          ? "Enter More Details" 
          : "Generate Design"
        }
      </PulsatingButton>
    </div>
  );
}
