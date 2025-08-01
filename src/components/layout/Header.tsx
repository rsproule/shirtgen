import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({ 
  title = "InstaShirt", 
  showBackButton = false, 
  onBack 
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      {showBackButton ? (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      ) : (
        <div className="w-20" />
      )}
      
      <h1 className="text-2xl font-light text-gray-900">{title}</h1>
      <div className="w-20" /> {/* Spacer for centering */}
    </div>
  );
}