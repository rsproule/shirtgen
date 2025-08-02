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
  onDismiss,
}: RecoveryPromptProps) {
  if (!recoveryData.hasUnsavedWork || !recoveryData.unsavedDesign) {
    return null;
  }

  const { unsavedDesign, timeAgo } = recoveryData;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Unsaved Work Detected
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-gray-600">
            You have unsaved changes from{" "}
            <span className="font-medium">{timeAgo}</span>
          </p>

          <div className="rounded-lg border bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Design: "{unsavedDesign.generatedName}"
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-gray-500">
              {unsavedDesign.prompt}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onRecover} className="flex-1" size="sm">
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
            className="text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
