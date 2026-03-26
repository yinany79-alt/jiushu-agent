"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Bot,
  Activity,
  Layout,
  Server,
  Database,
  GitBranch,
  Settings,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
        active
          ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-medium shadow-sm"
          : "text-slate-600 hover:bg-slate-100/80"
      )}
    >
      <span
        className={clsx(
          "transition-colors duration-200",
          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");

  return (
    <div className="w-64 h-full glass-strong border-r border-white/50 flex flex-col shadow-soft">
      {/* Logo 区域 */}
      <div className="p-5 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          {/* Logo 图标 */}
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
          {/* 文字 */}
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

      {/* 导航菜单 */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {/* 平台功能 - 折叠区域 */}
        <div className="mb-3">
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layout size={14} />
              平台功能
            </span>
            {platformOpen ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
          </button>

          {platformOpen && (
            <div className="mt-1.5 ml-2 space-y-1 border-l border-slate-200/80 pl-3">
              <NavItem
                icon={<Server size={16} />}
                label="资源管理"
                onClick={() => setActiveTab("resources")}
              />
              <NavItem
                icon={<Database size={16} />}
                label="数据中心"
                onClick={() => setActiveTab("data")}
              />
              <NavItem
                icon={<GitBranch size={16} />}
                label="训练任务"
                onClick={() => setActiveTab("train")}
              />
              <NavItem
                icon={<Settings size={16} />}
                label="系统设置"
                onClick={() => setActiveTab("settings")}
              />
            </div>
          )}
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent my-2" />

        {/* 智能开发 */}
        <NavItem
          icon={<Bot size={18} />}
          label="智能开发"
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />

        {/* 监控中心 */}
        <NavItem
          icon={<Activity size={18} />}
          label="监控中心"
          active={activeTab === "monitor"}
          onClick={() => setActiveTab("monitor")}
        />
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
