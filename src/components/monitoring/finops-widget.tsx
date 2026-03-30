"use client";

import { useState } from "react";
import { DollarSign, Zap, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface FinopsWidgetProps {
  idleCount: number;
  dailyCost: number;
}

export function FinopsWidget({ idleCount, dailyCost }: FinopsWidgetProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  const handleRelease = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      setReleased(true);
      setTimeout(() => setReleased(false), 3000);
    }, 2000);
  };

  if (idleCount === 0 && !released) {
    return null;
  }

  return (
    <div className={clsx(
      "rounded-2xl p-5 border transition-all duration-500",
      released
        ? "bg-emerald-50 border-emerald-200"
        : "bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
            released ? "bg-emerald-100" : "bg-amber-100"
          )}>
            {released ? (
              <CheckCircle2 size={24} className="text-emerald-600" />
            ) : (
              <Zap size={24} className="text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className={clsx(
                "text-lg font-semibold",
                released ? "text-emerald-800" : "text-amber-800"
              )}>
                {released ? "资源已释放" : "算力浪费检测"}
              </h4>
              {!released && (
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-700 text-xs font-medium">
                  待处理
                </span>
              )}
            </div>
            {released ? (
              <p className="text-emerald-700 text-sm">
                已成功释放 {idleCount} 个空闲 GPU 容器，预计每日节省 ¥{dailyCost.toLocaleString()}
              </p>
            ) : (
              <p className="text-amber-700 text-sm">
                发现 <span className="font-semibold">{idleCount}</span> 个已挂起但未释放的 GPU 容器，
                预计每日浪费 <span className="font-semibold">¥{dailyCost.toLocaleString()}</span>。
              </p>
            )}
          </div>
        </div>

        {!released && (
          <button
            onClick={handleRelease}
            disabled={isReleasing}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              isReleasing
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600"
            )}
          >
            {isReleasing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                释放中...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                一键释放
              </>
            )}
          </button>
        )}
      </div>

      {!released && (
        <div className="mt-4 pt-4 border-t border-amber-200/50">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle size={14} />
              <span>上次扫描: 刚刚</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <DollarSign size={14} />
              <span>月度预估浪费: ¥{(dailyCost * 30).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
