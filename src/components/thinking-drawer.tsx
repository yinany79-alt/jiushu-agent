"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { X, Bot, Activity } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { SelectionCard } from "@/components/selection-card";
import { InteractionCard } from "@/lib/scenarios";

interface ThinkingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  thinkingContent: string;
  isTyping?: boolean;
  card?: InteractionCard | null;
  onCardConfirm?: (value: string) => void;
  onCardCancel?: () => void;
  children?: React.ReactNode;
}

export function ThinkingDrawer({
  isOpen,
  onClose,
  thinkingContent,
  isTyping = false,
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[480px] bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100">Agent 思考中</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Activity size={12} className={isTyping ? "animate-pulse text-emerald-400" : "text-slate-500"} />
                {isTyping ? "正在思考..." : "就绪"}
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
