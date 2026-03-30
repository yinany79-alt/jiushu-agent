"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { PolicyConfig, PolicyType } from "@/hooks/use-auto-hosting-mock";

interface PolicyDrawerProps {
  policy: PolicyConfig | null;
  onClose: () => void;
  onUpdateSettings: (policyId: PolicyType, settings: any) => void;
}

// 滑块组件
function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm text-slate-500">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
}

// 选择器组件
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// 多选标签组件
function MultiSelectTags({
  label,
  values,
  allOptions,
  onChange,
}: {
  label: string;
  values: string[];
  allOptions: { label: string; value: string }[];
  onChange: (values: string[]) => void;
}) {
  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {allOptions.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                isSelected
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 自愈策略表单
function SelfHealingForm({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) {
  return (
    <div className="space-y-6">
      <MultiSelectTags
        label="错误码白名单"
        values={settings.errorWhitelist || []}
        allOptions={[
          { label: "CUDA out of memory", value: "CUDA out of memory" },
          { label: "Connection timeout", value: "Connection timeout" },
          { label: "GPU lost", value: "GPU lost" },
          { label: "NCCL error", value: "NCCL error" },
        ]}
        onChange={(values) => onChange({ ...settings, errorWhitelist: values })}
      />

      <Slider
        label="重启上限"
        value={settings.maxRestarts || 3}
        min={1}
        max={10}
        onChange={(value) => onChange({ ...settings, maxRestarts: value })}
      />

      <Slider
        label="等待时间"
        value={settings.waitSeconds || 60}
        min={10}
        max={300}
        unit="秒"
        onChange={(value) => onChange({ ...settings, waitSeconds: value })}
      />
    </div>
  );
}

// 弹性策略表单
function ElasticityForm({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) {
  return (
    <div className="space-y-6">
      <Slider
        label="QPS 阈值"
        value={settings.qpsThreshold || 1000}
        min={100}
        max={5000}
        onChange={(value) => onChange({ ...settings, qpsThreshold: value })}
      />

      <Slider
        label="CPU 水位"
        value={settings.cpuWatermark || 70}
        min={30}
        max={95}
        unit="%"
        onChange={(value) => onChange({ ...settings, cpuWatermark: value })}
      />

      <Slider
        label="显存水位"
        value={settings.memoryWatermark || 80}
        min={30}
        max={95}
        unit="%"
        onChange={(value) => onChange({ ...settings, memoryWatermark: value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="最小实例数"
          value={settings.minInstances || 2}
          min={1}
          max={20}
          onChange={(value) => onChange({ ...settings, minInstances: value })}
        />
        <Slider
          label="最大实例数"
          value={settings.maxInstances || 10}
          min={1}
          max={50}
          onChange={(value) => onChange({ ...settings, maxInstances: value })}
        />
      </div>
    </div>
  );
}

// 接管策略表单
function TakeoverForm({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) {
  return (
    <div className="space-y-6">
      <MultiSelectTags
        label="清理规则"
        values={settings.cleanupRules || []}
        allOptions={[
          { label: "磁盘清理", value: "disk" },
          { label: "网络重启", value: "network" },
          { label: "缓存清理", value: "cache" },
          { label: "日志轮转", value: "logs" },
        ]}
        onChange={(values) => onChange({ ...settings, cleanupRules: values })}
      />

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-slate-700">紧急停机策略</p>
          <p className="text-xs text-slate-500">检测到严重问题时立即停止任务</p>
        </div>
        <button
          onClick={() => onChange({ ...settings, emergencyStop: !settings.emergencyStop })}
          className={clsx(
            "relative w-12 h-7 rounded-full transition-colors duration-300",
            settings.emergencyStop ? "bg-amber-500" : "bg-slate-300"
          )}
        >
          <span
            className={clsx(
              "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
              settings.emergencyStop ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

// 调度策略表单
function SchedulingForm({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) {
  return (
    <div className="space-y-6">
      <Select
        label="Cron 表达式"
        value={settings.cronExpression || "0 2 * * *"}
        options={[
          { label: "每天凌晨 2 点", value: "0 2 * * *" },
          { label: "每小时", value: "0 * * * *" },
          { label: "每天凌晨 4 点", value: "0 4 * * *" },
          { label: "每周日凌晨 3 点", value: "0 3 * * 0" },
        ]}
        onChange={(value) => onChange({ ...settings, cronExpression: value })}
      />

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-slate-700">产出校验逻辑</p>
          <p className="text-xs text-slate-500">执行完成后校验输出是否符合预期</p>
        </div>
        <button
          onClick={() => onChange({ ...settings, validateOutput: !settings.validateOutput })}
          className={clsx(
            "relative w-12 h-7 rounded-full transition-colors duration-300",
            settings.validateOutput ? "bg-violet-500" : "bg-slate-300"
          )}
        >
          <span
            className={clsx(
              "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
              settings.validateOutput ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <Slider
        label="超时时间"
        value={settings.timeoutMinutes || 120}
        min={30}
        max={480}
        unit="分钟"
        onChange={(value) => onChange({ ...settings, timeoutMinutes: value })}
      />
    </div>
  );
}

// 根据策略类型渲染对应表单
function PolicyForm({ policy, onChange }: { policy: PolicyConfig; onChange: (settings: any) => void }) {
  switch (policy.id) {
    case "self-healing":
      return <SelfHealingForm settings={policy.settings} onChange={onChange} />;
    case "elasticity":
      return <ElasticityForm settings={policy.settings} onChange={onChange} />;
    case "takeover":
      return <TakeoverForm settings={policy.settings} onChange={onChange} />;
    case "scheduling":
      return <SchedulingForm settings={policy.settings} onChange={onChange} />;
    default:
      return null;
  }
}

export function PolicyDrawer({ policy, onClose, onUpdateSettings }: PolicyDrawerProps) {
  const [localSettings, setLocalSettings] = useState<any>({});

  useEffect(() => {
    if (policy) {
      setLocalSettings(policy.settings);
    }
  }, [policy]);

  const handleSave = () => {
    if (policy) {
      onUpdateSettings(policy.id, localSettings);
      onClose();
    }
  };

  if (!policy) return null;

  return (
    <AnimatePresence>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      {/* 抽屉 */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{policy.name}策略配置</h2>
            <p className="text-sm text-slate-500 mt-1">{policy.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <PolicyForm
            policy={policy}
            onChange={(settings) => setLocalSettings(settings)}
          />
        </div>

        {/* 底部：策略模拟预估 */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 mb-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">策略模拟预估</p>
                <p className="text-sm text-indigo-700 mt-1">
                  基于此配置，预计每月可减少 <span className="font-semibold">{policy.estimatedSaving}%</span> 的空置算力浪费
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-700 font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 text-white font-medium bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-md shadow-indigo-500/25"
            >
              保存配置
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
