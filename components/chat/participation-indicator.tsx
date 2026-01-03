"use client";

interface ParticipationIndicatorProps {
  respondingCount: number;
  totalCount: number;
  threshold: number;
}

export function ParticipationIndicator({
  respondingCount,
  totalCount,
  threshold,
}: ParticipationIndicatorProps) {
  if (totalCount <= 1) {
    // Don't show indicator if only one model could respond
    return null;
  }

  const percentage = Math.round((respondingCount / totalCount) * 100);
  const thresholdPercentage = Math.round(threshold * 100);

  return (
    <div className="w-full py-2 px-4 bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {respondingCount}/{totalCount} models chose to respond
          </span>
          <span className="opacity-60">
            ({percentage}% • threshold: {thresholdPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
}
