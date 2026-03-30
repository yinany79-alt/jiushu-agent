"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Code2,
  FileText,
  Bot,
  Cpu,
  Activity,
  Terminal,
  Layout,
  Sparkles,
  MessageSquare,
  Send,
  Wand2,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useDevMode } from "@/lib/dev-mode-context";
import { Markdown } from "@/components/markdown";

// AI 消息类型
interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

// 简单的代码编辑器组件
function CodeEditor({
  content,
  onChange,
  language = "python",
  placeholder,
}: {
  content: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
}) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full h-full bg-slate-950 text-slate-100 font-mono text-sm p-4",
        "border-none outline-none resize-none",
        "placeholder:text-slate-600"
      )}
      placeholder={placeholder || `# 在这里编写 ${language} 代码...`}
      spellCheck={false}
    />
  );
}

// Markdown 渲染器（简化版）
function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="p-4 text-slate-200 prose prose-invert prose-sm max-w-none">
      <Markdown content={content} />
    </div>
  );
}

// AI 聊天面板
function AIChatPanel({
  cellId,
  onClose,
  onInsertCode,
}: {
  cellId: string;
  onClose: () => void;
  onInsertCode: (code: string) => void;
}) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "你好！我可以帮你编写、解释或优化代码。你需要什么帮助？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 模拟 AI 回复
    setTimeout(() => {
      const responses = [
        "我来帮你写这段代码！\n\n```python\n# 这是一个示例代码\ndef process_data(data):\n    return [x * 2 for x in data]\n```",
        "好的，我来解释一下这段代码的逻辑...\n\n你可以这样优化：\n\n```python\n# 优化后的版本\nimport pandas as pd\n\ndf = pd.read_csv('data.csv')\n```",
        "让我帮你修复这个问题。试试这个版本：\n\n```python\n# 修复后的代码\nimport numpy as np\n\narr = np.array([1, 2, 3])\nprint(arr.mean())\n```",
      ];
      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleInsertCode = () => {
    // 从最后一条 AI 消息中提取代码
    const lastMsg = messages.filter((m) => m.role === "assistant").pop();
    if (lastMsg) {
      // 简单提取代码块
      const codeMatch = lastMsg.content.match(/```python\n([\s\S]*?)\n```/);
      if (codeMatch) {
        onInsertCode(codeMatch[1]);
      } else {
        onInsertCode(lastMsg.content);
      }
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      {/* 聊天面板头部 */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-200">AI 编程助手</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex gap-3 max-w-[90%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                msg.role === "user"
                  ? "bg-slate-600"
                  : "bg-gradient-to-br from-violet-500 to-indigo-500"
              )}
            >
              {msg.role === "user" ? (
                <MessageSquare size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-white" />
              )}
            </div>
            <div
              className={clsx(
                "rounded-xl p-3",
                msg.role === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-200 border border-slate-700"
              )}
            >
              <div className="text-sm">
                {msg.content.includes("```") ? (
                  <Markdown content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "assistant" && msg.content.includes("```") && (
                <button
                  onClick={handleInsertCode}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Code2 size={14} />
                  插入代码
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="问我任何代码问题..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 单个单元格组件
function Cell({ cellId }: { cellId: string }) {
  const { cells, updateCell, removeCell, addCell } = useDevMode();
  const [isRunning, setIsRunning] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const cell = cells.find((c) => c.id === cellId);
  if (!cell) return null;

  const handleRun = () => {
    if (cell.type !== "code") return;
    setIsRunning(true);
    updateCell(cellId, { status: "running" });

    // 模拟执行
    setTimeout(() => {
      setIsRunning(false);
      updateCell(cellId, {
        status: "success",
        output: "执行成功！\n输出: (模拟结果)\n" + (cell.content.slice(0, 50) + "..."),
        executionCount: (cell.executionCount || 0) + 1,
      });
    }, 800 + Math.random() * 1000);
  };

  const handleInsertCode = (code: string) => {
    updateCell(cellId, { content: code });
  };

  return (
    <div className="flex gap-2 py-2 border-b border-slate-800 hover:bg-slate-900/50">
      {/* 左侧操作栏 */}
      <div className="flex flex-col items-center gap-1 py-2 w-12 flex-shrink-0">
        <span className="text-xs font-mono text-slate-500">
          {cell.type === "code" && cell.executionCount ? `[${cell.executionCount}]` : "[ ]"}
        </span>
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {cell.type === "code" && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={clsx(
                "p-1 rounded hover:bg-slate-700 transition-colors",
                isRunning ? "text-blue-400 animate-pulse" : "text-green-400"
              )}
              title="运行"
            >
              <Play size={14} fill={isRunning ? "currentColor" : "none"} />
            </button>
          )}
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={clsx(
              "p-1 rounded hover:bg-slate-700 transition-colors",
              showAIChat ? "text-violet-400 bg-violet-500/20" : "text-slate-400 hover:text-violet-400"
            )}
            title="AI 辅助"
          >
            <Sparkles size={14} />
          </button>
          <button
            onClick={() => addCell({ type: "code", content: "" })}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            title="下方插入单元格"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => removeCell(cellId)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-w-0 flex gap-2">
        <div className="flex-1 min-w-0">
          {cell.type === "markdown" ? (
            <div className="bg-slate-900/50 rounded-lg border border-slate-800">
              <MarkdownViewer content={cell.content} />
            </div>
          ) : (
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <div className="h-48">
                <CodeEditor
                  content={cell.content}
                  onChange={(value) => updateCell(cellId, { content: value })}
                  placeholder="# 在这里编写 Python 代码...\n# 点击左侧的 AI 按钮让 AI 帮你写代码"
                />
              </div>
              {cell.output && (
                <div className={clsx(
                  "border-t border-slate-800 p-3 font-mono text-sm",
                  cell.status === "error" ? "text-red-300 bg-red-950/30" : "text-slate-400"
                )}>
                  <pre className="whitespace-pre-wrap">{cell.output}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI 聊天面板（展开时） */}
        {showAIChat && (
          <div className="w-80 flex-shrink-0">
            <AIChatPanel
              cellId={cellId}
              onClose={() => setShowAIChat(false)}
              onInsertCode={handleInsertCode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 顶部工具栏
function Toolbar() {
  const { addCell, cells, syncCodeToCanvas, activeSource, setActiveSource } = useDevMode();

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">AILab</span>
          <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 rounded-full border border-violet-500/30">
            智能开发
          </span>
        </div>

        <div className="h-5 w-px bg-slate-700" />

        {/* 源切换 - 用于未来功能互通 */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveSource("hub")}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              activeSource === "hub"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Layout size={12} />
              画布源
            </div>
          </button>
          <button
            onClick={() => setActiveSource("dev")}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              activeSource === "dev"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Code2 size={12} />
              代码源
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => addCell({ type: "markdown", content: "## 新章节" })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <FileText size={14} />
          Markdown
        </button>
        <button
          onClick={() => addCell({ type: "code", content: "" })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Code2 size={14} />
          代码
        </button>
        <div className="h-5 w-px bg-slate-700 mx-1" />
        <button
          onClick={() => syncCodeToCanvas()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
          title="同步到画布（预留接口）"
        >
          <Activity size={14} />
          同步到画布
        </button>
      </div>
    </div>
  );
}

// 右侧边栏（资源监控等）
function SidePanel() {
  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">资源状态</h3>
      </div>

      <div className="p-3 space-y-3">
        {/* CPU */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-blue-400" />
              <span className="text-xs text-slate-300">CPU</span>
            </div>
            <span className="text-xs font-mono text-blue-400">35%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-blue-500 rounded-full" />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-green-400" />
              <span className="text-xs text-slate-300">RAM</span>
            </div>
            <span className="text-xs font-mono text-green-400">19%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[19%] bg-green-500 rounded-full" />
          </div>
        </div>

        {/* GPU */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-orange-400" />
              <span className="text-xs text-slate-300">GPU (A100)</span>
            </div>
            <span className="text-xs font-mono text-orange-400">85%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-orange-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 mt-auto">
        <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-lg p-3 border border-violet-500/20">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-violet-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-violet-200">AI 辅助编程</p>
              <p className="text-[11px] text-violet-300/80 mt-1">
                点击单元格左侧的 ✨ 按钮让 AI 帮你写代码
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 底部面板
function BottomPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={clsx(
      "border-t border-slate-800 bg-slate-950 transition-all duration-300",
      isOpen ? "h-48" : "h-8"
    )}>
      <div className="flex items-center justify-between px-4 h-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
            <Terminal size={12} />
            终端
          </button>
          <button className="text-xs text-slate-500 hover:text-slate-300">问题</button>
          <button className="text-xs text-slate-500 hover:text-slate-300">输出</button>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 hover:text-slate-300"
        >
          {isOpen ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-green-500">user@ailab</span>
            <span className="text-slate-600">:</span>
            <span className="text-blue-400">~/project</span>
            <span className="text-slate-500">$</span>
            <span className="text-slate-300 ml-1 animate-pulse">_</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 主组件
export function IntelligentDev() {
  const { cells, activeSource } = useDevMode();

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* 顶部工具栏 */}
      <Toolbar />

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 笔记本主体 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto py-6">
              {/* 同步提示 */}
              {activeSource === "hub" && (
                <div className="mx-6 mb-4 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center gap-3">
                  <Activity size={18} className="text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-violet-200">画布源模式</p>
                    <p className="text-xs text-violet-300/70">在此查看从智能中枢同步的工作流代码</p>
                  </div>
                </div>
              )}

              {/* 单元格列表 */}
              <div className="mx-2">
                {cells.map((cell) => (
                  <Cell key={cell.id} cellId={cell.id} />
                ))}

                {/* 添加单元格按钮 */}
                <div className="flex justify-center py-8">
                  <button
                    onClick={() => {}}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    点击添加单元格
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 底部面板 */}
          <BottomPanel />
        </div>

        {/* 右侧边栏 */}
        <SidePanel />
      </div>
    </div>
  );
}
