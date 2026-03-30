"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { AgenticWorkflow } from "@/components/agentic-workflow";
import { IntelligentDev } from "@/components/intelligent-dev";
import { MonitoringCenter } from "@/components/monitoring-center";
import type { ActiveTab } from "@/components/sidebar";
import { PromptBridgeProvider } from "@/lib/prompt-bridge";
import { DevModeProvider } from "@/lib/dev-mode-context";

function HomeContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("hub");

  const renderContent = () => {
    switch (activeTab) {
      case "hub":
        return <AgenticWorkflow />;
      case "chat":
        return <IntelligentDev />;
      case "monitor":
        return <MonitoringCenter />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                功能开发中
              </h2>
              <p className="text-slate-500">
                该模块正在紧张开发中，敬请期待！
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* 主内容区域 */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <DevModeProvider>
      <PromptBridgeProvider>
        <HomeContent />
      </PromptBridgeProvider>
    </DevModeProvider>
  );
}
