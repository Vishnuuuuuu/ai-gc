"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";

interface ModelDecision {
  modelId: string;
  modelName: string;
  responsePressure: number;
  threshold: number;
  decision: "RESPOND" | "SILENT";
  reasoning?: string;
}

interface DebugPanelProps {
  decisions: ModelDecision[];
}

export function DebugPanel({ decisions }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (decisions.length === 0) return null;

  const respondingCount = decisions.filter(d => d.decision === "RESPOND").length;
  const silentCount = decisions.filter(d => d.decision === "SILENT").length;

  return (
    <div className="w-full border-l-4 border-purple-500 bg-purple-950/20 my-4">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-950/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Bug className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-sm text-purple-300">
            DEBUG: {respondingCount} RESPOND, {silentCount} SILENT
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-purple-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-purple-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {decisions.map((decision) => {
            const isResponding = decision.decision === "RESPOND";
            const pressurePercent = Math.round(decision.responsePressure * 100);
            const thresholdPercent = Math.round(decision.threshold * 100);
            const meetsThreshold = decision.responsePressure > decision.threshold;

            return (
              <div
                key={decision.modelId}
                className={`
                  font-mono text-xs p-3 rounded border-l-2
                  ${isResponding
                    ? 'bg-green-950/30 border-green-500'
                    : 'bg-gray-800/30 border-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {decision.modelName}
                    </span>
                    <span
                      className={`
                        px-2 py-0.5 rounded text-xs font-bold
                        ${isResponding
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-200'
                        }
                      `}
                    >
                      {decision.decision}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {pressurePercent}% {meetsThreshold ? '>' : '≤'} {thresholdPercent}%
                  </div>
                </div>

                <div className="space-y-1 text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">pressure:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isResponding ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${pressurePercent}%` }}
                      />
                    </div>
                    <span>{decision.responsePressure.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">threshold:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1 overflow-hidden relative">
                      <div
                        className="absolute h-full w-0.5 bg-yellow-500"
                        style={{ left: `${thresholdPercent}%` }}
                      />
                    </div>
                    <span>{decision.threshold.toFixed(2)}</span>
                  </div>

                  {decision.reasoning && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-gray-500">reason:</span>{" "}
                      <span className="text-gray-300">{decision.reasoning}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
