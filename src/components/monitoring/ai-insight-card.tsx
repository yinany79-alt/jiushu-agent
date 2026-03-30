"use client";

import { useEffect, useState } from "react";
import { Sparkles, Brain, Zap, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { MonitoringData } from "@/hooks/use-monitoring-mock";

interface AiInsightCardProps {
  data: MonitoringData["aiInsight"];
}

export function AiInsightCard({ data }: AiInsightCardProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  // 打字机效果
  useEffect(() => {
    setTextIndex(0);
    setDisplayText("");
  }, [data.summary]);

  useEffect(() => {
    if (textIndex < data.summary.length) {
      const timer = setTimeout(() => {
        setDisplayText(data.summary.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [textIndex, data.summary]);

  // 扫描动画
  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyles = () => {
    switch (data.status) {
      case "normal":
        return {
          bg: "from-blue-50 via-sky-50 to-white",
          border: "border-blue-100",
          accent: "text-blue-600",
          accentBg: "bg-blue-100",
          icon: <Brain className="text-blue-600" />,
        };
      case "warning":
        return {
          bg: "from-amber-50 via-orange-50 to-white",
          border: "border-orange-100",
          accent: "text-orange-600",
          accentBg: "bg-orange-100",
          icon: <AlertTriangle className="text-orange-600" />,
        };
      case "critical":
        return {
          bg: "from-red-50 via-rose-50 to-white",
          border: "border-red-100",
          accent: "text-red-600",
          accentBg: "bg-red-100",
          icon: <Zap className="text-red-600" />,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl border p-6 transition-all duration-500",
      "bg-gradient-to-br",
      styles.bg,
      styles.border,
      "shadow-soft"
    )}>
      {/* 点阵背景 */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* 扫描线动画 */}
      {isScanning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              styles.accentBg
            )}>
              {styles.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={clsx("text-lg font-semibold", styles.accent)}>
                  AI 智能治理看板
                </h3>
                <Sparkles size={16} className={styles.accent} />
              </div>
              <p className="text-sm text-slate-500">实时聚合分析中...</p>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2">
            <div className={clsx(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              data.status === "normal" ? "bg-emerald-500" :
              data.status === "warning" ? "bg-amber-500" : "bg-red-500"
            )} />
            <span className={clsx(
              "text-xs font-medium px-2 py-1 rounded-full",
              styles.accentBg,
              styles.accent
            )}>
              {data.status === "normal" ? "正常" :
               data.status === "warning" ? "告警" : "紧急"}
            </span>
          </div>
        </div>

        {/* AI 总结内容 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
          <p className={clsx("text-slate-700 leading-relaxed", data.status === "normal" ? "" : "text-orange-800")}>
            {displayText}
            {textIndex < data.summary.length && (
              <span className="inline-block w-1.5 h-5 ml-1 bg-slate-400 animate-pulse align-middle rounded-sm" />
            )}
          </p>
        </div>

        {/* 建议操作 */}
        {data.actions && data.actions.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-slate-500">建议操作：</span>
            {data.actions.map(action => (
              <button
                key={action.id}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
                  "shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
