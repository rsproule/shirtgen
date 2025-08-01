import { Textarea } from "@/components/ui/textarea";
import { useShirtData } from "@/context/ShirtDataContext";
import { useRef } from "react";

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
  placeholder = "Describe your shirt design..." 
}: PromptInputProps) {
  const { isAuthenticated } = useShirtData();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full h-32 text-xl p-8 border-2 border-gray-200 rounded-lg resize-none focus:border-gray-400 focus:ring-0 bg-gray-50"
      disabled={!isAuthenticated}
    />
  );
}