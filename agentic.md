# 九数算法中台 Agentic 转型架构设计 (Technical Design)

## 1. 概述 (Project Overview)
本方案旨在将“九数算法中台”从传统的“点选式 GUI”升级为“意图驱动的 Agent 模式”。通过引入一个核心智能中枢（Agent Orchestrator），实现自然语言交互、任务自动拆解、资源自动配比以及实验指标的全链路闭环。

## 2. 核心架构 (Core Architecture)

### 2.1 架构分层
* **交互层 (NLI - Natural Language Interface):** 单一 Chatbox 入口，支持流式输出 (Streaming) 与结构化卡片渲染。
* **Agent 中枢层 (Orchestration Layer):** 负责意图识别 (Intent Recognition)、规划 (Planning) 与工具调用 (Tool Calling)。
* **能力抽象层 (Action/Tool Layer):** 将现有的 K8s 调度、训练引擎 (9N-LLM/Galileo)、推理引擎 (Triton)、AIFlow 等封装为标准化 Tools。
* **基础设施层 (Infra Layer):** 现有的 K8s 集群、存储系统及 Metric Center。

### 2.2 核心组件定义
| 组件名称 | 职责描述 | 备注 |
| :--- | :--- | :--- |
| **JiuShu-Brain** | 基于 LLM 的中枢，负责维护 Session 状态与任务上下文。 | 推荐使用 LangGraph 或自定义状态机。 |
| **Tool-Registry** | 注册所有九数原子能力，包含语义化描述供 Agent 检索。 | 遵循 OpenAI Function Calling 规范。 |
| **Context-Manager** | 记录用户的空间配置、历史指标、当前占用的资源配额。 | 确保“断点续聊”能力。 |

---

## 3. 功能模块 Tool-fication 详情

### 3.1 资源与空间管理 (ResourceTool)
* **功能：** 查询/申请 K8s 命名空间、配置 GPU/CPU 规格。
* **Agent 逻辑：** 用户输入“我要 4 张 A100”，Agent 自动匹配最优节点池并生成 YAML 提交至 K8s。
* **交互：** 在对话框弹出“确认配置”卡片，用户点击后执行。

### 3.2 训练与开发 (DevelopTool & TrainTool)
* **功能：** 启动 Notebook、发起分布式微调任务（9N-LLM/CTR）。
* **Agent 逻辑：** 识别用户指定的模型和数据集 -> 自动选择镜像 -> 挂载存储 -> 启动任务。
* **反馈：** 实时推送训练日志摘要到 Chatbox。

### 3.3 编排调度 (AIFlowTool)
* **功能：** 触发 BDP-Buffalo 流式任务，监控 Workflow 状态。
* **Agent 逻辑：** 将复杂长链路任务转化为 AIFlow 工作流脚本并执行。

### 3.4 实验观测 (MetricTool)
* **功能：** 连接 Metric Center，拉取实时准确率、Loss、耗时等指标。
* **Agent 逻辑：** “Yveson，当前模型 Loss 已收敛，精度达到 92%，是否现在一键部署？”

---

## 4. 交互逻辑与状态机 (State Flow)

1.  **Intent Parsing:** LLM 解析用户 Prompt。
2.  **Entity Extraction:** 提取关键参数（如：模型名称、资源数量、数据集路径）。
3.  **Plan Generation:** 生成执行步骤列表（如：1. 申请资源 -> 2. 拉取数据 -> 3. 开启训练）。
4.  **Human-in-the-loop:** 涉及到高配资源或敏感操作，通过对话卡片请求用户确认。
5.  **Execution & Monitoring:** 调用后端 API，并持续向用户同步异步任务进度。

---

## 5. Claude Code 开发任务清单 (Implementation Roadmap)

### Phase 1: API Gateway & Mocking
- [ ] 封装现有九数功能的 REST API 接口。
- [ ] 定义 `tools.json` 描述文件，包含每个功能的 `description` 和 `parameters`。

### Phase 2: Agent Core Logic
- [ ] 实现基础对话循环 (ReAct 模式)。
- [ ] 开发 `WorkspaceContext` 类，用于持久化存储当前 Session 的环境变量。

### Phase 3: Specialized UI Components
- [ ] 开发 Markdown 渲染器，支持嵌入“资源配置修改表单”。
- [ ] 实现任务执行进度的可视化 DAG 进度条。

### Phase 4: Feedback Loop Integration
- [ ] 对接 Metric Center API，实现基于指标阈值的自动提醒逻辑。