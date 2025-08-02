import { Textarea } from "@/components/ui/textarea";
import { useShirtData } from "@/context/ShirtDataContext";
import { useRef, useEffect } from "react";

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Describe your shirt design...",
}: PromptInputProps) {
  const { isAuthenticated } = useShirtData();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAuthenticated]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="h-32 w-full resize-none rounded-lg border-0 bg-gray-50 p-4 text-xl shadow-none transition-shadow duration-200 focus:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] focus:ring-0"
      disabled={!isAuthenticated}
    />
  );
}
