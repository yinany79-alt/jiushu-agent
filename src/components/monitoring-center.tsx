"use client";

import React, { useState, useCallback } from "react";
import { Activity, RefreshCw, Zap, Play } from "lucide-react";
import { clsx } from "clsx";
import { useMonitoringMock, TaskStatus } from "@/hooks/use-monitoring-mock";
import { useAutoHostingMock } from "@/hooks/use-auto-hosting-mock";
import { AiInsightCard } from "@/components/monitoring/ai-insight-card";
import { TaskStatusDonut } from "@/components/monitoring/task-status-donut";
import { PerformanceChart } from "@/components/monitoring/performance-chart";
import { GPUHeatmap } from "@/components/monitoring/gpu-heatmap";
import { TaskList } from "@/components/monitoring/task-list";
import { FinopsWidget } from "@/components/monitoring/finops-widget";
import {
  AutonomousSummary,
  ExecutionFlow,
  PolicyMatrix,
  PolicyDrawer,
  AgentAssistant,
} from "@/components/autonomous";

type MonitorTab = "overview" | "auto-hosting";

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-white text-slate-800 shadow-md border border-slate-200"
          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function AutoHostingContent() {
  const {
    data,
    selectedPolicy,
    setSelectedPolicy,
    togglePolicy,
    updatePolicySettings,
    triggerSimulation,
    simulationRunning,
    togglePauseFlow,
    manualTakeover,
    updateTempPolicy,
  } = useAutoHostingMock();

  return (
    <div className="relative h-full">
      {/* 主要内容区域 */}
      <div className="p-6 pb-48 space-y-8">
        {/* 顶部：全站托管概览 */}
        <AutonomousSummary data={data} />

        {/* 中部：动态策略执行流 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-800">实时干预线程</h2>
            </div>
            <button
              onClick={triggerSimulation}
              disabled={simulationRunning}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                simulationRunning
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-md shadow-indigo-500/25"
              )}
            >
              <Play size={16} />
              {simulationRunning ? "模拟中..." : "模拟异常"}
            </button>
          </div>
          <ExecutionFlow
            flows={data.executionFlows}
            onTogglePause={togglePauseFlow}
            onManualTakeover={manualTakeover}
            onUpdateTempPolicy={updateTempPolicy}
          />
        </div>

        {/* 底部：策略配置矩阵 */}
        <PolicyMatrix
          policies={data.policies}
          onTogglePolicy={togglePolicy}
          onConfigurePolicy={setSelectedPolicy}
        />
      </div>

      {/* 策略抽屉 */}
      <PolicyDrawer
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        onUpdateSettings={updatePolicySettings}
      />

      {/* AI 助手 */}
      <AgentAssistant />
    </div>
  );
}

export function MonitoringCenter() {
  const [activeTab, setActiveTab] = useState<MonitorTab>("overview");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("ctr-ranking");
  const { data, toggleWarning } = useMonitoringMock();

  return (
    <div className="flex flex-col h-full bg-gradient-animated bg-grid">
      {/* 顶部 Tab 栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TabButton
            active={activeTab === "overview"}
            icon={<Activity size={18} />}
            label="监控总览"
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            active={activeTab === "auto-hosting"}
            icon={<Zap size={18} />}
            label="自动托管"
            onClick={() => setActiveTab("auto-hosting")}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleWarning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={16} />
            切换场景
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" ? (
          /* 监控总览 Tab */
          <div className="p-6 space-y-6">
            {/* AI Insight Card */}
            <AiInsightCard data={data.aiInsight} />

            {/* FinOps Widget */}
            <FinopsWidget
              idleCount={data.finopsAlert.idleCount}
              dailyCost={data.finopsAlert.dailyCost}
            />

            {/* 中部三图区域 */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4">
                <TaskStatusDonut
                  stats={data.taskStats}
                  tasks={data.tasks}
                  onStatusFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                />
              </div>
              <div className="col-span-8">
                <PerformanceChart
                  data={data.performanceData}
                  services={data.services}
                  selectedServiceId={selectedServiceId}
                  onServiceChange={setSelectedServiceId}
                  servicePerformanceData={data.servicePerformanceData}
                />
              </div>
            </div>

            {/* GPU 热力图 */}
            <GPUHeatmap cards={data.gpuCards} />

            {/* 任务列表 */}
            <TaskList tasks={data.tasks} statusFilter={statusFilter} />
          </div>
        ) : (
          /* 自动托管 Tab */
          <div className="h-full overflow-y-auto">
            <AutoHostingContent />
          </div>
        )}
      </div>
    </div>
  );
}
