"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Server, Thermometer, MemoryStick, Gauge, Cpu } from "lucide-react";
import { clsx } from "clsx";
import { GPUCard } from "@/hooks/use-monitoring-mock";

interface GPUHeatmapProps {
  cards: GPUCard[];
}

interface GPUCardDetailProps {
  card: GPUCard;
  position: { x: number; y: number };
}

function GPUCardDetail({ card, position }: GPUCardDetailProps) {
  return createPortal(
    <div
      className="fixed z-[9999] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-600 min-w-[220px] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
        marginTop: -8
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">{card.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700">{card.type}</span>
      </div>
      {card.assignedTask && (
        <div className="mb-2 pb-2 border-b border-slate-600">
          <p className="text-xs text-slate-400 mb-1">分配任务</p>
          <p className="text-sm font-medium text-emerald-400">{card.assignedTask.taskName}</p>
          <p className="text-xs text-slate-300">
            {card.assignedTask.role === "master" ? "主节点" : "计算节点"} · {card.assignedTask.workerId}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Gauge size={12} className="text-emerald-400" />
          <span className="text-slate-400">算力:</span>
          <span className="font-mono text-emerald-400">{card.utilization}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className={card.temperature > 70 ? "text-red-400" : "text-amber-400"} />
          <span className="text-slate-400">温度:</span>
          <span className={clsx("font-mono", card.temperature > 70 ? "text-red-400" : "text-amber-400")}>{card.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MemoryStick size={12} className="text-blue-400" />
          <span className="text-slate-400">显存:</span>
          <span className="font-mono text-blue-400">{card.memoryUsed}/{card.memoryTotal}GB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gauge size={12} className="text-purple-400" />
          <span className="text-slate-400">SM:</span>
          <span className="font-mono text-purple-400">{card.smUtilization}%</span>
        </div>
      </div>
      {/* 小箭头 */}
      <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-800" />
    </div>,
    document.body
  );
}

function GPUCardBlock({ card }: { card: GPUCard }) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  }, []);

  useEffect(() => {
    if (isHovered) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isHovered, updatePosition]);

  const getUtilizationColor = (util: number) => {
    if (util < 30) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (util < 60) return "bg-blue-100 text-blue-700 border-blue-200";
    if (util < 85) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getProgressGradient = (util: number) => {
    if (util < 30) return "from-emerald-400 to-emerald-500";
    if (util < 60) return "from-blue-400 to-blue-500";
    if (util < 85) return "from-amber-400 to-orange-500";
    return "from-red-400 to-rose-500";
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={clsx(
        "p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer",
        "bg-white",
        getUtilizationColor(card.utilization)
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{card.name}</span>
            {card.assignedTask && (
              <span className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                <Cpu size={10} />
                {card.assignedTask.workerId}
              </span>
            )}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 font-medium">
            {card.type}
          </span>
        </div>

        {/* 任务名称 */}
        {card.assignedTask && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 text-xs mb-1">
              <span className={clsx(
                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                card.assignedTask.role === "master"
                  ? "bg-violet-500 text-white"
                  : "bg-slate-500 text-white"
              )}>
                {card.assignedTask.role === "master" ? "主节点" : "计算节点"}
              </span>
            </div>
            <p className="text-xs font-medium truncate">
              {card.assignedTask.taskName}
            </p>
          </div>
        )}

        {/* 利用率进度条 */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>利用率</span>
            <span className="font-mono font-semibold">{card.utilization}%</span>
          </div>
          <div className="h-2 bg-white/40 rounded-full overflow-hidden">
            <div
              className={clsx("h-full bg-gradient-to-r transition-all duration-500", getProgressGradient(card.utilization))}
              style={{ width: `${card.utilization}%` }}
            />
          </div>
        </div>

        {/* 显存进度条 */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span>显存</span>
            <span className="font-mono">{card.memoryUsed}/{card.memoryTotal}GB</span>
          </div>
          <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
              style={{ width: `${(card.memoryUsed / card.memoryTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* 温度指示 */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <Thermometer size={12} className={card.temperature > 70 ? "text-red-500" : "text-slate-500"} />
            <span>{card.temperature}°C</span>
          </div>
          <div className="text-xs text-slate-500">
            SM: {card.smUtilization}%
          </div>
        </div>
      </div>

      {isHovered && <GPUCardDetail card={card} position={tooltipPosition} />}
    </div>
  );
}

export function GPUHeatmap({ cards }: GPUHeatmapProps) {
  const a100Cards = cards.filter(c => c.type === "A100");
  const h800Cards = cards.filter(c => c.type === "H800");

  const avgUtilization = Math.round(cards.reduce((sum, c) => sum + c.utilization, 0) / cards.length);

  // 获取当前运行的训练任务
  const activeTasks = Array.from(new Set(cards.filter(c => c.assignedTask).map(c => c.assignedTask!.taskName)));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
            <Server className="text-violet-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">算力密度热力图</h3>
            <p className="text-sm text-slate-500">
              集群 GPU 实时状态
              {activeTasks.length > 0 && (
                <span className="ml-2 text-violet-600">
                  · {activeTasks.length} 个训练任务运行中
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">{avgUtilization}%</p>
            <p className="text-xs text-slate-500">平均利用率</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-700">{cards.length}</p>
            <p className="text-xs text-slate-500">GPU 总数</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* A100 区域 */}
        {a100Cards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-slate-700">A100 节点</span>
              <span className="text-xs text-slate-400">({a100Cards.length} 卡)</span>
              {a100Cards[0]?.assignedTask && (
                <span className="text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700">
                  {a100Cards[0].assignedTask.taskName}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {a100Cards.map(card => (
                <GPUCardBlock key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* H800 区域 */}
        {h800Cards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-slate-700">H800 节点</span>
              <span className="text-xs text-slate-400">({h800Cards.length} 卡)</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {h800Cards.map(card => (
                <GPUCardBlock key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
          <span className="text-xs text-slate-600">&lt; 30%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
          <span className="text-xs text-slate-600">30-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200" />
          <span className="text-xs text-slate-600">60-85%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
          <span className="text-xs text-slate-600">&gt; 85%</span>
        </div>
      </div>
    </div>
  );
}
