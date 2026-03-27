"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Check, Sparkles } from "lucide-react";
import { InteractionCard } from "@/lib/scenarios";

interface SelectionCardProps {
  card: InteractionCard;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export function SelectionCard({ card, onConfirm, onCancel }: SelectionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(() => {
    // 默认选中推荐选项
    const recommended = card.options?.find((o) => o.is_recommend);
    return recommended?.value || null;
  });

  const handleConfirm = () => {
    if (selectedValue) {
      onConfirm(selectedValue);
    }
  };

  if (card.card_type === "SINGLE_SELECT") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-sm text-slate-600 mt-1">{card.description}</p>
          )}
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {card.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedValue(option.value)}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between",
                selectedValue === option.value
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedValue === option.value
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-slate-300"
                )}>
                  {selectedValue === option.value && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={clsx(
                    "font-medium",
                    selectedValue === option.value ? "text-indigo-900" : "text-slate-700"
                  )}>
                    {option.label}
                  </span>
                  {option.is_recommend && (
                    <span className="text-xs text-indigo-500 flex items-center gap-1 mt-0.5">
                      <Sparkles size={12} />
                      推荐
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedValue}
            className={clsx(
              "px-5 py-2 rounded-xl font-semibold transition-all duration-200",
              selectedValue
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            确认
          </button>
        </div>
      </div>
    );
  }

  return null;
}
