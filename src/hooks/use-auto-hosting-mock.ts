"use client";

import { useState, useEffect, useCallback } from "react";

// 执行流步骤类型
export type FlowStep = "capture" | "diagnose" | "decision" | "execute" | "complete";

// 执行流状态类型
export type ExecutionState = "monitoring" | "decision-making" | "in-progress" | "feedback";
export type PauseState = "running" | "paused" | "manual";

export interface HostingLog {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "action";
}

export interface StepDetail {
  step: FlowStep;
  name: string;
  status: "pending" | "active" | "completed" | "failed";
  message?: string;
}

export interface ExecutionFlow {
  id: string;
  name: string;
  state: ExecutionState;
  progress: number;
  message: string;
  result?: "success" | "failed";
  timestamp: number;
  pauseState: PauseState;
  steps: StepDetail[];
  currentStep: FlowStep;
  tempMaxRestarts?: number;
  tempAlertThreshold?: number;
}

export type PolicyType = "self-healing" | "elasticity" | "takeover" | "scheduling";

export interface PolicyConfig {
  id: PolicyType;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  color: string;
  settings: {
    [key: string]: any;
  };
  estimatedSaving: number;
}

export interface AutoHostingData {
  logs: HostingLog[];
  executionFlows: ExecutionFlow[];
  policies: PolicyConfig[];
  summary: {
    computeSaved: number;
    tasksFixed: number;
    risksBlocked: number;
  };
}

// 生成当前时间字符串
function getCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
}

