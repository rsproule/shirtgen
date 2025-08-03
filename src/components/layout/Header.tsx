import { Button } from "@/components/ui/button";
import { Branding } from "@/components/ui/branding";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  showBranding?: boolean;
}

export function Header({
  showBackButton = false,
  onBack,
  showBranding = false,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="border-border border-b">
      {/* Navigation row */}
      <div className="flex items-center justify-between px-6 py-3">
        {showBackButton ? (
          <Button
            variant="ghost"
            onClick={handleBack}
            size="sm"
            className="text-muted-foreground hover:text-foreground flex h-8 items-center gap-1 px-2 py-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="text-sm">Back</span>
          </Button>
        ) : (
          <div />
        )}
        <div /> {/* This will be filled by buttons from parent component */}
      </div>

      {/* Branding section for pages that need it */}
      {showBranding && (
        <div className="flex justify-center pb-3">
          <Branding size="small" onClick={handleLogoClick} />
        </div>
      )}
    </div>
  );
}
