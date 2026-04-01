# 九数算法中台：Q&A 到执行模式意图桥接 (V9.0 - Implementation Spec)

## 1. 核心交互流程 (The Bridge Flow)

目标：打破知识问答与任务执行之间的壁垒，实现“所问即所办”。

### 1.1 触发阶段 (Trigger Stage)
- **UI 组件：** 在问答模式（Q&A）的 AI 回复气泡（Message Bubble）底部工具栏，新增一个智能动作按钮。
- **文案选项：** `[ 转化执行 ]` 或 `[ 尝试执行该方案 ]`。
- **视觉：** 按钮需具备微弱的紫色流光特效，暗示其具备“智能转换”的高级能力。

### 1.2 处理阶段 (Processing Stage)
- **输入：** 当前问答 Session 的完整对话历史（Context）。
- **逻辑控制 (Intent-Transformer)：**
    - 调用后台意图识别模型，解析用户在问答中最终达成的共识。
    - 识别核心任务（如：离线弹性推理、Llama3 微调、BDP数据提取）。
    - 提取关键参数（如：资源组名称、卡时要求、模型版本）。
- **输出：** 一句精炼且符合“智能开发”模式识别规范的 Prompt。
    - *示例：* “帮我按照刚才讨论的方案，在 X 资源组提交一个 Llama-3 弹性推理任务。”

### 2.2 转换提示词 (Transformer Prompt)
```text
[System Context]
你是一个算法任务转译专家。
[Task]
请分析以下对话中的技术路径，将其转化为一句话的执行指令。
[Constraints]
1. 必须以“帮我...”开头。
2. 必须包含核心参数：任务类型（推理/微调）、资源要求、模型名称。
3. 剔除解释性文字，只保留动作指令。
```
### 1.3 跳转阶段 (Transition Stage)
- **动画触发 (Mode-Switch Animation)：**
    - Loading 态： 转换过程中，执行模式的输入框显示 “AI 正在提炼执行意图...” 的波浪动效。
    - 触发全屏模式切换动画：Q&A 界面整体向左淡出，智能开发（Canvas）背景从右侧滑入或中心扩散。
- **状态同步：**
    - 自动切换左侧侧边栏（Sidebar）的激活状态至 **“智能开发”**。
    - 将生成的执行 Prompt 自动填入执行模式底部的 Chatbox 中。
- **自动对焦：** 切换完成后，Chatbox 自动聚焦，并展示打字机效果，引导用户点击“发送”以开启工作流规划。

---

## 2. Claude Code 实现任务清单 (Developer Roadmap)

### 第一阶段：意图转换逻辑实现
- [ ] Context Aggregator: 编写逻辑提取当前对话 Session 的完整历史。
- [ ] Summary Agent: 实现调用 LLM 进行意图压缩的接口。

### 第二阶段：跨模式状态共享
- [ ] Shared State Store: 建立一个 PromptBridge 状态管理，用于在 Q&A 组件卸载和执行组件加载之间传递 Prompt 数据。
- [ ] Auto-Fill Logic: 执行模式加载后，自动检测 URL Params 或 Global State 中的待执行 Prompt 并触发输入动画。

### 第三阶段：丝滑切换动画
- [ ] Framer Motion 集成: 实现页面级别的切换动画（建议使用 AnimatePresence 处理模式切换）。
- [ ] Button UI: 在 Q&A 气泡底部设计一个带有微光效果的“一键执行”按钮。

