# 九数算法中台：智能化监控中心 (Observability Agent) 深度设计规格书

## 1. 设计哲学：从“被动查看”到“主动洞察” (Vision)
九数监控中心的设计核心在于：**Agent 不仅在看，Agent 在思考。** 传统的监控是用户在数据海洋里捞问题，我们的监控是 Agent 实时过滤异常，并以人类可读的“自然语言摘要”直接交付结论。它分为“宏观体感 (Overview)”与“微观血缘 (Tracking)”两大维度。

---

## 2. 交互布局规范 (Layout Specification)

### 2.1 全局导航
- **Tab A: 监控总览 (Global Observability)** —— 解决“集群与任务群的当前健康状态如何？”
- **Tab B: 模型追踪 (Model Lineage & Tracking)** —— 解决“这个模型是怎么来的？性能如何演进？上下游依赖是谁？”

---

## 3. Tab 1：监控总览 (Monitoring Overview) - 深度细节

### 3.1 顶部区域：AI 智能治理看板 (AI Insight Dashboard)
**核心组件：AI Insight Summary Card**
* **视觉设计：** 位于页面最上方，采用微渐变（#F0F7FF 到 #FFFFFF）背景，带有点阵动效，模拟 AI 正在扫描。
* **功能描述：** Agent 实时聚合下方所有图表（Status, Health, Resource）的数据，通过 LLM 生成 3-5 句的核心结论。
* **内容动态生成逻辑 (Mock 逻辑)：**
    * *正常状态：* “当前集群运行稳健，98% 的任务处于预期 SLA 内。今日 GPU 算力利用率峰值出现在 10:00，目前水位安全。”
    * *异常状态：* “发现 1 个高危告警！任务 `Llama-v3-Train-07` 出现显存泄露风险，预计 15 分钟后 OOM。线上 `CTR-Ranking-Service` 延迟上升 12ms，建议排查网关负载。”

### 3.2 中部区域：核心健康度三图 (The Vitality Triad)
三张图表需支持实时轮询（Polling）和 Hover 深度交互：

1.  **任务与服务态势图 (Task Status Donut):**
    * **维度：** 训练任务 (Training)、推理服务 (Inference)、离线处理 (Batch)。
    * **状态：** 正常 (Healthy)、异常 (Failed)、告警 (Alerting)、待机 (Idle)。
    * **交互：** 点击对应色块，下方列表自动过滤显示该状态的任务。

2.  **全链路性能波动图 (Performance Flux - Area Chart):**
    * **指标：** 纵轴为 Latency (ms) 和 Throughput (QPS) 双轴，横轴为过去 24 小时时间线。
    * **AI 标记：** 图表上自动标注“发布点”、“异常点”，鼠标悬停显示当时发生的变更事件。

3.  **算力密度热力图 (GPU Intensity Heatmap):**
    * **设计：** 以网格形式代表集群内的 GPU 卡（A100/H800）。颜色深浅代表利用率。
    * **实时数据：** 展示单卡温度、显存占用、SM 利用率。

### 3.3 底部区域：任务列表与“手术刀式”折叠详情 (Deep-Dive List)
**组件：Expandable Action Table**
* **主列表字段：** * `Job ID` (带复制/跳转图标)
    * `Status` (带呼吸灯动效的状态标签)
    * `Resources` (实时显示的 GPU 核心利用率条)
    * `Owner` & `Space` (所属空间)
    * `Duration` (运行耗时)

* **折叠详情区 (Expand Detail - 手风琴展开)：**
    用户点击“详情”后，列表行向下滑动展开一个独立的工作台，包含：
    * **微型指标面板 (Mini-Metric Board):** - 实时 Loss 曲线、Accuracy 曲线。
        - 梯度范数 (Gradient Norm) 监控（用于判断训练是否发散）。
    * **物理资源剖析 (Hardware Insight):**
        - 显存带宽占用比 (Memory Bandwidth)。
        - 算力成本预估 (Cost per Hour)。
    * **实时日志流 (Live Logs):** 仅展示最后 50 行 Error/Warning 日志，支持一键跳转到完整日志页。

---

## 4. Tab 2：模型追踪 (Model Tracking) - 深度细节

### 4.1 全生命周期血缘画布 (Lineage Canvas)
**技术栈建议：ReactFlow / X6**
* **节点定义 (Nodes):**
    - `Data Node`: BDP 数据表元数据（行数、特征列、存储路径）。
    - `Job Node`: 执行任务（Spark 清洗、Galileo 训练）。
    - `Model Node`: 产出的模型版本（V1.0, V1.1）。
    - `Service Node`: 线上部署节点（Triton 实例）。
