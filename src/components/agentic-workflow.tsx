"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { ThinkingDrawer } from "@/components/thinking-drawer";
import { LossChart } from "@/components/loss-chart";
import { Chatbox } from "@/components/chatbox";
import { useScenario } from "@/hooks/use-scenario";
import { ArrowLeft, BrainCircuit, Code2 } from "lucide-react";
import { usePromptBridge } from "@/lib/prompt-bridge";
import { useDevMode, type DevCanvasNode } from "@/lib/dev-mode-context";
import type { CanvasNode as ScenarioCanvasNode } from "@/lib/scenarios";

// Create context to share scenario state with Chatbox
interface AgenticWorkflowContextType {
  onActionMessageSend?: (message: string) => boolean;
  isScenarioActive?: boolean;
  resetScenario?: () => void;
  autoFillPrompt?: string | null;
  clearAutoFillPrompt?: () => void;
}

const AgenticWorkflowContext = createContext<AgenticWorkflowContextType>({});

export function useAgenticWorkflow() {
  return useContext(AgenticWorkflowContext);
}

interface AgenticWorkflowProps {
  className?: string;
}

export function AgenticWorkflow({ className }: AgenticWorkflowProps) {
  const {
    state,
    startScenario,
    handleCardConfirm,
    handleTrainingComplete,
    resetScenario,
    closeDrawer,
    openDrawer,
    isThinking,
    currentProgress,
  } = useScenario();

  const { convertedPrompt, resetBridge } = usePromptBridge();
  const { syncCanvasToCode, setActiveSource } = useDevMode();
  const [autoFillPrompt, setAutoFillPrompt] = useState<string | null>(null);

  // 将画布节点同步到智能开发
  const handleSyncToDev = useCallback(() => {
    // 转换工作流节点为 DevCanvasNode 格式
    const canvasNodes: DevCanvasNode[] = state.nodes.map((node: ScenarioCanvasNode) => ({
      id: node.node_id,
      type: node.type,
      label: node.label,
      status: node.status,
      agent_type: node.agent_type,
      generatedCode: `# ${node.label}\n# 节点类型: ${node.agent_type}`,
    }));
    syncCanvasToCode(canvasNodes);
    setActiveSource("hub");
  }, [state.nodes, syncCanvasToCode, setActiveSource]);

  useEffect(() => {
    if (convertedPrompt) {
      setAutoFillPrompt(convertedPrompt);
      // Reset the bridge after receiving the prompt
      resetBridge();
    }
  }, [convertedPrompt, resetBridge]);

  const clearAutoFillPrompt = useCallback(() => {
    setAutoFillPrompt(null);
  }, []);

  const handleActionMessageSend = useCallback((message: string): boolean => {
    return startScenario(message);
  }, [startScenario]);

  const contextValue: AgenticWorkflowContextType = {
    onActionMessageSend: handleActionMessageSend,
    isScenarioActive: state.isActive,
    resetScenario,
    autoFillPrompt,
    clearAutoFillPrompt,
  };

  return (
    <AgenticWorkflowContext.Provider value={contextValue}>
      <div className={clsx("flex flex-col h-full relative", className)}>
        {/* Scenario Active View */}
        {state.isActive ? (
          <>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={resetScenario}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">
                    {state.scenario?.name || "任务执行中"}
                  </span>
                  <span className="text-xs text-slate-500">
                    智能中枢 · 画布模式
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSyncToDev}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium shadow-lg shadow-violet-500/30 hover:from-violet-600 hover:to-indigo-600 transition-all"
                >
                  <Code2 size={18} />
                  同步到代码
                </button>
                <button
                  onClick={openDrawer}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  <BrainCircuit size={18} />
                  查看思考
                </button>
              </div>
            </div>

            {/* Workflow Canvas */}
            <div className="flex-1">
              <WorkflowCanvas nodes={state.nodes} />
            </div>
          </>
        ) : (
          /* Chatbox View */
          <Chatbox />
        )}

        {/* Thinking Drawer */}
        <ThinkingDrawer
          isOpen={state.isDrawerOpen}
          onClose={closeDrawer}
          thinkingContent={state.thinkingContent}
          isTyping={state.isTyping}
          isThinking={isThinking}
          isExecuting={state.showLossChart}
          currentProgress={currentProgress}
          card={state.currentCard}
          onCardConfirm={handleCardConfirm}
        >
          {state.showLossChart && <LossChart visible={state.showLossChart} onTrainingComplete={handleTrainingComplete} />}
        </ThinkingDrawer>
      </div>
    </AgenticWorkflowContext.Provider>
  );
}
