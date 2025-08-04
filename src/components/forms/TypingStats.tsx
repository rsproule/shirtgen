import type { TypingStats as TypingStatsType } from "@/types";

interface TypingStatsProps {
  stats: TypingStatsType;
  promptLength: number;
}

export function TypingStats({ stats, promptLength }: TypingStatsProps) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs">
      <div className="flex space-x-3">
        <span className="text-primary font-medium">{stats.wpm}wpm</span>
        <span className="font-medium text-green-600">{stats.timeTyping}s</span>
        <span className="text-accent-foreground font-medium">
          {promptLength}
        </span>
      </div>
      <div className="text-muted-foreground text-xs">⌘↵</div>
    </div>
  );
}
