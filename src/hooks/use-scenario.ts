"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Scenario,
  CanvasNode,
  InteractionCard,
  matchScenario,
  NodeStatus,
} from "@/lib/scenarios";

export interface ScenarioState {
  isActive: boolean;
  scenario: Scenario | null;
  nodes: CanvasNode[];
  thinkingContent: string;
  isTyping: boolean;
  currentCard: InteractionCard | null;
  waitingForCard: boolean;
  showLossChart: boolean;
  isDrawerOpen: boolean;
}

const initialState: ScenarioState = {
  isActive: false,
  scenario: null,
  nodes: [],
  thinkingContent: "",
  isTyping: false,
  currentCard: null,
  waitingForCard: false,
  showLossChart: false,
  isDrawerOpen: false,
};

export function useScenario() {
  const [state, setState] = useState<ScenarioState>(initialState);
  const [isThinking, setIsThinking] = useState(false);
  const stepIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, []);

  // 处理节点更新
  const applyNodeChanges = useCallback((currentNodes: CanvasNode[], step: any) => {
    let newNodes = [...currentNodes];

    if (step.nodes_to_add) {
      for (const nodeToAdd of step.nodes_to_add) {
        const existingIndex = newNodes.findIndex(n => n.node_id === nodeToAdd.node_id);
        if (existingIndex >= 0) {
          newNodes[existingIndex] = { ...newNodes[existingIndex], ...nodeToAdd };
        } else {
          newNodes.push({ ...nodeToAdd, visible: true });
        }
      }
    }

    if (step.node_updates) {
      newNodes = newNodes.map((node) => {
        const update = step.node_updates!.find(
          (u: any) => u.node_id === node.node_id
        );
        if (update) {
          return { ...node, status: update.status as NodeStatus };
        }
        return node;
      });
    }

    return newNodes;
  }, []);

  // 打字效果
  const startTypingEffect = useCallback((fullContent: string, onComplete: () => void) => {
    // 清除之前的定时器
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setState((prev) => ({ ...prev, thinkingContent: "", isTyping: true }));

    let index = 0;
    let completed = false;

    typingIntervalRef.current = setInterval(() => {
      if (index >= fullContent.length) {
        if (completed) return;
        completed = true;

        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setState((prev) => ({ ...prev, isTyping: false }));
        onComplete();
        return;
      }

      const nextIndex = Math.min(index + 3, fullContent.length);
      const currentContent = fullContent.slice(0, nextIndex);
      index = nextIndex;

      setState((prev) => ({ ...prev, thinkingContent: currentContent }));
    }, 35);
  }, []);

  // 执行下一步 - 核心逻辑
  const executeNextStep = useCallback(() => {
    // 先读取当前状态快照来决定下一步
    const currentStepIndex = stepIndexRef.current;

    setState((currentState) => {
      if (!currentState.scenario) return currentState;

      const steps = currentState.scenario.steps;

      if (currentStepIndex >= steps.length) {
        return currentState;
      }

      const step = steps[currentStepIndex];

      let newState: ScenarioState = {
        ...currentState,
        currentCard: null,
      };

      // 先更新节点（不管什么类型的步骤）
      newState.nodes = applyNodeChanges(newState.nodes, step);

      switch (step.type) {
        case "thinking":
          // 只有在 thinking 类型时才立即递增 index
          stepIndexRef.current = currentStepIndex + 1;
          if (step.content) {
            startTypingEffect(step.content, () => {
              if (step.auto_continue === true) {
                timeoutRef.current = setTimeout(() => {
                  executeNextStep();
                }, step.delay || 500);
              }
            });
          } else {
            timeoutRef.current = setTimeout(() => {
              executeNextStep();
            }, step.delay || 100);
          }
          break;

        case "card":
          if (step.card) {
            newState = {
              ...newState,
              currentCard: step.card,
              waitingForCard: true,
            };
          }
          // 注意：card 类型不立即递增 index，等到用户确认后再递增
          break;

        case "show_loss_chart":
          newState.showLossChart = true;
          // 不自动继续，等待 LossChart 组件训练完成后调用 handleTrainingComplete
          // 注意：show_loss_chart 类型不立即递增 index
          break;
      }

      return newState;
    });
  }, [startTypingEffect, applyNodeChanges]);

  const startScenario = useCallback((userInput: string) => {
    clearAllTimeouts();

    const scenario = matchScenario(userInput);
    if (!scenario) return false;

    stepIndexRef.current = 0;

    setState({
      isActive: true,
      scenario,
      nodes: scenario.initialNodes.map(n => ({ ...n, visible: true })),
      thinkingContent: "",
      isTyping: false,
      currentCard: null,
      waitingForCard: false,
      showLossChart: false,
      isDrawerOpen: true,
    });

    // 开始执行
    setTimeout(() => {
      executeNextStep();
    }, 300);

    return true;
  }, [clearAllTimeouts, executeNextStep]);

  const handleCardConfirm = useCallback((value: string) => {
    // 清除所有定时器，防止意外执行
    clearAllTimeouts();

    // 用户确认卡片后，先递增 stepIndex
    stepIndexRef.current++;

    setState((prev) => {
      // 只有当确实有卡片时才执行
      if (!prev.scenario || !prev.currentCard) return prev;

      const newState = {
        ...prev,
        currentCard: null,
        waitingForCard: false,
      };

      return newState;
    });

    // 1000ms thinking delay after user confirmation
    setIsThinking(true);
    timeoutRef.current = setTimeout(() => {
      setIsThinking(false);
      executeNextStep();
    }, 1000);
  }, [executeNextStep, clearAllTimeouts]);

  const handleTrainingComplete = useCallback(() => {
    // 训练完成后，先递增 stepIndex
    stepIndexRef.current++;
    setState(prev => ({ ...prev, showLossChart: false }));
    setTimeout(() => {
      executeNextStep();
    }, 500);
  }, [executeNextStep]);

  const resetScenario = useCallback(() => {
    clearAllTimeouts();
    stepIndexRef.current = 0;
    setState(initialState);
  }, [clearAllTimeouts]);

  const closeDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, isDrawerOpen: false }));
  }, []);

  const openDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, isDrawerOpen: true }));
  }, []);

  const currentProgress = useMemo(() => {
    if (!state.scenario) return { current: 0, total: 0 };
    return {
      current: stepIndexRef.current,
      total: state.scenario.steps.length,
    };
  }, [state.scenario]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    state,
    startScenario,
    handleCardConfirm,
    handleTrainingComplete,
    resetScenario,
    closeDrawer,
    openDrawer,
    currentProgress,
    isThinking,
  };
}
