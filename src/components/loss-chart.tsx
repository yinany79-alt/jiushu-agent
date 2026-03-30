"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { TrendingDown, Activity } from "lucide-react";

interface LossChartProps {
  visible?: boolean;
  onTrainingComplete?: () => void;
}

interface DataPoint {
  step: number;
  loss: number;
  learningRate: number;
  gradientNorm: number;
}

export function LossChart({ visible = true, onTrainingComplete }: LossChartProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(0);

  useEffect(() => {
    if (!visible) {
      setDataPoints([]);
      setIsTraining(false);
      setCurrentStep(0);
      return;
    }

    setIsTraining(true);
    let step = 0;
    const totalSteps = 10; // ~10 seconds at 1s intervals
    let completed = false;

    const interval = setInterval(() => {
      if (step >= totalSteps) {
        if (completed) return;
        completed = true;

        setIsTraining(false);
        clearInterval(interval);
        // Notify training complete after 1 second
        setTimeout(() => {
          onTrainingComplete?.();
        }, 1000);
        return;
      }

      // Simulated loss curve with exponential decay + noise
      const baseLoss = 2.5 * Math.exp(-step / 4) + 0.4;
      const noise = (Math.random() - 0.5) * 0.15;
      const loss = Math.max(baseLoss + noise, 0.5);

      // Simulated learning rate decay
      const learningRate = 2e-5 * Math.exp(-step / 7);

      // Simulated gradient norm
      const gradientNorm = Math.max(1.5 * Math.exp(-step / 3) + 0.3 + (Math.random() - 0.5) * 0.1, 0.2);

      const newDataPoint: DataPoint = {
        step,
        loss: Number(loss.toFixed(3)),
        learningRate: Number(learningRate.toExponential(2)),
        gradientNorm: Number(gradientNorm.toFixed(3)),
      };

      setDataPoints(prev => [...prev, newDataPoint]);
      setCurrentLoss(newDataPoint.loss);
      setCurrentStep(step);
      step++;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [visible]); // 移除 onTrainingComplete 依赖，防止多次触发

  if (!visible && dataPoints.length === 0) {
    return null;
  }

  // Generate SVG path from data points
  const generatePathD = (points: DataPoint[]) => {
    if (points.length === 0) return '';
    const maxLoss = 2.5;
    const chartWidth = 280;
    const chartHeight = 100;

    return points.map((p, i) => {
      const x = (i / 9) * chartWidth + 20;
      const y = 100 - (p.loss / maxLoss) * chartHeight + 20;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  const pathD = generatePathD(dataPoints);
  const lastPoint = dataPoints[dataPoints.length - 1];
  const areaD = dataPoints.length > 1
    ? `${pathD} L ${280 + 20} 120 L 20 120 Z`
    : '';

  const progress = (currentStep / 10) * 100;
  const estimatedTimeRemaining = isTraining
    ? `约 ${Math.ceil((10 - currentStep) * 1)} 秒`
    : dataPoints.length > 0
    ? "已完成"
    : "等待中...";

  return (
    <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700 animate-slide-in-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-100 text-sm">训练损失曲线</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Step {currentStep} / 10
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50">
          <div className="text-[10px] text-slate-400 mb-1">当前 Loss</div>
          <div className="text-sm font-mono font-semibold text-emerald-400">
            {currentLoss.toFixed(3)}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50">
          <div className="text-[10px] text-slate-400 mb-1">Learning Rate</div>
          <div className="text-sm font-mono font-semibold text-cyan-400">
            {lastPoint?.learningRate || "2.00e-05"}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50">
          <div className="text-[10px] text-slate-400 mb-1">Gradient Norm</div>
          <div className="text-sm font-mono font-semibold text-violet-400">
            {lastPoint?.gradientNorm.toFixed(3) || "1.500"}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/50">
          <div className="text-[10px] text-slate-400 mb-1">预计剩余时间</div>
          <div className="text-sm font-mono font-semibold text-amber-400">
            {estimatedTimeRemaining}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-slate-900/50 rounded-xl overflow-hidden p-2">
        <svg viewBox="0 0 320 140" className="w-full h-32">
          {/* Grid lines */}
          <line x1="20" y1="20" x2="300" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20" y1="50" x2="300" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20" y1="80" x2="300" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20" y1="110" x2="300" y2="110" stroke="#334155" strokeWidth="1" />

          {/* Area fill */}
          {areaD && (
            <path d={areaD} fill="url(#areaGradient)" opacity="0.3" />
          )}

          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Activity size={14} className={isTraining ? "text-emerald-400 animate-pulse" : "text-emerald-400"} />
          {isTraining ? "训练中..." : dataPoints.length > 0 ? "训练完成" : "等待中..."}
        </span>
        <span className="text-slate-300 font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
