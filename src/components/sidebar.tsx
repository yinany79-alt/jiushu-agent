"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Bot,
  Activity,
  LayoutDashboard,
  Network,
  Sparkles,
  Cpu,
  Brain,
  BrainCircuit,
  GitBranch,
  Database,
  HardDrive,
  Workflow,
  Package,
  FolderOpen,
} from "lucide-react";
import { clsx } from "clsx";

export type ActiveTab =
  | "hub"
  | "chat"
  | "monitor"
  | "workspace-detail"
  | "model-square"
  | "experience-center"
  | "online-inference"
  | "offline-inference"
  | "model-dev"
  | "model-finetune"
  | "model-manage"
  | "data-manage"
  | "image-manage"
  | "workflow-dev"
  | "component-manage";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  compact?: boolean;
}

function NavItem({ icon, label, active, onClick, badge, compact }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group w-full flex items-center justify-between gap-2 px-3 rounded-xl text-sm transition-all duration-200",
        compact ? "py-1.5" : "py-2.5",
        active
          ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-medium shadow-sm"
          : "text-slate-600 hover:bg-slate-100/80"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "transition-colors duration-200 flex-shrink-0",
            active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
          )}
        >
          {icon}
        </span>
        <span className={clsx(compact && "text-xs")}>{label}</span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

interface SectionHeaderProps {
  label: string;
  icon?: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
}

function SectionHeader({ label, icon, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {onToggle && (
        open ? (
          <ChevronDown size={14} className="text-slate-400" />
        ) : (
          <ChevronRight size={14} className="text-slate-400" />
        )
      )}
    </button>
  );
}

interface DividerWithLabelProps {
  label: string;
}

