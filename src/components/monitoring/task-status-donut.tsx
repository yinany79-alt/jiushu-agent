"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { clsx } from "clsx";
import { TaskStatus, Task } from "@/hooks/use-monitoring-mock";

interface TaskStatusDonutProps {
  stats: Record<TaskStatus, number>;
  tasks: Task[];
  onStatusFilter?: TaskStatus | null;
  onFilterChange?: (status: TaskStatus | null) => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  Healthy: "#22c55e",
  Failed: "#ef4444",
  Alerting: "#f59e0b",
  Idle: "#94a3b8",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  Healthy: "正常",
  Failed: "异常",
  Alerting: "告警",
  Idle: "待机",
};

export function TaskStatusDonut({ stats, tasks, onStatusFilter, onFilterChange }: TaskStatusDonutProps) {
  const [activeStatus, setActiveStatus] = useState<TaskStatus | null>(null);

  const chartData = useMemo(() => {
    return Object.entries(stats).map(([status, value]) => ({
      name: status as TaskStatus,
      value,
    }));
  }, [stats]);

  const total = useMemo(() => {
    return Object.values(stats).reduce((sum, val) => sum + val, 0);
  }, [stats]);

  const handleClick = (status: TaskStatus) => {
    const newStatus = activeStatus === status ? null : status;
    setActiveStatus(newStatus);
    onFilterChange?.(newStatus);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">训练任务状态</h3>
        <span className="text-sm text-slate-500">共 {total} 个任务</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                onClick={(_, index) => handleClick(chartData[index].name)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name]}
                    stroke={activeStatus === entry.name ? "#1e293b" : "white"}
                    strokeWidth={activeStatus === entry.name ? 3 : 2}
                    className={clsx(
                      "transition-all duration-300 cursor-pointer hover:opacity-80",
                      activeStatus && activeStatus !== entry.name ? "opacity-40" : ""
                    )}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const status = payload[0].name as TaskStatus;
                    const tasksInStatus = tasks.filter(t => t.status === status);
                    return (
                      <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl text-sm min-w-[200px]">
                        <p className="font-medium mb-2">{STATUS_LABELS[status]} · {payload[0].value} 个任务</p>
                        <div className="border-t border-slate-600 pt-2 space-y-1">
                          {tasksInStatus.slice(0, 4).map(task => (
                            <p key={task.id} className="text-slate-300 text-xs">
                              • {task.name}
                            </p>
                          ))}
                          {tasksInStatus.length > 4 && (
                            <p className="text-slate-400 text-xs">
                              还有 {tasksInStatus.length - 4} 个任务...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 min-w-[120px]">
          {chartData.map((entry) => (
            <button
              key={entry.name}
              onClick={() => handleClick(entry.name)}
              className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-xl transition-all",
                "hover:bg-slate-100",
                activeStatus === entry.name ? "bg-slate-100 ring-2 ring-slate-300" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                />
                <span className="text-sm text-slate-600">
                  {STATUS_LABELS[entry.name]}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {entry.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeStatus && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            正在筛选: <span className="font-medium text-slate-700">{STATUS_LABELS[activeStatus]}</span>
            <button
              onClick={() => { setActiveStatus(null); onFilterChange?.(null); }}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              清除筛选
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
