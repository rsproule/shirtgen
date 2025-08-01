import type { TypingStats as TypingStatsType } from "@/types";

interface TypingStatsProps {
  stats: TypingStatsType;
  promptLength: number;
}

export function TypingStats({ stats, promptLength }: TypingStatsProps) {
  return (
    <div className="flex justify-between items-center mt-2 text-xs">
      <div className="flex space-x-3">
        <span className="text-blue-600 font-medium">
          {stats.wpm}wpm
        </span>
        <span className="text-green-600 font-medium">
          {stats.timeTyping}s
        </span>
        <span className="text-purple-600 font-medium">
          {promptLength}
        </span>
      </div>
      <div className="text-gray-400 text-xs">⌘↵</div>
    </div>
  );
}