function DividerWithLabel({ label }: DividerWithLabelProps) {
  return (
    <div className="flex items-center gap-2 my-2 px-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

interface SidebarProps {
  activeTab?: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab: externalActiveTab, onTabChange }: SidebarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<ActiveTab>("chat");
  const [dataManageOpen, setDataManageOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(true);
  const [modelServiceOpen, setModelServiceOpen] = useState(true);
  const [modelTrainOpen, setModelTrainOpen] = useState(true);
  const [workflowOpen, setWorkflowOpen] = useState(true);

  const activeTab = externalActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: ActiveTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <div className="w-64 h-full glass-strong border-r border-white/50 flex flex-col shadow-soft">
      {/* Logo 区域 */}
      <div className="p-5 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <svg
              width="48"
              height="34"
              viewBox="0 0 229 161"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M135.96 8.99741L48.3154 160.788H100.765C111.223 160.781 121.496 158.025 130.553 152.795C139.61 147.565 147.133 140.045 152.367 130.991L227.998 0H151.573C148.411 0.000235787 145.304 0.831702 142.563 2.41079C139.823 3.98987 137.546 6.26119 135.96 8.99741Z" fill="#3768FA"/>
              <path d="M101.62 0L83.2549 31.8083H209.635L228.242 0H101.62Z" fill="#FF334B"/>
              <path d="M30.591 107.756L0 160.787H100.823V107.756H30.591Z" fill="#3768FA"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-800 tracking-tight">
              九数算法中台
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full border border-amber-200/60">
                Beta
              </span>
              <span className="text-[10px] text-slate-400">Agentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部：核心智能入口 - 固定不滚动 */}
      <div className="p-3 space-y-1.5 border-b border-slate-100">
        <div className="mb-1">
          <SectionHeader label="智能中心" icon={<Sparkles size={14} className="text-indigo-500" />} />
        </div>
        <NavItem
          icon={<BrainCircuit size={18} />}
          label="智能中枢"
          active={activeTab === "hub"}
          onClick={() => handleTabChange("hub")}
        />
        <NavItem
          icon={<Bot size={18} />}
          label="智能开发"
          active={activeTab === "chat"}
          onClick={() => handleTabChange("chat")}
        />
        <NavItem
          icon={<Activity size={18} />}
          label="监控中心"
          active={activeTab === "monitor"}
          onClick={() => handleTabChange("monitor")}
        />
      </div>

      {/* 分隔线 */}
      <DividerWithLabel label="系统功能" />

      {/* 底部：系统原功能区 - 可滚动 */}
      <div className="flex-1 p-3 pt-0 space-y-1 overflow-y-auto">
        {/* 工作空间 */}
        <div>
          <SectionHeader label="工作空间" icon={<LayoutDashboard size={14} />} />
          <div className="ml-2 space-y-0.5 border-l border-slate-200/50 pl-3">
            <NavItem
              compact
              icon={<FolderOpen size={14} />}
              label="工作空间详情"
              active={activeTab === "workspace-detail"}
              onClick={() => handleTabChange("workspace-detail")}
            />
          </div>
        </div>

        {/* 模型服务 */}
        <div className="mt-1">
          <SectionHeader
            label="模型服务"
            icon={<Network size={14} />}
            open={modelServiceOpen}
            onToggle={() => setModelServiceOpen(!modelServiceOpen)}
          />
          {modelServiceOpen && (
            <div className="ml-2 space-y-0.5 border-l border-slate-200/50 pl-3">
              <NavItem
                compact
                icon={<Sparkles size={14} />}
                label="模型广场"
                active={activeTab === "model-square"}
                onClick={() => handleTabChange("model-square")}
              />
              <NavItem
                compact
                icon={<Cpu size={14} />}
                label="体验中心"
                active={activeTab === "experience-center"}
                onClick={() => handleTabChange("experience-center")}
              />
              <NavItem
                compact
                icon={<Network size={14} />}
                label="在线推理"
                active={activeTab === "online-inference"}
                onClick={() => handleTabChange("online-inference")}
              />
              <NavItem
                compact
                icon={<HardDrive size={14} />}
                label="离线推理"
                active={activeTab === "offline-inference"}
                onClick={() => handleTabChange("offline-inference")}
              />
            </div>
          )}
        </div>

        {/* 模型训练 */}
        <div className="mt-1">
          <SectionHeader
            label="模型训练"
            icon={<Brain size={14} />}
            open={modelTrainOpen}
            onToggle={() => setModelTrainOpen(!modelTrainOpen)}
          />
          {modelTrainOpen && (
            <div className="ml-2 space-y-0.5 border-l border-slate-200/50 pl-3">
              <NavItem
                compact
                icon={<Brain size={14} />}
                label="模型开发"
                active={activeTab === "model-dev"}
                onClick={() => handleTabChange("model-dev")}
              />
              <NavItem
                compact
                icon={<GitBranch size={14} />}
                label="模型精调"
                active={activeTab === "model-finetune"}
                onClick={() => handleTabChange("model-finetune")}
              />
              <NavItem
                compact
                icon={<Package size={14} />}
                label="模型管理"
                active={activeTab === "model-manage"}
                onClick={() => handleTabChange("model-manage")}
              />
            </div>
          )}
        </div>

        {/* 资产管理 */}
        <div className="mt-1">
          <SectionHeader
            label="资产管理"
            icon={<Database size={14} />}
            open={assetOpen}
            onToggle={() => setAssetOpen(!assetOpen)}
          />
          {assetOpen && (
            <div className="ml-2 space-y-0.5 border-l border-slate-200/50 pl-3">
              {/* 数据管理 - 二级菜单 */}
              <div>
                <button
                  onClick={() => setDataManageOpen(!dataManageOpen)}
                  className="group w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100/80 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-slate-600">
                      <Database size={14} />
                    </span>
                    数据管理
                  </div>
                  {dataManageOpen ? (
                    <ChevronDown size={14} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400" />
                  )}
                </button>
                {dataManageOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200/50 pl-2">
                    <button className="w-full text-left px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50">
                      数据集列表
                    </button>
                    <button className="w-full text-left px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50">
                      数据标注
                    </button>
                    <button className="w-full text-left px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50">
                      数据版本
                    </button>
                  </div>
                )}
              </div>
              <NavItem
                compact
                icon={<HardDrive size={14} />}
                label="镜像管理"
                active={activeTab === "image-manage"}
                onClick={() => handleTabChange("image-manage")}
              />
            </div>
          )}
        </div>

        {/* AIFlow工作流 */}
        <div className="mt-1">
          <SectionHeader
            label="AIFlow工作流"
            icon={<Workflow size={14} />}
            open={workflowOpen}
            onToggle={() => setWorkflowOpen(!workflowOpen)}
          />
          {workflowOpen && (
            <div className="ml-2 space-y-0.5 border-l border-slate-200/50 pl-3">
              <NavItem
                compact
                icon={<Workflow size={14} />}
                label="工作流开发"
                badge="New"
                active={activeTab === "workflow-dev"}
                onClick={() => handleTabChange("workflow-dev")}
              />
              <NavItem
                compact
                icon={<Package size={14} />}
                label="组件管理"
                active={activeTab === "component-manage"}
                onClick={() => handleTabChange("component-manage")}
              />
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="p-4 border-t border-slate-200/60">
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">
              <Sparkles size={16} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-900">
                试试 Agentic 模式
              </p>
              <p className="text-xs text-indigo-700 mt-0.5">
                用自然语言管理你的 AI 任务
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
