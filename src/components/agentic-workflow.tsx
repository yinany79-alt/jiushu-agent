"use client";

import { createContext, useContext, useCallback } from "react";
import { clsx } from "clsx";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { ThinkingDrawer } from "@/components/thinking-drawer";
import { LossChart } from "@/components/loss-chart";
import { Chatbox } from "@/components/chatbox";
import { useScenario } from "@/hooks/use-scenario";
import { ArrowLeft, BrainCircuit } from "lucide-react";

// Create context to share scenario state with Chatbox
interface AgenticWorkflowContextType {
  onActionMessageSend?: (message: string) => boolean;
  isScenarioActive?: boolean;
  resetScenario?: () => void;
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
    resetScenario,
    closeDrawer,
    openDrawer,
  } = useScenario();

  const handleActionMessageSend = useCallback((message: string): boolean => {
    return startScenario(message);
  }, [startScenario]);

  const contextValue: AgenticWorkflowContextType = {
    onActionMessageSend: handleActionMessageSend,
    isScenarioActive: state.isActive,
    resetScenario,
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
                    Agentic Workflow 模式
                  </span>
                </div>
              </div>
              <button
                onClick={openDrawer}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <BrainCircuit size={18} />
                查看思考
              </button>
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
          card={state.currentCard}
          onCardConfirm={handleCardConfirm}
        >
          {state.showLossChart && <LossChart visible={state.isActive} />}
        </ThinkingDrawer>
      </div>
    </AgenticWorkflowContext.Provider>
  );
}
