"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Thermometer,
  Cpu,
  DollarSign,
  Brain,
  GitBranch,
} from "lucide-react";
import { clsx } from "clsx";
import { Task, TaskStatus } from "@/hooks/use-monitoring-mock";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from "recharts";
import { LineageModal } from "@/components/monitoring/lineage-modal";

interface TaskListProps {
  tasks: Task[];
  statusFilter?: TaskStatus | null;
}

interface StatusBadgeProps {
  status: TaskStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case "Healthy":
        return { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 size={14} />, label: "正常" };
      case "Failed":
        return { bg: "bg-red-100", text: "text-red-700", icon: <AlertCircle size={14} />, label: "异常" };
      case "Alerting":
        return { bg: "bg-amber-100", text: "text-amber-700", icon: <AlertCircle size={14} />, label: "告警" };
      case "Idle":
        return { bg: "bg-slate-100", text: "text-slate-600", icon: <Clock size={14} />, label: "待机" };
    }
  };

  const config = getConfig();

  return (
    <div className={clsx(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.bg,
      config.text
    )}>
      <span className={status === "Alerting" || status === "Failed" ? "animate-pulse" : ""}>
        {config.icon}
      </span>
      {config.label}
    </div>
  );
}

interface MiniLossChartProps {
  taskId: string;
}

function MiniLossChart({ taskId }: MiniLossChartProps) {
  const [data, setData] = useState<{ step: number; loss: number; accuracy: number }[]>([]);

  useEffect(() => {
    const initialData = [];
    for (let i = 0; i < 20; i++) {
      initialData.push({
        step: i,
        loss: Math.max(0.2, 2.5 * Math.exp(-i / 5) + 0.3 + (Math.random() - 0.5) * 0.1),
        accuracy: Math.min(0.95, 0.3 + 0.6 * (1 - Math.exp(-i / 6)) + (Math.random() - 0.5) * 0.03),
      });
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const newStep = last.step + 1;
        return [
          ...prev.slice(1),
          {
            step: newStep,
            loss: Math.max(0.15, last.loss * 0.99 + (Math.random() - 0.5) * 0.05),
            accuracy: Math.min(0.98, last.accuracy + (Math.random() - 0.3) * 0.01),
          },
        ];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [taskId]);

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="step" hide />
          <YAxis yAxisId="left" domain={[0, 3]} tick={{ fontSize: 10 }} width={30} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tick={{ fontSize: 10 }} width={30} />
          <Tooltip
            contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="loss"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LiveLogsProps {
  errors?: string[];
}

function LiveLogs({ errors }: LiveLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const baseLogs = [
      "[INFO] 模型参数初始化完成",
      "[INFO] 数据加载器启动",
      "[INFO] 开始训练 epoch 1/10",
      "[INFO] Batch 1/1000 - loss: 2.345",
      "[INFO] Batch 2/1000 - loss: 2.123",
    ];
    if (errors) {
      baseLogs.push(...errors.map(e => `[ERROR] ${e}`));
    }
    setLogs(baseLogs);

    const logMessages = [
      "Batch 3/1000 - loss: 1.987",
      "Batch 4/1000 - loss: 1.876",
      "Checkpoint saved at step 100",
      "Learning rate adjusted to 1.5e-5",
      "Batch 5/1000 - loss: 1.765",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-40), `[INFO] ${logMessages[index % logMessages.length]}`]);
      index++;
    }, 2500);

    return () => clearInterval(interval);
  }, [errors]);

  return (
    <div className="bg-slate-900 rounded-xl p-3 h-40 overflow-y-auto font-mono text-xs">
      {logs.map((log, i) => (
        <div key={i} className={clsx(
          "py-0.5",
          log.includes("[ERROR]") ? "text-red-400" :
          log.includes("[WARNING]") ? "text-amber-400" : "text-slate-300"
        )}>
          {log}
        </div>
      ))}
    </div>
  );
}

interface DiagnosticPopoverProps {
  task: Task;
}

