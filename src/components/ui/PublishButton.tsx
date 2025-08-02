import { useState } from "react";
import { Share2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShirtData } from "@/context/ShirtDataContext";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
}

function PublishModal({ isOpen, onClose, designName }: PublishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Publish Design
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Ready to share "{designName}" with the world?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-2">Coming Soon!</h4>
            <p className="text-sm text-gray-600">
              Publishing to external platforms will be available in a future update. 
              For now, you can download your design and share it manually.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Share Manually
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
            size="sm"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PublishButton() {
  const { shirtData } = useShirtData();
  const [showModal, setShowModal] = useState(false);

  const handlePublish = () => {
    setShowModal(true);
  };

  const isDisabled = !shirtData?.imageUrl || 
                     !shirtData?.prompt || 
                     shirtData?.isPartial !== false;

  return (
    <>
      <Button
        onClick={handlePublish}
        disabled={isDisabled}
        size="sm"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Share2 className="h-4 w-4" />
        {shirtData?.isPartial ? "Generating..." : "Publish"}
      </Button>

      <PublishModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        designName={shirtData?.prompt?.substring(0, 30) + "..." || "Untitled Design"}
      />
    </>
  );
}