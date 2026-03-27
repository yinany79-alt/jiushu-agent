"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

  const startTypingEffect = useCallback((fullContent: string) => {
    setState((prev) => ({ ...prev, thinkingContent: "", isTyping: true }));

    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      if (index >= fullContent.length) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setState((prev) => ({ ...prev, isTyping: false }));
        return;
      }

      const nextIndex = Math.min(index + 3, fullContent.length);
      const currentContent = fullContent.slice(0, nextIndex);
      index = nextIndex;

      setState((prev) => ({ ...prev, thinkingContent: currentContent }));
    }, 15);
  }, []);

  const executeNextStep = useCallback(() => {
    setState((currentState) => {
      if (!currentState.scenario) return currentState;

      const steps = currentState.scenario.steps;
      const stepIndex = stepIndexRef.current;

      if (stepIndex >= steps.length) {
        return currentState;
      }

      const step = steps[stepIndex];

      // Increment step index immediately
      stepIndexRef.current++;

      // Schedule next step based on delay
      const delay = step.delay || 0;

      timeoutRef.current = setTimeout(() => {
        executeNextStep();
      }, delay + 100);

      let newState = { ...currentState };

      switch (step.type) {
        case "thinking":
          if (step.content) {
            startTypingEffect(step.content);
          }
          break;

        case "card":
          if (step.card) {
            newState = {
              ...newState,
              currentCard: step.card,
              waitingForCard: true,
            };
            // Pause execution waiting for card confirmation
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
          break;

        case "node_update":
          if (step.node_updates) {
            const updatedNodes = newState.nodes.map((node) => {
              const update = step.node_updates!.find(
                (u) => u.node_id === node.node_id
              );
              if (update) {
                return { ...node, status: update.status as NodeStatus };
              }
              return node;
            });
            newState = { ...newState, nodes: updatedNodes };
          }
          break;

        case "add_nodes":
          if (step.nodes_to_add) {
            // 添加新节点，保持现有节点
            const newNodes = [...newState.nodes];
            for (const nodeToAdd of step.nodes_to_add) {
              // 检查节点是否已存在
              const existingIndex = newNodes.findIndex(n => n.node_id === nodeToAdd.node_id);
              if (existingIndex >= 0) {
                newNodes[existingIndex] = { ...newNodes[existingIndex], ...nodeToAdd };
              } else {
                newNodes.push({ ...nodeToAdd, visible: true });
              }
            }
            newState = { ...newState, nodes: newNodes };
          }
          break;
      }

      return newState;
    });
  }, [startTypingEffect]);

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
      showLossChart: !!scenario.showLossChart,
      isDrawerOpen: true,
    });

    // Start execution after a short delay
    timeoutRef.current = setTimeout(() => {
      executeNextStep();
    }, 300);

    return true;
  }, [clearAllTimeouts, executeNextStep]);

  const handleCardConfirm = useCallback((value: string) => {
    setState((prev) => {
      if (!prev.scenario) return prev;

      // Clear the card and resume execution
      const newState = {
        ...prev,
        currentCard: null,
        waitingForCard: false,
      };

      // Resume step execution
      timeoutRef.current = setTimeout(() => {
        executeNextStep();
      }, 200);

      return newState;
    });
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    state,
    startScenario,
    handleCardConfirm,
    resetScenario,
    closeDrawer,
    openDrawer,
  };
}
