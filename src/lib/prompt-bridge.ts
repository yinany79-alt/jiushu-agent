"use client";

import React from "react";
import { createContext, useContext, useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type BridgeState = "idle" | "converting" | "ready" | "error";

interface PromptBridgeContextType {
  bridgeState: BridgeState;
  convertedPrompt: string | null;
  conversationHistory: Message[];
  startConversion: (history: Message[]) => void;
  setConvertedPrompt: (prompt: string) => void;
  setConversionError: () => void;
  resetBridge: () => void;
}

const PromptBridgeContext = createContext<PromptBridgeContextType | undefined>(undefined);

export function PromptBridgeProvider({ children }: { children: React.ReactNode }) {
  const [bridgeState, setBridgeState] = useState<BridgeState>("idle");
  const [convertedPrompt, setConvertedPromptState] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  const startConversion = useCallback((history: Message[]) => {
    setConversationHistory(history);
    setBridgeState("converting");
    setConvertedPromptState(null);
  }, []);

  const setConvertedPrompt = useCallback((prompt: string) => {
    setConvertedPromptState(prompt);
    setBridgeState("ready");
  }, []);

  const setConversionError = useCallback(() => {
    setBridgeState("error");
  }, []);

  const resetBridge = useCallback(() => {
    setBridgeState("idle");
    setConvertedPromptState(null);
    setConversationHistory([]);
  }, []);

  const contextValue = {
    bridgeState,
    convertedPrompt,
    conversationHistory,
    startConversion,
    setConvertedPrompt,
    setConversionError,
    resetBridge,
  };

  return React.createElement(PromptBridgeContext.Provider, { value: contextValue }, children);
}

export function usePromptBridge() {
  const context = useContext(PromptBridgeContext);
  if (context === undefined) {
    throw new Error("usePromptBridge must be used within a PromptBridgeProvider");
  }
  return context;
}
