import { useEffect, useRef, useState } from "react";
import type { TypingStats } from "@/types";

export function useTypingStats(prompt: string) {
  const [typingStats, setTypingStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    timeTyping: 0,
    correctChars: 0,
    totalChars: 0,
  });

  const typingStartRef = useRef<number | null>(null);
  const lastKeystrokeRef = useRef<number>(Date.now());
  const totalActiveTimeRef = useRef<number>(0);
  const lastActiveCheckRef = useRef<number>(Date.now());

  // Update typing stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (typingStartRef.current) {
        const now = Date.now();
        const timeSinceLastKeystroke = now - lastKeystrokeRef.current;

        // If actively typing (less than 2 seconds since last keystroke)
        if (timeSinceLastKeystroke < 2000) {
          const timeSinceLastCheck = now - lastActiveCheckRef.current;
          totalActiveTimeRef.current += timeSinceLastCheck;
        }

        lastActiveCheckRef.current = now;

        // Calculate WPM based on active time only
        const activeTimeMin = totalActiveTimeRef.current / 60000;
        const wordCount = prompt
          .split(" ")
          .filter((word) => word.length > 0).length;

        setTypingStats((prev) => ({
          ...prev,
          timeTyping: Math.floor(totalActiveTimeRef.current / 1000), // active time in seconds
          wpm: activeTimeMin > 0 ? Math.round(wordCount / activeTimeMin) : 0,
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [prompt]);

  const handleInputChange = (newValue: string) => {
    const now = Date.now();

    // Reset everything if prompt is completely cleared
    if (newValue.length === 0) {
      typingStartRef.current = null;
      totalActiveTimeRef.current = 0;
      lastActiveCheckRef.current = now;
      setTypingStats({
        wpm: 0,
        accuracy: 100,
        timeTyping: 0,
        correctChars: 0,
        totalChars: 0,
      });
    } else {
      // Start timing if this is the first character
      if (!typingStartRef.current) {
        typingStartRef.current = now;
        totalActiveTimeRef.current = 0;
        lastActiveCheckRef.current = now;
      }

      // Add time since last keystroke to active time (if reasonable)
      const timeSinceLastKeystroke = now - lastKeystrokeRef.current;
      if (timeSinceLastKeystroke < 2000) {
        // Only count if less than 2 seconds gap
        totalActiveTimeRef.current += timeSinceLastKeystroke;
      }

      // Update stats immediately
      const activeTimeMin = totalActiveTimeRef.current / 60000;
      const wordCount = newValue
        .split(" ")
        .filter((word) => word.length > 0).length;

      setTypingStats((prev) => ({
        ...prev,
        timeTyping: Math.floor(totalActiveTimeRef.current / 1000),
        wpm: activeTimeMin > 0 ? Math.round(wordCount / activeTimeMin) : 0,
      }));
    }

    lastKeystrokeRef.current = now;
    lastActiveCheckRef.current = now;
  };

  const setPromptWithoutStats = () => {
    // This function is called when setting prompt without affecting typing stats
    // Used when selecting from history or other non-typing actions
    // The actual prompt value is set directly in the parent component
    // This function exists to maintain the API consistency but doesn't need to do anything
  };

  return { typingStats, handleInputChange, setPromptWithoutStats };
}