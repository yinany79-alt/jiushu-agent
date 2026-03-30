"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  ZAxis,
} from "recharts";
import { clsx } from "clsx";
import { Activity, Zap, AlertCircle, ChevronDown, Server } from "lucide-react";
import { PerformanceDataPoint, ServiceInfo } from "@/hooks/use-monitoring-mock";

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  services: ServiceInfo[];
  selectedServiceId: string;
  onServiceChange: (serviceId: string) => void;
  servicePerformanceData: { [serviceId: string]: PerformanceDataPoint[] };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload as PerformanceDataPoint;
    return (
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
        <p className="text-sm font-medium mb-2">{label}</p>
        <p className="text-xs text-slate-300">
          延迟: <span className="text-emerald-400 font-mono">{payload[0]?.value} ms</span>
        </p>
        <p className="text-xs text-slate-300">
          吞吐量: <span className="text-blue-400 font-mono">{payload[1]?.value} QPS</span>
        </p>
        {point.event && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-xs text-amber-400 flex items-center gap-1">
              {point.isDeployment ? <Zap size={12} /> : <AlertCircle size={12} />}
              {point.event}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function PerformanceChart({
  data,
  services,
  selectedServiceId,
  onServiceChange,
  servicePerformanceData,
}: PerformanceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<PerformanceDataPoint | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const currentData = useMemo(() => {
    return servicePerformanceData[selectedServiceId] || data;
  }, [servicePerformanceData, selectedServiceId, data]);

  const chartData = useMemo(() => {
    return currentData.map(d => ({
      ...d,
      markerSize: d.isDeployment || d.isAnomaly ? 100 : 0,
    }));
  }, [currentData]);

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-emerald-500";
      case "warning": return "bg-amber-500";
      case "critical": return "bg-red-500";
      default: return "bg-slate-400";
    }
  };

  const getServiceStatusLabel = (status: string) => {
    switch (status) {
      case "healthy": return "健康";
      case "warning": return "告警";
      case "critical": return "异常";
      default: return "未知";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <Activity className="text-emerald-600" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800">全链路性能波动</h3>
              {/* 服务选择下拉框 */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Server size={14} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {selectedService?.name}
                  </span>
                  <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-10">
                    <div className="p-2 space-y-1">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            onServiceChange(service.id);
                            setIsDropdownOpen(false);
                          }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            selectedServiceId === service.id
                              ? "bg-emerald-50 text-emerald-800"
                              : "hover:bg-slate-50"
                          )}
                        >
                          <div className={clsx("w-2 h-2 rounded-full", getServiceStatusColor(service.status))} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{service.name}</p>
                            <p className="text-xs text-slate-500">
                              v{service.version} · {getServiceStatusLabel(service.status)}
                            </p>
                          </div>
                          {selectedServiceId === service.id && (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500">过去 24 小时</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">延迟 (ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-600">吞吐量 (QPS)</span>
          </div>
        </div>
      </div>

      {hoveredPoint && (hoveredPoint.isDeployment || hoveredPoint.isAnomaly) && (
        <div className={clsx(
          "mb-4 px-4 py-3 rounded-xl flex items-center gap-3",
          hoveredPoint.isDeployment
            ? "bg-blue-50 border border-blue-200"
            : "bg-amber-50 border border-amber-200"
        )}>
          {hoveredPoint.isDeployment ? <Zap size={18} className="text-blue-600" /> : <AlertCircle size={18} className="text-amber-600" />}
          <div>
            <p className={clsx(
              "text-sm font-medium",
              hoveredPoint.isDeployment ? "text-blue-800" : "text-amber-800"
            )}>
              {hoveredPoint.time}: {hoveredPoint.event}
            </p>
          </div>
        </div>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              yAxisId="left"
              stroke="#22c55e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#3b82f6"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="latency"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#latencyGradient)"
              activeDot={{ r: 6 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="throughput"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#throughputGradient)"
              activeDot={{ r: 6 }}
            />
            <Scatter
              dataKey="markerSize"
              yAxisId="left"
              shape={(props: any) => {
                const point = props.payload as PerformanceDataPoint;
                if (point.isDeployment) {
                  return (
                    <g>
                      <circle cx={props.cx} cy={props.cy} r={8} fill="#3b82f6" stroke="white" strokeWidth={2} />
                      <Zap size={12} x={props.cx - 6} y={props.cy - 6} fill="white" />
                    </g>
                  );
                }
                if (point.isAnomaly) {
                  return (
                    <g>
                      <circle cx={props.cx} cy={props.cy} r={8} fill="#f59e0b" stroke="white" strokeWidth={2} />
                      <AlertCircle size={12} x={props.cx - 6} y={props.cy - 6} fill="white" />
                    </g>
                  );
                }
                return null;
              }}
              onMouseEnter={(_, index) => setHoveredPoint(currentData[index])}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            <ZAxis dataKey="markerSize" range={[0, 100]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
