import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShirtData } from "@/context/ShirtDataContext";

export function SaveButton() {
  const { shirtData } = useShirtData();

  const handleSave = async () => {
    // Disabled for now - just log the action
    console.log("Save button clicked", shirtData);
  };

  const isDisabled =
    !shirtData?.imageUrl ||
    !shirtData?.prompt ||
    shirtData?.isPartial !== false;
  const isProcessing = false;

  return (
    <Button
      onClick={handleSave}
      disabled={isDisabled}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isProcessing
        ? "Saving..."
        : shirtData?.isPartial
          ? "Generating..."
          : "Save"}
    </Button>
  );
}