function DiagnosticPopover({ task }: DiagnosticPopoverProps) {
  if (task.status !== "Failed" && task.status !== "Alerting") return null;

  const getDiagnosis = () => {
    if (task.errors?.some(e => e.includes("CUDA out of memory") || e.includes("OOM"))) {
      return {
        title: "检测到 CUDA 显存溢出",
        suggestion: "当前 Batch Size (32) 过大，建议下调至 16，并开启梯度累加以维持收敛速度。",
      };
    }
    if (task.status === "Alerting") {
      return {
        title: "检测到训练不稳定",
        suggestion: "梯度范数持续偏高，建议降低学习率或增加梯度裁剪。",
      };
    }
    return {
      title: "任务执行异常",
      suggestion: "请检查日志获取更多详细信息。",
    };
  };

  const diagnosis = getDiagnosis();

  return (
    <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Brain size={16} className="text-orange-600" />
        </div>
        <div>
          <h5 className="text-sm font-semibold text-orange-800 mb-1">{diagnosis.title}</h5>
          <p className="text-sm text-orange-700">{diagnosis.suggestion}</p>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors">
              应用建议
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-orange-300 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  onOpenLineage: (task: Task) => void;
}

function TaskRow({ task, onOpenLineage }: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(task.id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Training":
        return "bg-violet-100 text-violet-700";
      case "Inference":
        return "bg-blue-100 text-blue-700";
      case "Batch":
        return "bg-teal-100 text-teal-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-700">{task.id}</span>
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600"
              title="复制 ID"
            >
              <Copy size={14} />
            </button>
            <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600" title="跳转">
              <ExternalLink size={14} />
            </button>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-800">{task.name}</span>
            <span className={clsx("text-xs px-2 py-0.5 rounded-full w-fit", getTypeColor(task.type))}>
              {task.type === "Training" ? "训练" : task.type === "Inference" ? "推理" : "批处理"}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          <StatusBadge status={task.status} />
        </td>
        <td className="py-4 px-4">
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">GPU</span>
              <span className="font-mono text-slate-700">{task.gpuUtilization}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full transition-all duration-500",
                  task.gpuUtilization > 80 ? "bg-red-500" :
                  task.gpuUtilization > 50 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${task.gpuUtilization}%` }}
              />
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-col">
            <span className="text-sm text-slate-700">{task.owner}</span>
            <span className="text-xs text-slate-500">{task.space}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-slate-600 font-mono">{task.duration}</span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700">
              <Play size={16} />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700">
              <Pause size={16} />
            </button>
            {task.lineageData && (
              <button
                onClick={() => onOpenLineage(task)}
                className="p-2 hover:bg-violet-100 rounded-lg transition-colors text-violet-500 hover:text-violet-700"
                title="查看血缘"
              >
                <GitBranch size={16} />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-slate-50">
            <div className="p-4 animate-fade-in">
              {/* AI 诊断 */}
              {(task.status === "Failed" || task.status === "Alerting") && (
                <DiagnosticPopover task={task} />
              )}

              <div className="grid grid-cols-12 gap-4 mt-4">
                {/* Mini-Metric Board */}
                <div className="col-span-5">
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-violet-500" />
                      指标面板
                    </h4>
                    {task.type === "Training" ? (
                      <MiniLossChart taskId={task.id} />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                        暂无训练数据
                      </div>
                    )}
                    {task.currentLoss !== undefined && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <div className="text-xs text-slate-500">当前 Loss</div>
                          <div className="text-sm font-mono font-semibold text-emerald-600">
                            {task.currentLoss.toFixed(3)}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <div className="text-xs text-slate-500">Gradient Norm</div>
                          <div className="text-sm font-mono font-semibold text-violet-600">
                            {task.gradientNorm?.toFixed(3) || "-"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hardware Insight */}
                <div className="col-span-3">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 h-full">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Cpu size={16} className="text-blue-500" />
                      物理资源
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Thermometer size={12} />
                          显存带宽
                        </span>
                        <span className="text-sm font-mono font-semibold text-slate-700">
                          {Math.round(task.memoryUsage * 1.2)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${Math.min(100, task.memoryUsage * 1.2)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <DollarSign size={12} />
                          算力成本
                        </span>
                        <span className="text-sm font-mono font-semibold text-amber-600">
                          ¥{Math.round(task.memoryUsage * 2.5)}/h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Logs */}
                <div className="col-span-4">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Activity size={16} className="text-slate-500" />
                        实时日志
                      </h4>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        查看完整日志 →
                      </button>
                    </div>
                    <LiveLogs errors={task.errors} />
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface TaskListWithModalProps {
  tasks: Task[];
  statusFilter?: TaskStatus | null;
}

export function TaskList({ tasks, statusFilter }: TaskListWithModalProps) {
  const [lineageModalTask, setLineageModalTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!statusFilter) return tasks;
    return tasks.filter(t => t.status === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">任务列表</h3>
          <span className="text-sm text-slate-500">
            显示 {filteredTasks.length} 个任务
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">名称</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">资源</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner / Space</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">运行时间</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onOpenLineage={setLineageModalTask}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            没有符合条件的任务
          </div>
        )}
      </div>

      {/* 血缘图谱弹窗 */}
      {lineageModalTask && lineageModalTask.lineageData && (
        <LineageModal
          isOpen={true}
          onClose={() => setLineageModalTask(null)}
          taskName={lineageModalTask.name}
          nodes={lineageModalTask.lineageData.nodes}
          edges={lineageModalTask.lineageData.edges}
        />
      )}
    </>
  );
}
