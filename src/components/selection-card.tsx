"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Check, Sparkles, ArrowRight, ChevronDown, Rocket, Download, FileText } from "lucide-react";
import { InteractionCard } from "@/lib/scenarios";

interface SelectionCardProps {
  card: InteractionCard;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export function SelectionCard({ card, onConfirm, onCancel }: SelectionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(() => {
    const recommended = card.options?.find((o) => o.is_recommend);
    return recommended?.value || null;
  });

  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    const recommended = card.options?.filter((o) => o.is_recommend).map((o) => o.value);
    return recommended || [];
  });

  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const values: Record<string, number> = {};
    card.slider_options?.forEach(opt => {
      values[opt.label] = opt.default;
    });
    return values;
  });

  const [dropdownValue, setDropdownValue] = useState<string>(() => {
    return card.dropdown_options?.[0]?.value || "";
  });

  const [buttonValue, setButtonValue] = useState<string | null>(null);

  const handleConfirm = () => {
    if (card.card_type === "CONFIRM") {
      onConfirm("continue");
    } else if (card.card_type === "SINGLE_SELECT" || card.card_type === "RECOMMENDED") {
      if (selectedValue) onConfirm(selectedValue);
    } else if (card.card_type === "MULTI_SELECT") {
      onConfirm(selectedValues.join(","));
    } else if (card.card_type === "DROPDOWN") {
      onConfirm(dropdownValue);
    } else if (card.card_type === "SLIDER") {
      onConfirm(JSON.stringify(sliderValues));
    } else if (card.card_type === "BUTTON_GROUP") {
      if (buttonValue) onConfirm(buttonValue);
    }
  };

  if (card.card_type === "CONFIRM") {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            {card.title || "继续"}
          </h3>
          {card.description && (
            <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/30 transition-all duration-200"
          >
            继续
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "RECOMMENDED") {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="p-3 space-y-2">
          {card.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedValue(option.value)}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between",
                selectedValue === option.value
                  ? "border-amber-500 bg-amber-900/40 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10"
                  : option.is_recommend
                  ? "border-slate-600 hover:border-amber-500/50 hover:bg-slate-700/50"
                  : "border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/30 opacity-60 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  selectedValue === option.value
                    ? "border-amber-400 bg-amber-500"
                    : "border-slate-500"
                )}>
                  {selectedValue === option.value && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={clsx(
                    "text-sm",
                    selectedValue === option.value ? "text-amber-100" : "text-slate-200"
                  )}>
                    {option.label}
                  </span>
                  {option.is_recommend && (
                    <span className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-medium">
                      <Sparkles size={10} className="fill-amber-400" />
                      强烈推荐
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedValue}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5",
              selectedValue
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            确认选择
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "MULTI_SELECT") {
    const maxSelections = 2;
    const canSelectMore = selectedValues.length < maxSelections;

    const toggleSelection = (value: string) => {
      if (selectedValues.includes(value)) {
        setSelectedValues(prev => prev.filter(v => v !== value));
      } else if (canSelectMore) {
        setSelectedValues(prev => [...prev, value]);
      }
    };

    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-violet-900/30 to-purple-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            {card.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            {card.description && (
              <p className="text-xs text-slate-400">{card.description}</p>
            )}
            <span className="text-xs text-violet-400 font-medium">
              已选择 {selectedValues.length}/{maxSelections}
            </span>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          {card.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isRecommended = option.is_recommend;
            return (
              <button
                key={option.value}
                onClick={() => toggleSelection(option.value)}
                disabled={!isSelected && !canSelectMore}
                className={clsx(
                  "w-full px-3 py-2.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between",
                  isSelected
                    ? "border-violet-500 bg-violet-900/40 ring-1 ring-violet-500/30"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/50",
                  !isSelected && !canSelectMore && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={clsx(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                    isSelected
                      ? "border-violet-400 bg-violet-500"
                      : "border-slate-500"
                  )}>
                    {isSelected && (
                      <Check size={10} className="text-white" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={clsx(
                      "text-sm",
                      isSelected ? "text-violet-200" : "text-slate-200"
                    )}>
                      {option.label}
                    </span>
                    {isRecommended && (
                      <span className="text-[11px] text-violet-400 flex items-center gap-1 mt-0.5">
                        <Sparkles size={8} />
                        推荐
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={selectedValues.length === 0}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              selectedValues.length > 0
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-500/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            确认
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "DROPDOWN") {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = card.dropdown_options?.find(o => o.value === dropdownValue);

    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-cyan-900/30 to-sky-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="p-3">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-left flex items-center justify-between hover:border-slate-500 transition-colors"
            >
              <span className="text-sm text-cyan-200">{selectedOption?.label}</span>
              <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-600 bg-slate-800 shadow-lg z-10 max-h-48 overflow-y-auto">
                {card.dropdown_options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDropdownValue(option.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors",
                      dropdownValue === option.value && "bg-cyan-900/30 text-cyan-200"
                    )}
                  >
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-sky-600 text-white hover:from-cyan-700 hover:to-sky-700 shadow-md shadow-cyan-500/30 transition-all duration-150"
          >
            确认
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "SLIDER") {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-rose-900/30 to-pink-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-rose-400" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="p-3 space-y-3">
          {card.slider_options?.map((option) => {
            const value = sliderValues[option.label] || option.default;
            return (
              <div key={option.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">{option.label}</span>
                  <div className="flex items-center gap-2">
                    {value === option.default && (
                      <span className="text-[10px] text-rose-400 bg-rose-900/30 px-1.5 py-0.5 rounded">推荐值</span>
                    )}
                    <span className="text-sm font-mono text-rose-200">
                      {value}{option.unit}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={value}
                  onChange={(e) => setSliderValues(prev => ({ ...prev, [option.label]: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <input
                  type="number"
                  min={option.min}
                  max={option.max}
                  step={option.step}
                  value={value}
                  onChange={(e) => setSliderValues(prev => ({ ...prev, [option.label]: Number(e.target.value) }))}
                  className="w-full px-2 py-1 rounded border border-slate-600 bg-slate-700 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/30 transition-all duration-150"
          >
            确认配置
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "BUTTON_GROUP") {
    const getIcon = (iconName?: string) => {
      switch (iconName) {
        case "Rocket": return <Rocket size={16} />;
        case "Download": return <Download size={16} />;
        case "FileText": return <FileText size={16} />;
        default: return null;
      }
    };

    const getButtonStyle = (style?: "primary" | "secondary" | "success") => {
      switch (style) {
        case "primary":
          return "border-indigo-500 bg-indigo-900/40 text-indigo-200 ring-1 ring-indigo-500/30";
        case "success":
          return "border-emerald-500 bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-500/30";
        case "secondary":
        default:
          return "border-slate-600 bg-slate-700/40 text-slate-200";
      }
    };

    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-emerald-900/30 to-green-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-s-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {card.button_options?.map((option) => (
            <button
              key={option.value}
              onClick={() => setButtonValue(option.value)}
              className={clsx(
                "flex-1 min-w-[120px] px-3 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150",
                buttonValue === option.value
                  ? "ring-2 ring-offset-2 ring-offset-slate-800"
                  : "hover:opacity-80",
                getButtonStyle(option.style)
              )}
            >
              {getIcon(option.icon)}
              {option.label}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!buttonValue}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              buttonValue
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald-500/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            执行操作
          </button>
        </div>
      </div>
    );
  }

  if (card.card_type === "SINGLE_SELECT") {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-slide-in-up">
        <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-indigo-900/30 to-violet-900/30">
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          {card.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedValue(option.value)}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-left transition-all duration-150 flex items-center justify-between text-sm",
                selectedValue === option.value
                  ? "border-indigo-500 bg-indigo-900/40 ring-1 ring-indigo-500/30"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={clsx(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  selectedValue === option.value
                    ? "border-indigo-400 bg-indigo-500"
                    : "border-slate-500"
                )}>
                  {selectedValue === option.value && (
                    <Check size={10} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={clsx(
                    "text-sm",
                    selectedValue === option.value ? "text-indigo-200" : "text-slate-200"
                  )}>
                    {option.label}
                  </span>
                  {option.is_recommend && (
                    <span className="text-[11px] text-indigo-400 flex items-center gap-1 mt-0.5">
                      <Sparkles size={10} />
                      推荐
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedValue}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              selectedValue
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
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
