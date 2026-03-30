"use client";

import { useState } from "react";
import { X, Brain, GitCompare, Sparkles, BarChart3 } from "lucide-react";
import { clsx } from "clsx";
import { LineageNode, ModelVersion } from "@/hooks/use-monitoring-mock";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface ModelDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: LineageNode | null;
  selectedNodes: string[];
  modelVersions: ModelVersion[];
  onNodeToggle?: (nodeId: string) => void;
}

interface ComparisonTableProps {
  model1: ModelVersion;
  model2: ModelVersion;
}

function ComparisonTable({ model1, model2 }: ComparisonTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              超参数
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-violet-700">
              {model1.version}
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-emerald-700">
              {model2.version}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr>
            <td className="py-3 px-4 text-slate-600">Learning Rate</td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model1.hyperparams.learningRate.toExponential()}
            </td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model2.hyperparams.learningRate.toExponential()}
            </td>
          </tr>
          <tr className="bg-slate-50/50">
            <td className="py-3 px-4 text-slate-600">Batch Size</td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model1.hyperparams.batchSize}
            </td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model2.hyperparams.batchSize}
            </td>
          </tr>
          <tr>
            <td className="py-3 px-4 text-slate-600">Optimizer</td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model1.hyperparams.optimizer}
            </td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model2.hyperparams.optimizer}
            </td>
          </tr>
          <tr className="bg-slate-50/50">
            <td className="py-3 px-4 text-slate-600">Epochs</td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model1.hyperparams.epochs}
            </td>
            <td className="py-3 px-4 text-center font-mono text-slate-700">
              {model2.hyperparams.epochs}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface PerformanceRadarProps {
  model1: ModelVersion;
  model2: ModelVersion;
}

function PerformanceRadar({ model1, model2 }: PerformanceRadarProps) {
  const radarData = [
    {
      subject: "准确率",
      [model1.version]: model1.metrics.accuracy * 100,
      [model2.version]: model2.metrics.accuracy * 100,
      fullMark: 100,
    },
    {
      subject: "召回率",
      [model1.version]: model1.metrics.recall * 100,
      [model2.version]: model2.metrics.recall * 100,
      fullMark: 100,
    },
    {
      subject: "推理速度",
      [model1.version]: Math.max(0, 100 - model1.metrics.latency),
      [model2.version]: Math.max(0, 100 - model2.metrics.latency),
      fullMark: 100,
    },
    {
      subject: "模型效率",
      [model1.version]: Math.max(0, 100 - model1.metrics.modelSize * 10),
      [model2.version]: Math.max(0, 100 - model2.metrics.modelSize * 10),
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <BarChart3 size={16} className="text-violet-500" />
        性能雷达图
      </h5>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={model1.version}
              dataKey={model1.version}
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
            />
            <Radar
              name={model2.version}
              dataKey={model2.version}
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-xs text-slate-600">{model1.version}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600">{model2.version}</span>
        </div>
      </div>
    </div>
  );
}

interface AIAnalysisProps {
  model1: ModelVersion;
  model2: ModelVersion;
}

function AIAnalysis({ model1, model2 }: AIAnalysisProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-emerald-600" />
        </div>
        <div>
          <h5 className="text-sm font-semibold text-emerald-800 mb-2">AI 评价</h5>
          <p className="text-sm text-emerald-700 leading-relaxed">
            模型 <span className="font-semibold">{model2.version}</span> 相比{" "}
            <span className="font-semibold">{model1.version}</span> 在准确率和召回率指标上提升明显，
            但由于参数量增加（{model2.metrics.modelSize}GB vs {model1.metrics.modelSize}GB），
            推理延迟增加了 {model2.metrics.latency - model1.metrics.latency}ms。
            建议在生产环境使用时考虑开启模型量化或蒸馏。
          </p>
        </div>
      </div>
    </div>
  );
}

export function ModelDetailSidebar({
  isOpen,
  onClose,
  selectedNode,
  selectedNodes,
  modelVersions,
  onNodeToggle,
}: ModelDetailSidebarProps) {
  const isCompareMode = selectedNodes.length === 2;
  const selectedModels = modelVersions.filter(m => selectedNodes.includes(m.id));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[480px] bg-white z-40 shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
              isCompareMode
                ? "bg-gradient-to-br from-violet-500 to-emerald-500"
                : "bg-gradient-to-br from-blue-500 to-indigo-500"
            )}>
              {isCompareMode ? <GitCompare size={20} className="text-white" /> : <Brain size={20} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {isCompareMode ? "模型对比模式" : "节点详情"}
              </span>
              <span className="text-xs text-slate-500">
                {isCompareMode ? `${selectedModels.length} 个模型已选中` : selectedNode?.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isCompareMode && selectedModels.length === 2 ? (
            <>
              <ComparisonTable model1={selectedModels[0]} model2={selectedModels[1]} />
              <PerformanceRadar model1={selectedModels[0]} model2={selectedModels[1]} />
              <AIAnalysis model1={selectedModels[0]} model2={selectedModels[1]} />
            </>
          ) : selectedNode ? (
            <>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-700 mb-3">元数据</h5>
                <pre className="text-xs bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </div>
              {selectedNode.type === "model" && (
                <p className="text-sm text-slate-500 text-center">
                  按住 Shift 点击另一个模型节点进行对比
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Brain size={48} className="mb-4 opacity-50" />
              <p className="text-sm">点击画布上的节点查看详情</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
