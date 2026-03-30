"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  TrendingUp,
  Shield,
  Clock,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { PolicyConfig, PolicyType } from "@/hooks/use-auto-hosting-mock";

interface PolicyMatrixProps {
  policies: PolicyConfig[];
  onTogglePolicy: (policyId: PolicyType) => void;
  onConfigurePolicy: (policy: PolicyConfig) => void;
}

const PolicyIcon = ({ type, colorClass }: { type: string; colorClass: string }) => {
  switch (type) {
    case "refresh":
      return <RefreshCw size={24} className={colorClass} />;
    case "trending":
      return <TrendingUp size={24} className={colorClass} />;
    case "shield":
      return <Shield size={24} className={colorClass} />;
    case "clock":
      return <Clock size={24} className={colorClass} />;
    default:
      return <Settings size={24} className={colorClass} />;
  }
};

function PolicyCard({
  policy,
  onToggle,
  onConfigure,
}: {
  policy: PolicyConfig;
  onToggle: () => void;
  onConfigure: () => void;
}) {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleToggle = () => {
    setIsSwitching(true);
    setTimeout(() => {
      onToggle();
      setIsSwitching(false);
    }, 200);
  };

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      switchOn: "bg-emerald-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      switchOn: "bg-blue-500",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      switchOn: "bg-amber-500",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-600",
      switchOn: "bg-violet-500",
    },
  };

  const colors = colorClasses[policy.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={clsx(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        "bg-white shadow-soft hover:shadow-medium",
        policy.enabled ? colors.border : "border-slate-200"
      )}
    >
      {/* 顶部：图标和开关 */}
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", colors.bg)}>
          <PolicyIcon type={policy.icon} colorClass={colors.text} />
        </div>

        {/* 开关 */}
        <button
          onClick={handleToggle}
          disabled={isSwitching}
          className={clsx(
            "relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
            policy.enabled ? colors.switchOn : "bg-slate-300",
            policy.enabled ? `focus:ring-${policy.color}-500` : "focus:ring-slate-400"
          )}
        >
          <span
            className={clsx(
              "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
              policy.enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* 策略名称和描述 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">{policy.name}</h3>
        <p className="text-sm text-slate-500">{policy.description}</p>
      </div>

      {/* 预计节约提示 */}
      <div className="flex items-center justify-between">
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <span className="text-xs text-slate-500">预计节约</span>
          <p className="text-sm font-semibold text-slate-700">{policy.estimatedSaving}% 算力浪费</p>
        </div>

        <button
          onClick={onConfigure}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Settings size={16} />
          配置
        </button>
      </div>
    </motion.div>
  );
}

export function PolicyMatrix({
  policies,
  onTogglePolicy,
  onConfigurePolicy,
}: PolicyMatrixProps) {
  return (
    <div>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-6">
        <Settings size={20} className="text-indigo-500" />
        <h2 className="text-lg font-semibold text-slate-800">策略配置矩阵</h2>
      </div>

      {/* 策略卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            onToggle={() => onTogglePolicy(policy.id)}
            onConfigure={() => onConfigurePolicy(policy)}
          />
        ))}
      </div>
    </div>
  );
}
