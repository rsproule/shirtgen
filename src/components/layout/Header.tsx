import { Button } from "@/components/ui/button";
import { Branding } from "@/components/ui/branding";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({
  showBackButton = false,
  onBack,
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
    <div className="flex items-center justify-between border-b border-gray-200 p-6">
      {showBackButton ? (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div className="w-20" />
      )}
      <Branding size="small" />
      <div className="w-20" /> {/* Spacer for centering */}
    </div>
  );
}
