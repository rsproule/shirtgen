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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Publish Design
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-gray-600">
            Ready to share "{designName}" with the world?
          </p>

          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">Coming Soon!</h4>
            <p className="text-sm text-gray-600">
              Publishing to external platforms will be available in a future
              update. For now, you can download your design and share it
              manually.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Share Manually
          </Button>
          <Button onClick={onClose} className="flex-1" size="sm">
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

  const isDisabled =
    !shirtData?.imageUrl ||
    !shirtData?.prompt ||
    shirtData?.isPartial !== false;

  return (
    <>
      <Button
        onClick={handlePublish}
        disabled={isDisabled}
        size="sm"
        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        <Share2 className="h-4 w-4" />
        {shirtData?.isPartial ? "Generating..." : "Publish"}
      </Button>

      <PublishModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        designName={
          shirtData?.prompt?.substring(0, 30) + "..." || "Untitled Design"
        }
      />
    </>
  );
}
