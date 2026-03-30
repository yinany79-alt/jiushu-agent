"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// 代码单元格类型
export interface CodeCell {
  id: string;
  type: "code" | "markdown";
  content: string;
  output?: string;
  status: "idle" | "running" | "success" | "error";
  executionCount?: number;
}

// 画布节点类型（与 workflow-canvas 对应）
export type NodeStatus = "pending" | "running" | "streaming" | "success" | "error";

export interface DevCanvasNode {
  id: string;
  type: string;
  label: string;
  status: NodeStatus;
  agent_type?: string;
  config?: Record<string, any>;
  generatedCode?: string;
}

// 共享状态类型
interface DevModeContextType {
  // 智能开发模块状态
  cells: CodeCell[];
  setCells: (cells: CodeCell[]) => void;
  addCell: (cell: Omit<CodeCell, "id" | "status">) => void;
  updateCell: (id: string, updates: Partial<CodeCell>) => void;
  removeCell: (id: string) => void;

  // 画布 -> 代码 同步
  syncCanvasToCode: (nodes: DevCanvasNode[]) => void;

  // 代码 -> 画布 同步
  syncCodeToCanvas: () => DevCanvasNode[];

  // 当前选中的模块源
  activeSource: "hub" | "dev";
  setActiveSource: (source: "hub" | "dev") => void;

  // 画布执行时的代码注入
  injectCodeFromCanvas: (code: string, nodeId: string) => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [cells, setCells] = useState<CodeCell[]>([
    {
      id: "welcome-1",
      type: "markdown",
      content: "# 智能开发环境 👋\n\n欢迎使用智能开发模块！这里可以与智能中枢的画布工作流无缝协作，还可以让 AI 辅助你编写代码。",
      status: "idle",
    },
    {
      id: "example-1",
      type: "code",
      content: `# 示例1: 基础数据处理
import pandas as pd
import numpy as np

# 创建示例数据
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'David'],
    'age': [25, 30, 35, 40],
    'score': [85.5, 90.0, 78.5, 92.0]
}

df = pd.DataFrame(data)
print("数据加载成功！")
print(df)`,
      status: "idle",
    },
    {
      id: "example-2",
      type: "code",
      content: `# 示例2: 数据可视化
import matplotlib.pyplot as plt

# 简单绘图示例
plt.figure(figsize=(10, 4))

# 柱状图
plt.subplot(1, 2, 1)
plt.bar(df['name'], df['score'], color='#3b82f6')
plt.title('成绩分布')
plt.xlabel('姓名')
plt.ylabel('分数')

# 折线图
plt.subplot(1, 2, 2)
plt.plot(df['name'], df['age'], marker='o', color='#10b981', linewidth=2)
plt.title('年龄趋势')
plt.xlabel('姓名')
plt.ylabel('年龄')

plt.tight_layout()
plt.show()`,
      status: "idle",
    },
    {
      id: "example-3",
      type: "code",
      content: `# 示例3: 机器学习基础
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 准备训练数据
X = df[['age']]
y = (df['score'] > 80).astype(int)  # 分数>80为正样本

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 训练模型
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"模型准确率: {acc:.2%}")`,
      status: "idle",
    },
    {
      id: "example-4",
      type: "markdown",
      content: "## 💡 提示\n\n- 点击单元格左侧的 ▶️ 按钮运行代码\n- 点击 `+ AI 辅助` 按钮让 AI 帮你写代码\n- 在智能中枢的画布工作流点击「同步到代码」可以在这里查看生成的代码",
      status: "idle",
    },
  ]);
  const [activeSource, setActiveSource] = useState<"hub" | "dev">("hub");

  const addCell = useCallback((cell: Omit<CodeCell, "id" | "status">) => {
    const newCell: CodeCell = {
      ...cell,
      id: `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "idle",
    };
    setCells((prev) => [...prev, newCell]);
  }, []);

  const updateCell = useCallback((id: string, updates: Partial<CodeCell>) => {
    setCells((prev) => prev.map((cell) => (cell.id === id ? { ...cell, ...updates } : cell)));
  }, []);

  const removeCell = useCallback((id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
  }, []);

  // 画布 -> 代码：将画布节点转换为代码单元格
  const syncCanvasToCode = useCallback((nodes: DevCanvasNode[]) => {
    const newCells: CodeCell[] = nodes.map((node, index) => ({
      id: `canvas-${node.id}`,
      type: "code",
      content: node.generatedCode || `# ${node.label}\n# 节点类型: ${node.agent_type || node.type}`,
      status: node.status === "success" ? "success" : node.status === "error" ? "error" : "idle",
      executionCount: index + 1,
    }));

    // 添加一个markdown标题
    const headerCell: CodeCell = {
      id: "canvas-header",
      type: "markdown",
      content: "# 从画布同步的工作流\n\n以下代码由智能中枢的画布工作流自动生成：",
      status: "idle",
    };

    setCells([headerCell, ...newCells]);
  }, []);

  // 代码 -> 画布：将代码单元格转换为画布节点（预留接口）
  const syncCodeToCanvas = useCallback((): DevCanvasNode[] => {
    return cells
      .filter((cell) => cell.type === "code")
      .map((cell, index) => ({
        id: `code-${cell.id}`,
        type: "custom",
        label: `代码块 ${index + 1}`,
        status: cell.status === "success" ? "success" : cell.status === "error" ? "error" : "pending",
        generatedCode: cell.content,
      }));
  }, [cells]);

  // 从画布注入代码到智能开发
  const injectCodeFromCanvas = useCallback((code: string, nodeId: string) => {
    const newCell: CodeCell = {
      id: `injected-${nodeId}-${Date.now()}`,
      type: "code",
      content: code,
      status: "idle",
    };
    setCells((prev) => [...prev, newCell]);
  }, []);

  return (
    <DevModeContext.Provider
      value={{
        cells,
        setCells,
        addCell,
        updateCell,
        removeCell,
        syncCanvasToCode,
        syncCodeToCanvas,
        activeSource,
        setActiveSource,
        injectCodeFromCanvas,
      }}
    >
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }
  return context;
}
