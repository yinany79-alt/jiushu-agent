"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  id: string;
  type: "agent" | "user";
  text: string;
  timestamp: number;
}

const presetMessages = [
  "Yveson，最近 Llama3 任务频繁 OOM，我已自动将重试等待时间延长，你需要我帮你直接修改研发模式下的初始显存配置吗？",
  "检测到过去 24 小时有 3 个任务因为同样的配置问题失败了。我可以帮你批量调整这些任务的参数，要试试看吗？",
  "当前集群 GPU 利用率较低，我分析了历史数据，建议可以将一些批处理任务调度到低峰期执行，预计能节约 20% 成本。",
];

export function AgentAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化消息
  useEffect(() => {
    setMessages([
      {
        id: "init",
        type: "agent",
        text: presetMessages[0],
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // 模拟 Agent 回复
    setTimeout(() => {
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        type: "agent",
        text: "好的，我这就帮你处理。基于当前自动托管的数据，我建议...",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1000);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl shadow-lg shadow-indigo-500/30"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold">托管助手</p>
            <p className="text-xs text-white/80">有新消息</p>
          </div>
          <Maximize2 size={18} className="ml-2" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border-2 border-indigo-100 flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">托管助手</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    基于自动托管数据 · 在线
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  title="最小化"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  title="关闭"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex gap-3",
                    msg.type === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      msg.type === "agent"
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500"
                        : "bg-slate-300"
                    )}
                  >
                    {msg.type === "agent" ? (
                      <Bot size={18} className="text-white" />
                    ) : (
                      <MessageSquare size={18} className="text-slate-600" />
                    )}
                  </div>
                  <div
                    className={clsx(
                      "max-w-[280px] px-4 py-3 rounded-2xl shadow-sm",
                      msg.type === "agent"
                        ? "bg-white text-slate-700 rounded-tl-sm border border-slate-100"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-tr-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 快捷建议 */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white">
              <p className="text-xs text-slate-500 mb-2 font-medium">快捷问题</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  "查看当前异常",
                  "优化资源配置",
                  "查看节约报告",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInputText(q);
                    }}
                    className="shrink-0 px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* 输入框 */}
            <div className="p-5 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="输入你的问题..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/25"
                >
                  发送
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={clsx(
              "w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all",
              "bg-gradient-to-br from-indigo-500 to-violet-500 text-white",
              "animate-assistant-breathe"
            )}
          >
            <Sparkles size={28} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
