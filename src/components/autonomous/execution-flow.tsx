"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Brain,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Search,
  Activity,
  Settings,
  Pause,
  Play,
  Hand,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  ExecutionFlow as ExecutionFlowType,
  FlowStep,
  PauseState,
} from "@/hooks/use-auto-hosting-mock";

interface ExecutionFlowProps {
  flows: ExecutionFlowType[];
  onTogglePause?: (flowId: string) => void;
  onManualTakeover?: (flowId: string) => void;
  onUpdateTempPolicy?: (flowId: string, settings: { maxRestarts?: number; alertThreshold?: number }) => void;
}

interface PolicyPopupProps {
  flowId: string;
  onClose: () => void;
  onUpdate: (flowId: string, settings: { maxRestarts?: number; alertThreshold?: number }) => void;
  currentMaxRestarts?: number;
  currentAlertThreshold?: number;
}

function PolicyPopup({ flowId, onClose, onUpdate, currentMaxRestarts = 3, currentAlertThreshold = 80 }: PolicyPopupProps) {
  const [maxRestarts, setMaxRestarts] = useState(currentMaxRestarts);
  const [alertThreshold, setAlertThreshold] = useState(currentAlertThreshold);

  const handleSave = () => {
    onUpdate(flowId, { maxRestarts, alertThreshold });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute right-0 top-16 z-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800">策略调整</h4>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">最大重试次数</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={maxRestarts}
              onChange={(e) => setMaxRestarts(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none accent-indigo-500"
            />
            <span className="w-8 text-center text-sm font-medium text-slate-700">{maxRestarts}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">报警阈值</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={100}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none accent-indigo-500"
            />
            <span className="w-10 text-center text-sm font-medium text-slate-700">{alertThreshold}%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepIndicator({
  step,
  currentStep,
  stepData,
}: {
  step: FlowStep;
  currentStep: FlowStep;
  stepData: { status: string; message?: string; name: string };
}) {
  const stepOrder: FlowStep[] = ["capture", "diagnose", "decision", "execute", "complete"];
  const stepIndex = stepOrder.indexOf(step);
  const currentIndex = stepOrder.indexOf(currentStep);
  const isActive = step === currentStep;
  const isCompleted = stepIndex < currentIndex || stepData.status === "completed";
  const isPending = stepIndex > currentIndex && stepData.status === "pending";

  const getStatusColor = () => {
    if (stepData.status === "failed") return "border-red-500 bg-red-50";
    if (isCompleted) return "border-emerald-500 bg-emerald-50";
    if (isActive) return "border-blue-500 bg-blue-50";
    return "border-slate-200 bg-slate-50";
  };

  const getIconColor = () => {
    if (stepData.status === "failed") return "text-red-500";
    if (isCompleted) return "text-emerald-500";
    if (isActive) return "text-blue-500";
    return "text-slate-400";
  };

  const getPulse = () => {
    if (isActive && stepData.status !== "completed" && stepData.status !== "failed") {
      return "animate-pulse-glow";
    }
    return "";
  };

  const StepIcon = () => {
    switch (step) {
      case "capture":
        return <Search size={14} />;
      case "diagnose":
        return <Brain size={14} />;
      case "decision":
        return <Zap size={14} />;
      case "execute":
        return <Activity size={14} />;
      case "complete":
        return <CheckCircle2 size={14} />;
      default:
        return <Eye size={14} />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={clsx(
          "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
          getStatusColor(),
          getPulse()
        )}
      >
        {isCompleted && stepData.status !== "failed" ? (
          <CheckCircle2 size={18} className={getIconColor()} />
        ) : stepData.status === "failed" ? (
          <AlertCircle size={18} className={getIconColor()} />
        ) : isActive ? (
          <Loader2 size={18} className={getIconColor() + " animate-spin"} />
        ) : (
          <StepIcon />
        )}
      </div>
      <p className={clsx(
        "text-xs mt-2 font-medium text-center",
        isActive ? "text-blue-700" : isCompleted ? "text-emerald-700" : "text-slate-500"
      )}>
        {stepData.name}
      </p>
      {stepData.message && (
        <p className={clsx(
          "text-xs mt-1 text-center max-w-24 leading-relaxed",
          isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
        )}>
          {stepData.message}
        </p>
      )}
    </div>
  );
}

function ConnectingLine({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex-1 h-0.5 mt-5 mx-1">
      <div className={clsx(
        "h-full transition-all duration-500",
        isActive ? "bg-gradient-to-r from-emerald-400 to-blue-400" : "bg-slate-200"
      )} />
    </div>
  );
}

function FlowCard({
  flow,
  onTogglePause,
  onManualTakeover,
  onUpdateTempPolicy,
}: {
  flow: ExecutionFlowType;
  onTogglePause?: (flowId: string) => void;
  onManualTakeover?: (flowId: string) => void;
  onUpdateTempPolicy?: (flowId: string, settings: { maxRestarts?: number; alertThreshold?: number }) => void;
}) {
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);
  const isPaused = flow.pauseState === "paused";
  const isManual = flow.pauseState === "manual";
  const isInProgress = flow.state === "in-progress";
  const isDecisionMaking = flow.state === "decision-making";
  const isFeedbackSuccess = flow.state === "feedback" && flow.result === "success";
  const isFeedbackFailed = flow.state === "feedback" && flow.result === "failed";

  const stepOrder: FlowStep[] = ["capture", "diagnose", "decision", "execute", "complete"];

  return (
    <motion.div
      layout
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        "bg-white shadow-soft",
        isDecisionMaking && "border-blue-300 animate-pulse-glow",
        isInProgress && "border-blue-300",
        isFeedbackSuccess && "border-emerald-300 bg-emerald-50/30",
        isFeedbackFailed && "border-red-300 bg-red-50/30 animate-failed-persist",
        isManual && "border-amber-300 bg-amber-50/30",
        isPaused && "border-slate-300 bg-slate-50/50",
        !isDecisionMaking && !isFeedbackSuccess && !isFeedbackFailed && !isPaused && !isManual && !isInProgress && "border-slate-200"
      )}
    >
      {/* 顶部区域：标题和控制按钮 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
            isFeedbackSuccess ? "bg-emerald-50" :
            isFeedbackFailed ? "bg-red-50" :
            isManual ? "bg-amber-50" :
            isPaused ? "bg-slate-100" :
            isDecisionMaking || isInProgress ? "bg-blue-50" : "bg-slate-50"
          )}>
            {isManual ? (
              <Hand size={20} className="text-amber-500" />
            ) : isPaused ? (
              <Pause size={20} className="text-slate-500" />
            ) : isFeedbackSuccess ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : isFeedbackFailed ? (
              <AlertCircle size={20} className="text-red-500" />
            ) : isDecisionMaking ? (
              <Brain size={20} className="text-blue-500" />
            ) : isInProgress ? (
              <Loader2 size={20} className="text-blue-500 animate-spin" />
            ) : (
              <Eye size={20} className="text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{flow.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{flow.message}</p>
            {isManual && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                ⚠️ 已由人工接管
              </p>
            )}
            {isPaused && (
              <p className="text-xs text-slate-500 mt-1">
                已暂停
              </p>
            )}
          </div>
        </div>

        {/* 右侧控制按钮 */}
        <div className="flex items-center gap-2 relative">
          {!isManual && !isFeedbackSuccess && (
            <>
              <button
                onClick={() => setShowPolicyPopup(!showPolicyPopup)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">策略调整</span>
              </button>
              <button
                onClick={() => onManualTakeover?.(flow.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors border border-amber-200"
              >
                <Hand size={16} />
                <span className="hidden sm:inline">人工介入</span>
              </button>
              <button
                onClick={() => onTogglePause?.(flow.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                  isPaused
                    ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200"
                    : "text-slate-700 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span className="hidden sm:inline">{isPaused ? "继续" : "暂停"}</span>
              </button>
            </>
          )}

          <AnimatePresence>
            {showPolicyPopup && (
              <PolicyPopup
                flowId={flow.id}
                onClose={() => setShowPolicyPopup(false)}
                onUpdate={onUpdateTempPolicy!}
                currentMaxRestarts={flow.tempMaxRestarts ?? 3}
                currentAlertThreshold={flow.tempAlertThreshold ?? 80}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="flex items-center justify-between mb-6 px-2">
        {flow.steps.map((step, index) => (
          <React.Fragment key={step.step}>
            <StepIndicator
              step={step.step}
              currentStep={flow.currentStep}
              stepData={step}
            />
            {index < flow.steps.length - 1 && (
              <ConnectingLine
                isActive={stepOrder.indexOf(flow.currentStep) > index}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 进度条 - 仅在执行中显示 */}
      <AnimatePresence>
        {isInProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">执行进度</span>
                <span className="text-xs font-medium text-blue-600">{Math.round(flow.progress)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${flow.progress}%` }}
                  transition={{ duration: 0.3, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成功/失败反馈 */}
      <AnimatePresence>
        {isFeedbackSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200"
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-sm font-medium">任务已自愈完成，系统恢复正常运行</span>
          </motion.div>
        )}
        {isFeedbackFailed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-between gap-2 text-red-700 bg-red-50 rounded-xl px-4 py-3 border border-red-200"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              <span className="text-sm font-medium">自愈失败，需要人工介入处理</span>
            </div>
            <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
              立即处理
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ExecutionFlow({
  flows,
  onTogglePause,
  onManualTakeover,
  onUpdateTempPolicy,
}: ExecutionFlowProps) {
  return (
    <div className="space-y-4">
      {/* 执行流卡片列表 */}
      <div className="space-y-4">
        {flows.map((flow) => (
          <FlowCard
            key={flow.id}
            flow={flow}
            onTogglePause={onTogglePause}
            onManualTakeover={onManualTakeover}
            onUpdateTempPolicy={onUpdateTempPolicy}
          />
        ))}

        {/* 空状态 */}
        {flows.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Eye size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">当前无活跃执行流</p>
            <p className="text-sm text-slate-400 mt-1">点击上方"模拟异常"按钮触发自愈流程</p>
          </div>
        )}
      </div>
    </div>
  );
}
