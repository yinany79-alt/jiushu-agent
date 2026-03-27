# 九数算法中台：Agentic Workflow 架构与交互详细设计 (V3.0 - Demo 版)

## 1. 核心愿景 (Core Vision)
九数算法中台将从“功能导航模式”彻底转向**“工作流编排模式”**。通过 Master-Agent 实时解析意图，动态生成任务画布，并将所有复杂的资源配置收口于“抽屉式”对话交互中，实现“低摩擦、高自动化”的算法研发体验。

---

## 2. 页面布局与空间定义 (UI/UX Layout)

| 区域名称 | 位置 | 功能职责 |
| :--- | :--- | :--- |
| **Global Chatbox** | 页面中心/底部固定 | 交互起点。支持“问答模式（RAG）”与“行动模式（Agentic）”切换。 |
| **Thinking Drawer** | 侧边/底部弹出式抽屉 | **核心交互区**。展示 Agent 思考轨迹、下发交互卡片（选择器、确认单）。 |
| **Workflow Canvas** | 页面主背景 (主体) | **可视化中心**。展示任务拓扑 DAG 图，节点随 Agent 规划动态生成。 |

---

## 3. Master-Agent 执行链路与交互协议

### 3.1 交互时序 (Execution Flow)
1. **意图解析：** 用户输入需求 -> Drawer 弹出显示 Agent 思考过程。
2. **动态布点：** Agent 规划步骤 -> Canvas 同步出现任务节点（Node）。
3. **低摩擦确认：** Agent 发现参数缺失 -> Drawer 弹出 **Selection Card**（预设好选项，用户只需点选，无需复制粘贴 ID）。
4. **状态同步：** 点击“执行” -> 画布节点颜色流转（Pending -> Running -> Success）。

### 3.2 节点数据结构 (Canvas Node Schema)
```json
{
  "node_id": "T_001",
  "type": "algorithm_job",
  "label": "Llama-3 微调",
  "status": "running", // ["pending", "running", "success", "error"]
  "agent_type": "Train-Worker"
}
```
## 4. 演示 Mock 场景库 (Demo Scenarios)
为确保周三演示丝滑，我们预置以下两个“黄金场景”脚本，通过关键词触发：

### 场景 A：全自动模型微调 (Model Fine-tuning)
* **触发词：** 输入“帮我微调 Llama3” 或 “启动 Llama 训练”。
* **画布生成 (Canvas Nodes)：** `[数据校验]` -> `[算力申请]` -> `[训练任务]` -> `[指标挂载]`。
* **交互卡片 (Drawer Cards)：** 1.  弹出“空间确认”卡片（默认选中当前活跃 Project）。
    2.  弹出“资源规格”选择卡（推荐 4*A100 或 8*A100）。
* **动态效果：** 用户点击确认后，画布节点依次从灰色变为蓝色（Loading），最后变绿（Success）。侧边栏同步开启一个 Mock 的 Loss 曲线看板。

### 场景 B：特征处理流 (Feature Engineering)
* **触发词：** 输入“从 BDP 提取特征并写入特征中心”。
* **画布生成 (Canvas Nodes)：** `[BDP 数据拉取]` -> `[特征算子执行]` -> `[特征中心入库]`。
* **交互卡片 (Drawer Cards)：** 1.  弹出“数据表选择”列表（预设好最近使用的 3 张业务表）。
    2.  弹出“存储路径确认”卡片。
* **动态效果：** 点击执行后，模拟数据在画布连线上流动的动画效果。

* **交互式卡片协议 ：** 
```json
{
  "card_type": "SINGLE_SELECT",
  "title": "请确认计算资源",
  "options": [
    {"label": "高性价比 (A100-40G)", "value": "a100_small", "is_recommend": true},
    {"label": "高性能 (A100-80G)", "value": "a100_large"}
  ],
  "action": "SUBMIT_CONFIG"
}
```
## 5. Claude Code 实现任务清单 (Roadmap)

### 第一阶段：UI 基础框架 (The Skeleton)
- [ ] **ReactFlow 画布初始化：** 实现一个基础的画布背景，支持通过接收 JSON 数组动态渲染节点和连线。
- [ ] **ThinkingDrawer 组件：** 实现侧边/底部抽屉，支持 `Markdown` 流式打字效果，并预留 `Card Slot` 用于插入交互组件。

### 第二阶段：Mock 驱动引擎 (Scenario Engine)
- [ ] **编写 ScenarioDispatcher：** 实现一个逻辑层，根据 Chatbox 输入的关键词（如“微调”、“特征”）匹配并下发对应的预设 JSON 任务流协议。
- [ ] **实现时序触发：** 模拟真实 Agent 思考过程，设置 `setTimeout` 延迟弹出卡片，卡片点击后通过事件回调（Event Callback）点亮画布节点。

### 第三阶段：联动与视觉打磨 (Polishing)
- [ ] **去粘贴化验证：** 检查所有交互链路，确保所有参数（ID、路径、规格）都通过卡片点选完成，彻底消除“输入框复制粘贴”行为。
- [ ] **连线动效：** 为 ReactFlow 的 Edge 添加 `animated: true` 属性，并实现自定义流光效果，模拟数据传输感。
- [ ] **节点状态机：** 实现 Node 状态切换的 CSS 过渡动画（如：蓝色脉冲表示 Running）。