* **血缘追溯逻辑：** - 向上：点选模型节点，自动高亮显示其训练所用的数据版本和代码 Commit。
    - 向下：查看该模型被部署到了哪些服务节点。

### 4.2 实验指标演进视图 (Comparison & Analysis)
* **核心功能：** 在画布右侧提供一个侧边栏。
* **功能描述：** 当用户在画布上同时选中两个“模型节点”时，侧边栏自动开启 **“对比模式 (Side-by-Side Compare)”**：
    * **超参比对表：** 自动对比 Learning Rate, Batch Size, Optimizer 等差异。
    * **性能雷达图：** 对比准确率、召回率、推理延迟、模型大小。
    * **AI 评价：** Agent 给出结论：“模型 V2.0 相比 V1.0 在长文本指标上提升明显，但由于开启了 FlashAttention-3，显存占用增加了 4GB。”

---

## 5. Agent 自愈与自诊断逻辑 (The Self-Healing Layer)

为了体现“顶级”智能化，Claude Code 需在监控中心实现以下隐形成本逻辑：

1.  **异常诊断提示 (Diagnostic Popover):**
    当列表中的任务状态为 `Failed` 时，鼠标悬停或点击详情，Agent 自动弹出一个分析气泡：
    * “检测到 `CUDA Out of Memory`。分析：当前 Batch Size (32) 过大，建议下调至 16，并开启梯度累加以维持收敛速度。”

2.  **FinOps 治理 (Cost Management):**
    在总览页看板中，增加一个 **“算力浪费检测”** 小部件：
    * “发现 3 个已挂起 (Idle) 但未释放的 GPU 容器，预计每日浪费 1200 元。点击一键释放。”

## 6. 交互协议补充 (Interface Extension)
```json
{
  "context": "MONITORING_DETAIL",
  "ai_insight": {
    "summary": "发现 2 个高危任务，显存过载。",
    "actions": [
      { "id": "RESTART_WITH_NEW_CONFIG", "label": "扩容并重启", "target_id": "job_001" }
    ]
  },
  "lineage_data": {
    "nodes": [ { "id": "data_1", "type": "dataSource", "data": { "label": "BDP_User_Table" } } ],
    "edges": [ { "id": "e1-2", "source": "data_1", "target": "train_1" } ]
  }
}
```
---

## 7. Claude Code 开发任务清单 (Advanced Implementation Tasks)

### 第一阶段：静态 UI 与 Tab 系统
- [ ] 构建主页面框架，支持 `Overview` 和 `Tracking` 的平滑切换。
- [ ] 按照“淡蓝/极简”风格，完成 AI Insight 总结卡片的样式。

### 第二阶段：监控总览逻辑 (Mocking Monitoring)
- [ ] **集成 Recharts：** 实现任务状态饼图、延迟趋势图、GPU 热力图。
- [ ] **列表详情联动：** 实现 Table 的折叠行功能。当展开时，使用 `setInterval` 模拟 Loss 曲线的实时动态更新。
- [ ] **AI 总结引擎：** 编写一段逻辑，根据 Mock 数据的异常比例（如 Failed > 1），动态改变 AI 总结卡的文本和主题颜色（Blue -> Orange）。

### 第三阶段：血缘图谱逻辑 (Tracking Engine)
- [ ] **ReactFlow 画布：** 硬编码一个典型的 Llama-3 训练血缘路径。
- [ ] **节点交互：** 实现点击节点后，右侧滑出抽屉展示对应的 JSON 元数据。
- [ ] **对比功能：** 实现“选中两个模型”后，在侧边栏显示对比表格。

---

## 8. 给 Claude Code 的指令 (Final Instruction)
> "请基于以上规格书实现『监控中心』模块。
> 1. **核心：** 强调 AI 的『观察感』，所有 Summary 内容必须看起来像是 AI 实时分析的结果。
> 2. **深度：** 折叠详情里必须包含专业的算法指标（Loss, Grad Norm）和 Infra 指标（GPU Bandwidth）。
> 3. **视觉：** 保持九数算法中台的 Agentic 风格，利用微动效提升产品的智能化体感。
> 4. **闭环：** 所有的监控项不仅仅是展示，要体现出 Agent 能够给出『优化建议』或『自愈方案』。"