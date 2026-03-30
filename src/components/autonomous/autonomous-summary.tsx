"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Cpu, CheckCircle2, ShieldAlert, Activity } from "lucide-react";
import { clsx } from "clsx";
import { AutoHostingData } from "@/hooks/use-auto-hosting-mock";

interface AutonomousSummaryProps {
  data: AutoHostingData;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  colorClass,
}: {
  icon: any;
  label: string;
  value: number;
  unit?: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
      <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-800">
          {value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function AutonomousSummary({ data }: AutonomousSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* 左侧品牌色垂直线条 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-violet-500" />

      <div className="p-6 pl-7">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* 左侧：托管日志流 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} className="text-slate-500" />
              <h3 className="text-sm font-medium text-slate-600">托管日志流</h3>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div
                ref={scrollRef}
                className="h-32 overflow-y-auto space-y-1.5"
              >
                {data.logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-slate-500 font-mono text-xs shrink-0 select-none">
                      {log.time}
                    </span>
                    <span
                      className={clsx(
                        "inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1",
                        log.type === "success" && "bg-emerald-400",
                        log.type === "warning" && "bg-amber-400",
                        log.type === "action" && "bg-blue-400",
                        log.type === "info" && "bg-slate-500"
                      )}
                    />
                    <span className="text-slate-300 font-mono text-xs leading-relaxed">
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </div>
              {/* 渐变遮罩 */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900 to-transparent rounded-b-xl" />
            </div>
          </div>

          {/* 右侧：AI 智能摘要 KPI */}
          <div className="lg:w-96">
            <div
              className="flex items-center justify-between mb-3 cursor-pointer group"
              onClick={() => setExpanded(!expanded)}
            >
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-indigo-500" />
                <h3 className="text-sm font-medium text-slate-700">AI 智能摘要</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <KpiCard
                icon={Cpu}
                label="已节约算力"
                value={data.summary.computeSaved}
                unit="GPU·h"
                colorClass="bg-emerald-500"
              />
              <KpiCard
                icon={CheckCircle2}
                label="自动修复任务"
                value={data.summary.tasksFixed}
                colorClass="bg-blue-500"
              />
              <KpiCard
                icon={ShieldAlert}
                label="当前拦截风险"
                value={data.summary.risksBlocked}
                colorClass="bg-amber-500"
              />
            </div>

            {/* 展开的深度报告 */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-medium text-indigo-900 mb-2">Agent 深度治理报告</h4>
                    <ul className="space-y-1.5 text-sm text-indigo-800">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-indigo-500 rounded-full shrink-0" />
                        <span>过去 24 小时成功处理 12 次 OOM 异常</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-indigo-500 rounded-full shrink-0" />
                        <span>弹性策略为 Llama3 服务节约 32% 闲置算力</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-indigo-500 rounded-full shrink-0" />
                        <span>预测未来 2 小时可能出现流量高峰，建议预热扩容</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