function getTimeMinutesAgo(minutes: number) {
  const now = new Date(Date.now() - minutes * 60 * 1000);
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// 初始日志 - 12条记录
const initialLogs: HostingLog[] = [
  { id: "log-1", time: getCurrentTime(), message: "检测到异常：Llama-v3-Train-08 OOM", type: "warning" },
  { id: "log-2", time: getTimeMinutesAgo(1), message: "Agent 分析中：检查错误码白名单", type: "info" },
  { id: "log-3", time: getTimeMinutesAgo(2), message: "执行自愈：重启任务 Llama-v3-Train-08", type: "action" },
  { id: "log-4", time: getTimeMinutesAgo(3), message: "自愈完成：Llama-v3-Train-08 已恢复", type: "success" },
  { id: "log-5", time: getTimeMinutesAgo(5), message: "自动扩容 Service_Llama3", type: "action" },
  { id: "log-6", time: getTimeMinutesAgo(8), message: "自愈任务 Train_Qwen_05 已重启", type: "success" },
  { id: "log-7", time: getTimeMinutesAgo(12), message: "清理磁盘空间 2.5GB", type: "info" },
  { id: "log-8", time: getTimeMinutesAgo(15), message: "检测到 GPU 显存泄漏风险", type: "warning" },
  { id: "log-9", time: getTimeMinutesAgo(18), message: "调度周期性数据备份任务", type: "info" },
  { id: "log-10", time: getTimeMinutesAgo(22), message: "弹性伸缩：缩减 ChatService 实例", type: "info" },
  { id: "log-11", time: getTimeMinutesAgo(28), message: "接管告警：清理网络缓存", type: "action" },
  { id: "log-12", time: getTimeMinutesAgo(35), message: "启用调度策略：凌晨数据同步", type: "success" },
];

// 初始策略配置
const initialPolicies: PolicyConfig[] = [
  {
    id: "self-healing",
    name: "自愈",
    description: "训练失败自动重启",
    enabled: true,
    icon: "refresh",
    color: "emerald",
    settings: {
      errorWhitelist: ["CUDA out of memory", "Connection timeout"],
      maxRestarts: 3,
      waitSeconds: 60,
    },
    estimatedSaving: 15,
  },
  {
    id: "elasticity",
    name: "弹性",
    description: "推理服务自动扩缩容",
    enabled: true,
    icon: "trending",
    color: "blue",
    settings: {
      qpsThreshold: 1000,
      cpuWatermark: 70,
      memoryWatermark: 80,
      minInstances: 2,
      maxInstances: 10,
    },
    estimatedSaving: 25,
  },
  {
    id: "takeover",
    name: "接管",
    description: "常见告警自动清理",
    enabled: false,
    icon: "shield",
    color: "amber",
    settings: {
      cleanupRules: ["disk", "network", "cache"],
      emergencyStop: true,
    },
    estimatedSaving: 10,
  },
  {
    id: "scheduling",
    name: "调度",
    description: "研发脚本周期性托管",
    enabled: true,
    icon: "clock",
    color: "violet",
    settings: {
      cronExpression: "0 2 * * *",
      validateOutput: true,
      timeoutMinutes: 120,
    },
    estimatedSaving: 20,
  },
];

// 创建初始步骤
function createInitialSteps(): StepDetail[] {
  return [
    { step: "capture", name: "捕获异常", status: "pending" },
    { step: "diagnose", name: "诊断原因", status: "pending" },
    { step: "decision", name: "决策方案", status: "pending" },
    { step: "execute", name: "执行中", status: "pending" },
    { step: "complete", name: "完成", status: "pending" },
  ];
}

// 初始执行流
const initialFlows: ExecutionFlow[] = [
  {
    id: "flow-1",
    name: "策略监控",
    state: "monitoring",
    progress: 0,
    message: "策略已激活",
    timestamp: Date.now(),
    pauseState: "running",
    steps: createInitialSteps(),
    currentStep: "capture",
  },
];

export function useAutoHostingMock() {
  const [data, setData] = useState<AutoHostingData>({
    logs: initialLogs,
    executionFlows: initialFlows,
    policies: initialPolicies,
    summary: {
      computeSaved: 428,
      tasksFixed: 76,
      risksBlocked: 23,
    },
  });

  const [selectedPolicy, setSelectedPolicy] = useState<PolicyConfig | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  // 添加新日志
  const addLog = useCallback((message: string, type: HostingLog["type"] = "info") => {
    const newLog: HostingLog = {
      id: `log-${Date.now()}`,
      time: getCurrentTime(),
      message,
      type,
    };
    setData((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 30),
    }));
  }, []);

  // 更新执行流
  const updateExecutionFlow = useCallback((flow: Partial<ExecutionFlow> & { id: string }) => {
    setData((prev) => ({
      ...prev,
      executionFlows: prev.executionFlows.map((f) =>
        f.id === flow.id ? { ...f, ...flow } : f
      ),
    }));
  }, []);

  // 暂停/恢复执行流
  const togglePauseFlow = useCallback((flowId: string) => {
    setData((prev) => ({
      ...prev,
      executionFlows: prev.executionFlows.map((f) => {
        if (f.id === flowId) {
          const newPauseState = f.pauseState === "running" ? "paused" : "running";
          if (newPauseState === "paused") {
            addLog(`人工介入：已暂停任务 ${f.name}`, "warning");
          } else {
            addLog(`恢复执行：任务 ${f.name} 继续运行`, "info");
          }
          return { ...f, pauseState: newPauseState };
        }
        return f;
      }),
    }));
  }, [addLog]);

  // 人工接管
  const manualTakeover = useCallback((flowId: string) => {
    setData((prev) => ({
      ...prev,
      executionFlows: prev.executionFlows.map((f) => {
        if (f.id === flowId) {
          addLog(`人工接管：任务 ${f.name} 已由用户接管`, "action");
          return { ...f, pauseState: "manual" };
        }
        return f;
      }),
    }));
  }, [addLog]);

  // 更新临时策略
  const updateTempPolicy = useCallback((flowId: string, settings: { maxRestarts?: number; alertThreshold?: number }) => {
    setData((prev) => ({
      ...prev,
      executionFlows: prev.executionFlows.map((f) => {
        if (f.id === flowId) {
          if (settings.maxRestarts !== undefined) {
            addLog(`策略调整：最大重试次数设为 ${settings.maxRestarts}`, "info");
          }
          if (settings.alertThreshold !== undefined) {
            addLog(`策略调整：告警阈值设为 ${settings.alertThreshold}%`, "info");
          }
          return {
            ...f,
            tempMaxRestarts: settings.maxRestarts ?? f.tempMaxRestarts,
            tempAlertThreshold: settings.alertThreshold ?? f.tempAlertThreshold,
          };
        }
        return f;
      }),
    }));
  }, [addLog]);

  // 切换策略启用状态
  const togglePolicy = useCallback((policyId: PolicyType) => {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.map((p) =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p
      ),
    }));
    const policy = data.policies.find((p) => p.id === policyId);
    if (policy) {
      addLog(`${policy.enabled ? "停用" : "启用"}策略：${policy.name}`, policy.enabled ? "info" : "success");
    }
  }, [data.policies, addLog]);

  // 更新策略配置
  const updatePolicySettings = useCallback((policyId: PolicyType, settings: any) => {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.map((p) =>
        p.id === policyId ? { ...p, settings: { ...p.settings, ...settings } } : p
      ),
    }));
  }, []);

  // 更新步骤状态
  const updateStepStatus = useCallback((flowId: string, step: FlowStep, status: StepDetail["status"], message?: string) => {
    setData((prev) => ({
      ...prev,
      executionFlows: prev.executionFlows.map((f) => {
        if (f.id === flowId) {
          const newSteps = f.steps.map((s) => {
            if (s.step === step) {
              return { ...s, status, message };
            }
            // 如果当前步骤已激活，之前的步骤设为完成
            if (status === "active") {
              const stepOrder: FlowStep[] = ["capture", "diagnose", "decision", "execute", "complete"];
              if (stepOrder.indexOf(s.step) < stepOrder.indexOf(step)) {
                return { ...s, status: "completed" };
              }
            }
            return s;
          });
          return { ...f, steps: newSteps, currentStep: step };
        }
        return f;
      }),
    }));
  }, []);

  // 模拟异常场景
  const triggerSimulation = useCallback(() => {
    if (simulationRunning) return;
    setSimulationRunning(true);

    // 重置执行流
    const flowId = "flow-sim-" + Date.now();
    setData((prev) => ({
      ...prev,
      executionFlows: [
        {
          id: flowId,
          name: "Llama3 任务自愈流程",
          state: "monitoring",
          progress: 0,
          message: "策略已激活",
          timestamp: Date.now(),
          pauseState: "running",
          steps: createInitialSteps(),
          currentStep: "capture",
        },
      ],
    }));

    addLog("检测到异常：Llama-v3-Train-08 OOM", "warning");

    // 步骤1: 捕获异常
    setTimeout(() => {
      updateStepStatus(flowId, "capture", "active", "正在收集异常数据...");
      updateExecutionFlow({
        id: flowId,
        state: "monitoring",
        message: "捕获异常中...",
      });
    }, 500);

    setTimeout(() => {
      updateStepStatus(flowId, "capture", "completed", "已捕获 OOM 异常");
      addLog("步骤完成：异常捕获成功", "info");
    }, 1500);

    // 步骤2: 诊断原因
    setTimeout(() => {
      updateStepStatus(flowId, "diagnose", "active", "分析错误日志...");
      updateExecutionFlow({
        id: flowId,
        state: "decision-making",
        message: "Agent 正在分析异常日志...",
      });
      addLog("Agent 分析中：检查错误码白名单", "info");
    }, 2000);

    setTimeout(() => {
      updateStepStatus(flowId, "diagnose", "completed", "诊断：显存超限，在白名单内");
      addLog("诊断完成：CUDA OOM 属于可自愈范围", "info");
    }, 3500);

    // 步骤3: 决策方案
    setTimeout(() => {
      updateStepStatus(flowId, "decision", "active", "评估自愈策略...");
      addLog("决策中：评估重启策略", "info");
    }, 4000);

    setTimeout(() => {
      updateStepStatus(flowId, "decision", "completed", "决策：立即重启，等待60秒");
      addLog("决策完成：将执行重启任务", "info");
    }, 5000);

    // 步骤4: 执行中
    setTimeout(() => {
      updateStepStatus(flowId, "execute", "active", "正在重启容器...");
      updateExecutionFlow({
        id: flowId,
        state: "in-progress",
        progress: 0,
        message: "正在重启容器...",
      });
      addLog("执行自愈：重启任务 Llama-v3-Train-08", "action");
    }, 5500);

    // 进度条动画
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
      }
      updateExecutionFlow({
        id: flowId,
        progress: Math.min(progress, 100),
        message: progress >= 100 ? "任务重启完成" : `正在重启容器: ${Math.round(progress)}%`,
      });
    }, 300);

    // 步骤5: 完成
    setTimeout(() => {
      clearInterval(progressInterval);
      updateStepStatus(flowId, "execute", "completed", "容器重启成功");
      updateStepStatus(flowId, "complete", "active", "验证任务状态...");
    }, 9000);

    setTimeout(() => {
      updateStepStatus(flowId, "complete", "completed", "任务已恢复正常运行");
      updateExecutionFlow({
        id: flowId,
        state: "feedback",
        progress: 100,
        result: "success",
        message: "自愈成功，任务已恢复运行",
      });
      addLog("自愈完成：Llama-v3-Train-08 已恢复", "success");
      setData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          tasksFixed: prev.summary.tasksFixed + 1,
        },
      }));
      setSimulationRunning(false);
    }, 10000);
  }, [simulationRunning, addLog, updateExecutionFlow, updateStepStatus]);

  return {
    data,
    selectedPolicy,
    setSelectedPolicy,
    togglePolicy,
    updatePolicySettings,
    triggerSimulation,
    simulationRunning,
    addLog,
    togglePauseFlow,
    manualTakeover,
    updateTempPolicy,
  };
}
