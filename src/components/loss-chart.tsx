"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TrendingDown, Activity } from "lucide-react";

interface LossChartProps {
  visible?: boolean;
}

export function LossChart({ visible = true }: LossChartProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 2;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [visible]);

  // Generate loss curve data
  const generatePoints = () => {
    const points = [];
    const totalPoints = 20;
    for (let i = 0; i <= totalPoints; i++) {
      const x = (i / totalPoints) * 100;
      // Exponential decay curve
      const y = 100 * Math.exp(-x / 30) + 5 + Math.random() * 3;
      points.push({ x, y: Math.max(y, 8) });
    }
    return points;
  };

  const allPoints = generatePoints();
  const currentPoints = allPoints.slice(0, Math.floor((progress / 100) * allPoints.length));

  const pathD = currentPoints.length > 1
    ? currentPoints.map((p, i) => {
        const x = (p.x / 100) * 280 + 20;
        const y = 120 - (p.y / 110) * 100;
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ')
    : '';

  const areaD = currentPoints.length > 1
    ? `${pathD} L ${(currentPoints[currentPoints.length - 1]?.x || 0) / 100 * 280 + 20} 140 L 20 140 Z`
    : '';

  const currentLoss = currentPoints.length > 0
    ? currentPoints[currentPoints.length - 1].y.toFixed(2)
    : '2.50';

  if (!visible) return null;

  return (
    <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700 animate-slide-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={18} className="text-emerald-400" />
          <span className="font-semibold text-slate-100">训练 Loss 曲线</span>
        </div>
        <span className={clsx(
          "text-xs font-mono px-2 py-1 rounded-lg",
          progress >= 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
        )}>
          Loss: {currentLoss}
        </span>
      </div>

      {/* Chart */}
      <div className="relative bg-slate-900/50 rounded-xl overflow-hidden">
        <svg viewBox="0 0 320 160" className="w-full h-40">
          {/* Grid lines */}
          <line x1="20" y1="20" x2="300" y2="20" stroke="#334155" strokeWidth="1" />
          <line x1="20" y1="60" x2="300" y2="60" stroke="#334155" strokeWidth="1" />
          <line x1="20" y1="100" x2="300" y2="100" stroke="#334155" strokeWidth="1" />
          <line x1="20" y1="140" x2="300" y2="140" stroke="#334155" strokeWidth="1" />

          {/* Area fill */}
          {areaD && (
            <path d={areaD} fill="url(#areaGradient)" opacity="0.3" />
          )}

          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Activity size={14} className={progress >= 100 ? "text-emerald-400" : "text-amber-400 animate-pulse"} />
          {progress >= 100 ? "训练完成" : "训练中..."}
        </span>
        <span>进度: {progress}%</span>
      </div>
    </div>
  );
}
