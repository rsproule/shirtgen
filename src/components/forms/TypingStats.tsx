import type { TypingStats as TypingStatsType } from "@/types";

interface TypingStatsProps {
  stats: TypingStatsType;
  promptLength: number;
}

export function TypingStats({ stats, promptLength }: TypingStatsProps) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs">
      <div className="flex space-x-3">
        <span className="font-medium text-blue-600">{stats.wpm}wpm</span>
        <span className="font-medium text-green-600">{stats.timeTyping}s</span>
        <span className="font-medium text-purple-600">{promptLength}</span>
      </div>
      <div className="text-xs text-gray-400">⌘↵</div>
    </div>
  );
}
