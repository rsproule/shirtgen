import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecoveryPromptData } from "@/types/design";

interface RecoveryPromptProps {
  recoveryData: RecoveryPromptData;
  onRecover: () => void;
  onStartFresh: () => void;
  onDismiss: () => void;
}

export function RecoveryPrompt({ 
  recoveryData, 
  onRecover, 
  onStartFresh, 
  onDismiss 
}: RecoveryPromptProps) {
  if (!recoveryData.hasUnsavedWork || !recoveryData.unsavedDesign) {
    return null;
  }

  const { unsavedDesign, timeAgo } = recoveryData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Unsaved Work Detected
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            You have unsaved changes from <span className="font-medium">{timeAgo}</span>
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Design: "{unsavedDesign.generatedName}"
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {unsavedDesign.prompt}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onRecover}
            className="flex-1"
            size="sm"
          >
            Recover Work
          </Button>
          <Button
            onClick={onStartFresh}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Start Fresh
          </Button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}