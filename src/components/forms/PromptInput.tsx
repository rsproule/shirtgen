import { Textarea } from "@/components/ui/textarea";
import { useShirtData } from "@/context/ShirtDataContext";
import { useRef, useEffect, useState } from "react";
import { Info } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  fullPrompt?: string; // The complete prompt including system prompt and enhancements
}

export function PromptInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Describe your shirt design...",
  fullPrompt,
}: PromptInputProps) {
  const { isAuthenticated } = useShirtData();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-focus the textarea when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAuthenticated]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-32 w-full resize-none rounded-lg border-0 bg-gray-50 p-4 text-xl shadow-none transition-shadow duration-200 focus:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] focus:ring-0"
        disabled={!isAuthenticated}
      />
      
      {/* Full Prompt Tooltip */}
      {fullPrompt && isAuthenticated && (
        <div className="absolute bottom-2 right-2">
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-800 transition-colors"
            >
              <Info className="h-3 w-3" />
            </button>
            
            {showTooltip && (
              <div className="absolute bottom-8 right-0 z-50 w-96 max-w-screen-sm">
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-white shadow-lg">
                  <div className="mb-2 font-semibold">Full Prompt Preview:</div>
                  <div className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                    {fullPrompt}
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
