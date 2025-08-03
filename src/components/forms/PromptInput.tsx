import { Textarea } from "@/components/ui/textarea";
import { useShirtData } from "@/context/ShirtDataContext";
import { useRef, useEffect, useState } from "react";

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  fullPrompt?: string; // The complete prompt including system prompt and enhancements
  activeThemes?: string[];
  onThemeRemove?: (theme: string) => void;
}

export function PromptInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Describe your shirt design...",
  fullPrompt,
  activeThemes = [],
  onThemeRemove,
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

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight, with min height of 8rem (128px)
      const newHeight = Math.max(128, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-h-32 w-full resize-none overflow-hidden rounded-lg border-0 bg-gray-50 p-4 text-base shadow-none transition-shadow duration-200 focus:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] focus:ring-0 sm:text-xl"
          disabled={!isAuthenticated}
        />

        {/* Active Theme Chips - Desktop */}
        {activeThemes.length > 0 && isAuthenticated && (
          <>
            {/* Desktop: Show individual theme chips */}
            <div className="absolute bottom-3 left-3 hidden flex-wrap gap-1 sm:flex">
              {activeThemes.slice(0, 3).map(theme => (
                <button
                  key={theme}
                  onClick={() => onThemeRemove?.(theme)}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-100 hover:shadow-md"
                >
                  {theme}
                </button>
              ))}
              {activeThemes.length > 3 && (
                <div className="rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  +{activeThemes.length - 3} more
                </div>
              )}
            </div>

            {/* Mobile: Show simple +n indicator */}
            <div className="absolute right-3 bottom-3 sm:hidden">
              <span className="text-xs font-medium text-blue-600">
                +{activeThemes.length}
              </span>
            </div>
          </>
        )}

        {/* Full Prompt Tooltip - Triggered by +n indicator */}
        {fullPrompt && isAuthenticated && activeThemes.length > 0 && (
          <div className="absolute right-3 bottom-3">
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 sm:hidden"
              >
                +{activeThemes.length}
              </button>

              {showTooltip && (
                <div className="fixed inset-x-4 top-4 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-8 sm:w-96">
                  <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-800 p-3 text-xs text-white shadow-xl">
                    <div className="mb-2 font-semibold">
                      Full Prompt Preview:
                    </div>
                    <div className="break-words whitespace-pre-wrap">
                      {fullPrompt}
                    </div>
                    {/* Arrow pointing down - only on desktop */}
                    <div className="absolute right-4 -bottom-1 hidden h-2 w-2 rotate-45 bg-gray-800 sm:block"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
