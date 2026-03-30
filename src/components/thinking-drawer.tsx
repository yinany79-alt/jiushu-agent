"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { X, Bot, Activity, Brain } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { SelectionCard } from "@/components/selection-card";
import { InteractionCard } from "@/lib/scenarios";

interface ThinkingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  thinkingContent: string;
  isTyping?: boolean;
  isThinking?: boolean;
  isExecuting?: boolean;
  currentProgress?: { current: number; total: number };
  card?: InteractionCard | null;
  onCardConfirm?: (value: string) => void;
  onCardCancel?: () => void;
  children?: React.ReactNode;
}

// 思考中省略号组件
function ThinkingEllipsis() {
  const [dotsdots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-emerald-400">
      {".".repeat(dotsdots)}
      <span className="opacity-0">{".".repeat(3 - dotsdots)}</span>
    </span>
  );
}

export function ThinkingDrawer({
  isOpen,
  onClose,
  thinkingContent,
  isTyping = false,
  isThinking = false,
  isExecuting = false,
  currentProgress,
  card,
  onCardConfirm,
  onCardCancel,
  children,
}: ThinkingDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [thinkingContent, card]);

  const getStatusText = () => {
    if (isExecuting) return "执行中";
    if (isTyping) return "正在输入...";
    if (isThinking) return "思考中";
    return "就绪";
  };

  const getProgressColor = () => {
    if (isExecuting) return "from-amber-500 to-orange-500";
    return "from-emerald-500 to-teal-500";
  };

  return (
    <>
      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[480px] bg-slate-900 z-40 shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
              isExecuting ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-500"
            )}>
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100">{isExecuting ? "Agent 执行中" : "Agent 思考中"}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Activity
                  size={12}
                  className={clsx(
                    isExecuting
                      ? "animate-pulse text-amber-400"
                      : isTyping || isThinking
                      ? "animate-pulse text-emerald-400"
                      : "text-slate-500"
                  )}
                />
                {getStatusText()}
                {!isExecuting && isThinking && <ThinkingEllipsis />}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        {currentProgress && currentProgress.total > 0 && (
          <div className="px-5 py-3 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Brain size={12} />
                执行进度
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {currentProgress.current} / {currentProgress.total}
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={clsx("h-full transition-all duration-300", `bg-gradient-to-r ${getProgressColor()}`)}
                style={{
                  width: `${(currentProgress.current / currentProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* Thinking Content */}
          {thinkingContent && (
            <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700">
              <Markdown content={thinkingContent} mode="action" />
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-400 animate-pulse align-middle rounded-sm mt-1" />
              )}
            </div>
          )}

          {/* Card Slot */}
          {card && (
            <div className="animate-slide-in-up">
              <SelectionCard
                card={card}
                onConfirm={onCardConfirm || (() => {})}
                onCancel={onCardCancel}
              />
            </div>
          )}

          {/* Extra Children (Loss Chart etc.) */}
          {children}
        </div>
      </div>
    </>
  );
}
