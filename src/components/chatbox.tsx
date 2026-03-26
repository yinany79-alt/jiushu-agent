"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, Zap, Paperclip, X, ArrowUp, Lightbulb } from "lucide-react";
import { clsx } from "clsx";

type Mode = "qa" | "action";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: FileItem[];
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function Chatbox() {
  const [mode, setMode] = useState<Mode>("qa");
  const [planEnabled, setPlanEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (hasMessages) {
      scrollToBottom();
    }
  }, [messages, hasMessages]);

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      files: files.length > 0 ? files : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFiles([]);

    // 模拟回复
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mode === "action"
          ? "收到！让我来帮你执行这个任务。我会调用相应的工具来完成操作。"
          : "收到！让我来回答你的问题。在实际版本中，我会结合知识库给你更准确的回答。",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={clsx(
      "flex flex-col h-full relative overflow-hidden",
      mode === "qa" ? "bg-gradient-animated bg-grid" : "bg-slate-900"
    )}>
      {/* 行动模式背景代码滚动效果 */}
      {mode === "action" && <CodeBackground />}

      {hasMessages ? (
        <>
          {/* 有消息时的布局 - 消息在上面，输入框在底部 */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* 头像 */}
                  <div
                    className={clsx(
                      "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-medium",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
                        : "bg-gradient-to-br from-slate-500 to-slate-700 text-white"
                    )}
                  >
                    {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  {/* 消息气泡 */}
                  <div
                    className={clsx(
                      "px-5 py-3.5 rounded-2xl max-w-[80%] shadow-soft",
                      msg.role === "assistant"
                        ? (mode === "action" ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-white text-slate-800 border border-slate-200/70")
                        : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                    )}
                  >
                    {msg.files && msg.files.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap gap-2">
                        {msg.files.map((file) => (
                          <div
                            key={file.id}
                            className={clsx(
                              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs",
                              msg.role === "assistant"
                                ? (mode === "action" ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-slate-100 text-slate-700 border border-slate-200")
                                : "bg-white/20 text-white border border-white/20"
                            )}
                          >
                            <Paperclip size={12} />
                            <span className="truncate max-w-[120px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {msg.content}
                    </pre>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 - 底部 */}
          <div className="p-4 md:p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <InputBox
                mode={mode}
                setMode={setMode}
                planEnabled={planEnabled}
                setPlanEnabled={setPlanEnabled}
                input={input}
                setInput={setInput}
                files={files}
                setFiles={setFiles}
                onSend={handleSend}
                fileInputRef={fileInputRef}
                removeFile={removeFile}
                formatFileSize={formatFileSize}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 初始状态 - 输入框居中 */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative z-10">
            <div className="w-full max-w-4xl">
              {/* 标题区域 */}
              <div className="text-center mb-10 animate-fade-in-up">
                <div className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-soft mb-6",
                  mode === "action"
                    ? "bg-slate-800/70 border-slate-700"
                    : "bg-white/70 border border-slate-200/70"
                )}>
                  <Sparkles size={14} className={mode === "action" ? "text-emerald-400" : "text-indigo-500"} />
                  <span className={clsx(
                    "text-xs font-medium",
                    mode === "action" ? "text-slate-300" : "text-slate-600"
                  )}>
                    Agentic Beta
                  </span>
                </div>
                <h1 className={clsx(
                  "text-3xl md:text-4xl font-semibold mb-3 tracking-tight",
                  mode === "action" ? "text-slate-100" : "text-slate-800"
                )}>
                  今天有什么可以帮助你？
                </h1>
                <p className={clsx(
                  "max-w-lg mx-auto",
                  mode === "action" ? "text-slate-400" : "text-slate-500"
                )}>
                  用自然语言管理你的 AI 开发任务，从资源申请到模型训练，一键搞定
                </p>
              </div>
              {/* 输入框 */}
              <div className="animate-fade-in-up delay-200">
                <InputBox
                  mode={mode}
                  setMode={setMode}
                  planEnabled={planEnabled}
                  setPlanEnabled={setPlanEnabled}
                  input={input}
                  setInput={setInput}
                  files={files}
                  setFiles={setFiles}
                  onSend={handleSend}
                  fileInputRef={fileInputRef}
                  removeFile={removeFile}
                  formatFileSize={formatFileSize}
                />
              </div>
              {/* 快捷提示 */}
              <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up delay-300">
                <QuickPrompt
                  text="帮我申请 4 张 A100"
                  onClick={() => setInput("帮我申请 4 张 A100")}
                  mode={mode}
                />
                <QuickPrompt
                  text="启动一个 Notebook"
                  onClick={() => setInput("启动一个 Notebook")}
                  mode={mode}
                />
                <QuickPrompt
                  text="查看训练任务状态"
                  onClick={() => setInput("查看训练任务状态")}
                  mode={mode}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface QuickPromptProps {
  text: string;
  onClick: () => void;
  mode: Mode;
}

function QuickPrompt({ text, onClick, mode }: QuickPromptProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 text-sm rounded-xl shadow-soft hover-lift transition-all duration-200",
        mode === "action"
          ? "text-slate-300 bg-slate-800/70 hover:bg-slate-800 border border-slate-700"
          : "text-slate-600 bg-white/70 hover:bg-white border border-slate-200/70"
      )}
    >
      {text}
    </button>
  );
}

interface InputBoxProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  planEnabled: boolean;
  setPlanEnabled: (enabled: boolean) => void;
  input: string;
  setInput: (val: string) => void;
  files: FileItem[];
  setFiles: (files: FileItem[]) => void;
  onSend: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  removeFile: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}

function InputBox({
  mode,
  setMode,
  planEnabled,
  setPlanEnabled,
  input,
  setInput,
  files,
  setFiles,
  onSend,
  fileInputRef,
  removeFile,
  formatFileSize,
}: InputBoxProps) {
  return (
    <form onSubmit={onSend} className="relative">
      <div className={clsx(
        "relative rounded-3xl shadow-medium border overflow-hidden transition-all duration-300",
        mode === "action"
          ? "bg-slate-800 border-slate-700 hover:shadow-xl hover:shadow-emerald-500/10"
          : "bg-white border-slate-200/70 hover:shadow-lg"
      )}>
        {/* 已选文件列表 */}
        {files.length > 0 && (
          <div className={clsx(
            "px-4 pt-4 flex flex-wrap gap-2 border-b",
            mode === "action" ? "border-slate-700" : "border-slate-100"
          )}>
            {files.map((file) => (
              <div
                key={file.id}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs animate-fade-in",
                  mode === "action"
                    ? "bg-slate-700 text-slate-300 border border-slate-600"
                    : "bg-slate-50 text-slate-700 border border-slate-200"
                )}
              >
                <Paperclip size={12} className={mode === "action" ? "text-slate-400" : "text-slate-400"} />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className={mode === "action" ? "text-slate-500" : "text-slate-400"}>({formatFileSize(file.size)})</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className={clsx(
                    "hover:bg-slate-200 rounded-full p-0.5 transition-colors",
                    mode === "action"
                      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-600"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 文本输入 */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "action" ? "告诉我你想执行什么任务..." : "问我任何问题..."}
          className={clsx(
            "w-full px-5 pt-4 pb-16 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-base placeholder:text-slate-400",
            mode === "action" ? "text-slate-200" : "text-slate-800"
          )}
          rows={1}
          style={{ minHeight: "90px", maxHeight: "280px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
        />

        {/* 底部工具栏 */}
        <div className={clsx(
          "absolute bottom-0 left-0 right-0 px-4 py-4 flex items-center justify-between transition-colors duration-300",
          mode === "action" ? "bg-slate-800" : "bg-white"
        )}>
          {/* 左侧：文件上传 + 模式切换 */}
          <div className="flex items-center gap-2">
            {/* 文件上传 */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || []);
                const newFiles = selectedFiles.map((file) => ({
                  id: Math.random().toString(36).substring(2, 11),
                  name: file.name,
                  size: file.size,
                  type: file.type,
                }));
                setFiles([...files, ...newFiles]);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "p-2 rounded-xl transition-all duration-200",
                mode === "action"
                  ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              <Paperclip size={20} />
            </button>

            {/* 模式切换 - 加强视觉效果 */}
            <div className={clsx(
              "flex items-center gap-1 p-1 rounded-xl transition-all duration-300",
              mode === "action" ? "bg-slate-700" : "bg-slate-100"
            )}>
              <button
                type="button"
                onClick={() => setMode("qa")}
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300",
                  mode === "qa"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                    : mode === "action"
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Sparkles size={15} />
                问答
              </button>
              <button
                type="button"
                onClick={() => setMode("action")}
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300",
                  mode === "action"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Zap size={15} />
                行动
              </button>
            </div>
          </div>

          {/* 右侧：Plan 开关 + 发送按钮 */}
          <div className="flex items-center gap-3">
            {/* Plan 开关 - 仅在行动模式显示 */}
            {mode === "action" && (
              <button
                type="button"
                onClick={() => setPlanEnabled(!planEnabled)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300",
                  planEnabled
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                )}
              >
                <Lightbulb
                  size={14}
                  className={clsx(
                    "transition-all duration-300",
                    planEnabled && "fill-white animate-pulse"
                  )}
                />
                Plan
              </button>
            )}

            {/* 发送按钮 */}
            <button
              type="submit"
              disabled={!input.trim() && files.length === 0}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-300",
                input.trim() || files.length > 0
                  ? mode === "action"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* 动态代码滚动背景组件 */
function CodeBackground() {
  const codeLines = [
    "from jiushu import Agent, Task",
    "import asyncio",
    "",
    "async def main():",
    "    # 初始化智能 Agent",
    "    agent = Agent(model=\"gpt-4\")",
    "    ",
    "    # 创建任务",
    "    task = Task(",
    "        name=\"train_model\",",
    "        resources={\"gpu\": 4, \"memory\": \"64Gi\"}",
    "    )",
    "    ",
    "    # 执行任务",
    "    result = await agent.execute(task)",
    "    print(f\"Task status: {result.status}\")",
    "",
    "if __name__ == \"__main__\":",
    "    asyncio.run(main())",
    "",
    "// 监控任务状态",
    "function monitorTasks() {",
    "  const tasks = getAllRunningTasks();",
    "  tasks.forEach(task => {",
    "    console.log(`[${task.id}] ${task.name}: ${task.progress}%`);",
    "  });",
    "}",
    "",
    "-- 资源分配 SQL",
    "SELECT * FROM resources",
    "WHERE type = 'GPU'",
    "  AND status = 'available'",
    "ORDER BY memory DESC;",
    "",
    "# 配置文件",
    "apiVersion: v1",
    "kind: Config",
    "metadata:",
    "  name: agent-config",
    "spec:",
    "  logLevel: info",
    "  timeout: 3600s",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 左侧代码列 */}
      <div className="absolute left-0 top-0 bottom-0 w-[45%] opacity-10">
        <div className="animate-code-scroll">
          {[...codeLines, ...codeLines].map((line, i) => (
            <div
              key={i}
              className="text-xs font-mono px-4 py-0.5 text-emerald-400"
            >
              <span className="text-slate-600 mr-3 select-none">
                {(i % codeLines.length) + 1}
              </span>
              {formatCode(line)}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧代码列 */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-10">
        <div className="animate-code-scroll-reverse">
          {[...codeLines.slice().reverse(), ...codeLines].map((line, i) => (
            <div
              key={i}
              className="text-xs font-mono px-4 py-0.5 text-cyan-400"
            >
              <span className="text-slate-600 mr-3 select-none">
                {(i % codeLines.length) + 1}
              </span>
              {formatCode(line)}
            </div>
          ))}
        </div>
      </div>

      {/* 网格效果 */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900" />
    </div>
  );
}

function formatCode(line: string) {
  // 简单的语法高亮
  let formatted = line
    .replace(/(from|import|async|def|await|if|__name__|__main__|run|function|const|let|var|forEach|console|log|SELECT|FROM|WHERE|AND|ORDER BY|DESC|apiVersion|kind|metadata|name|spec|logLevel|timeout)/g,
      '<span class="text-purple-400">$1</span>')
    .replace(/(Agent|Task|model|resources|gpu|memory|status|result)/g,
      '<span class="text-amber-400">$1</span>')
    .replace(/#.*|\/\/.*|--.*/g,
      '<span class="text-slate-500">$&</span>')
    .replace(/".*?"|'.*?'/g,
      '<span class="text-green-400">$&</span>')
    .replace(/\b(\d+)\b/g,
      '<span class="text-cyan-400">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}
