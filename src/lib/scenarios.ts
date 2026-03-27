export type NodeStatus = "pending" | "running" | "success" | "error";

export interface CanvasNode {
  node_id: string;
  type: string;
  label: string;
  status: NodeStatus;
  agent_type: string;
  position?: { x: number; y: number };
  visible?: boolean; // 控制节点是否显示
}

export interface SelectionOption {
  label: string;
  value: string;
  is_recommend?: boolean;
}

export type CardType = "SINGLE_SELECT" | "CONFIRM";

export interface InteractionCard {
  card_type: CardType;
  title: string;
  description?: string;
  options?: SelectionOption[];
  action: string;
}

export interface ScenarioStep {
  type: "thinking" | "card" | "node_update" | "add_nodes";
  delay?: number;
  content?: string;
  card?: InteractionCard;
  node_updates?: Array<{ node_id: string; status: NodeStatus }>;
  nodes_to_add?: CanvasNode[]; // 新增的节点
}

export interface Scenario {
  id: string;
  name: string;
  triggerKeywords: string[];
  initialNodes: CanvasNode[];
  steps: ScenarioStep[];
  showLossChart?: boolean;
}

// 场景 A: 完整的 Llama3 微调流程
export const SCENARIO_FINETUNE: Scenario = {
  id: "finetune_llama3",
  name: "Llama3 模型微调",
  triggerKeywords: ["微调", "train", "训练", "llama"],
  initialNodes: [
    { node_id: "T_001", type: "intent", label: "需求理解", status: "pending", agent_type: "Brain-Agent", position: { x: 50, y: 100 }, visible: true },
  ],
  showLossChart: true,
  steps: [
    // Step 1: 理解需求
    {
      type: "thinking",
      delay: 500,
      content: "收到！让我来帮你微调 Llama3 模型。先让我分析一下你的需求...",
    },
    {
      type: "node_update",
      delay: 800,
      node_updates: [{ node_id: "T_001", status: "running" }],
    },
    {
      type: "thinking",
      delay: 1500,
      content: "好的！我理解你要做一个 **Llama3 全参数微调** 任务。我会按以下步骤进行：\n\n1. **配置数据源** - 选择训练数据集\n2. **选择基座模型** - 确定模型规格\n3. **配置超参数** - 学习率、batch size 等\n4. **申请计算资源** - GPU 配置\n5. **数据预处理**\n6. **启动训练任务**\n7. **监控与评估**\n\n让我们一步一步来！",
    },
    {
      type: "node_update",
      delay: 500,
      node_updates: [{ node_id: "T_001", status: "success" }],
    },
    // Step 2: 添加数据源配置节点
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_002", type: "data_source", label: "数据源配置", status: "pending", agent_type: "Data-Worker", position: { x: 250, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_002", status: "running" }],
    },
    {
      type: "thinking",
      delay: 500,
      content: "首先，让我们配置训练数据源。你想用哪个数据集？",
    },
    {
      type: "card",
      delay: 1000,
      card: {
        card_type: "SINGLE_SELECT",
        title: "选择训练数据集",
        description: "从最近使用的数据集中选择",
        options: [
          { label: "Alpaca-Chinese (52K 中文指令)", value: "alpaca_zh", is_recommend: true },
          { label: "ShareGPT (90K 多轮对话)", value: "sharegpt" },
          { label: "GSM8K (数学推理)", value: "gsm8k" },
          { label: "自定义数据集", value: "custom" },
        ],
        action: "SELECT_DATASET",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "T_002", status: "success" }],
    },
    {
      type: "thinking",
      delay: 400,
      content: "好的！已选择 **Alpaca-Chinese** 数据集。这是一个高质量的中文指令微调数据集，包含 52,000 条样本。",
    },
    // Step 3: 选择模型
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_003", type: "model_select", label: "模型选择", status: "pending", agent_type: "Model-Worker", position: { x: 450, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_003", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "接下来，选择基座模型版本。你想用多大的 Llama3 模型？",
    },
    {
      type: "card",
      delay: 1200,
      card: {
        card_type: "SINGLE_SELECT",
        title: "选择基座模型",
        description: "根据你的任务规模和算力选择",
        options: [
          { label: "Llama3-8B (推荐，平衡性能)", value: "llama3_8b", is_recommend: true },
          { label: "Llama3-70B (大规模，高性能)", value: "llama3_70b" },
        ],
        action: "SELECT_MODEL",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "T_003", status: "success" }],
    },
    {
      type: "thinking",
      delay: 400,
      content: "太棒了！**Llama3-8B** 是个很好的选择，性能和效率兼顾！",
    },
    // Step 4: 配置超参数
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_004", type: "hyperparams", label: "超参数配置", status: "pending", agent_type: "Config-Worker", position: { x: 650, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_004", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "现在配置训练超参数。我根据 Llama3-8B 给你推荐了最优设置。",
    },
    {
      type: "card",
      delay: 1200,
      card: {
        card_type: "SINGLE_SELECT",
        title: "配置训练超参数",
        description: "选择学习率和 batch size",
        options: [
          { label: "推荐配置 (lr=2e-5, bs=32, epochs=3)", value: "hp_recommended", is_recommend: true },
          { label: "快速实验 (lr=5e-5, bs=16, epochs=1)", value: "hp_fast" },
          { label: "精细调优 (lr=1e-5, bs=64, epochs=5)", value: "hp_fine" },
        ],
        action: "SELECT_HYPERPARAMS",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "T_004", status: "success" }],
    },
    {
      type: "thinking",
      delay: 400,
      content: "完美！超参数已配置：**学习率 2e-5，Batch Size 32，训练 3 轮**。",
    },
    // Step 5: 申请计算资源
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_005", type: "resource", label: "算力申请", status: "pending", agent_type: "Resource-Worker", position: { x: 850, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_005", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "现在申请计算资源。根据你的模型和 batch size，我推荐以下配置。",
    },
    {
      type: "card",
      delay: 1200,
      card: {
        card_type: "SINGLE_SELECT",
        title: "选择计算资源",
        description: "根据你的配置选择 GPU 规格",
        options: [
          { label: "高性价比 (4 × A100-40G)", value: "a100_4x40g", is_recommend: true },
          { label: "高性能 (8 × A100-80G)", value: "a100_8x80g" },
          { label: "极致性能 (16 × H100)", value: "h100_16x" },
        ],
        action: "SELECT_RESOURCE",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "T_005", status: "success" }],
    },
    {
      type: "thinking",
      delay: 400,
      content: "资源申请成功！**4 × A100-40G** 已分配，预计训练时间 4-5 小时。",
    },
    // Step 6: 数据预处理
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_006", type: "preprocess", label: "数据预处理", status: "pending", agent_type: "Data-Worker", position: { x: 1050, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_006", status: "running" }],
    },
    {
      type: "thinking",
      delay: 500,
      content: "开始数据预处理... Tokenizing 数据集，构建 DataLoader。",
    },
    {
      type: "thinking",
      delay: 2000,
      content: "正在处理 52,000 条样本... 已完成 30%...",
    },
    {
      type: "thinking",
      delay: 2000,
      content: "已完成 70%... 构建缓存...",
    },
    {
      type: "node_update",
      delay: 2000,
      node_updates: [{ node_id: "T_006", status: "success" }],
    },
    {
      type: "thinking",
      delay: 300,
      content: "数据预处理完成！所有样本已 tokenized 并缓存。",
    },
    // Step 7: 训练任务
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_007", type: "training", label: "训练任务", status: "pending", agent_type: "Train-Worker", position: { x: 1250, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_007", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "训练任务启动！开始第 1 轮训练...",
    },
    {
      type: "thinking",
      delay: 2500,
      content: "Epoch 1/3 完成！Loss: 2.1 → 1.5。继续第 2 轮...",
    },
    {
      type: "thinking",
      delay: 2500,
      content: "Epoch 2/3 完成！Loss: 1.5 → 1.1。最后一轮...",
    },
    {
      type: "thinking",
      delay: 2500,
      content: "Epoch 3/3 完成！Loss: 1.1 → 0.9。训练顺利完成！",
    },
    {
      type: "node_update",
      delay: 500,
      node_updates: [{ node_id: "T_007", status: "success" }],
    },
    // Step 8: 模型评估
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_008", type: "evaluation", label: "模型评估", status: "pending", agent_type: "Eval-Worker", position: { x: 1450, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_008", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "开始模型评估... 运行测试集，计算指标。",
    },
    {
      type: "thinking",
      delay: 2500,
      content: "评估完成！结果：\n- **准确率**: 89.3%\n- **BLEU**: 42.1\n- **ROUGE-L**: 58.7\n\n模型效果非常好！",
    },
    {
      type: "node_update",
      delay: 500,
      node_updates: [{ node_id: "T_008", status: "success" }],
    },
    // Step 9: 模型保存
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "T_009", type: "save", label: "模型保存", status: "pending", agent_type: "Store-Worker", position: { x: 1650, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "T_009", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "正在保存模型权重和配置文件...",
    },
    {
      type: "node_update",
      delay: 2000,
      node_updates: [{ node_id: "T_009", status: "success" }],
    },
    {
      type: "thinking",
      delay: 400,
      content: "🎉 **任务全部完成！**\n\n模型已保存至：`/models/llama3-8b-finetuned-v1/`\n\n你可以：\n1. 查看 Loss 曲线（右侧面板）\n2. 启动推理服务\n3. 继续下一轮微调",
    },
  ],
};

// 场景 B: 特征处理
export const SCENARIO_FEATURE: Scenario = {
  id: "feature_engineering",
  name: "特征处理流",
  triggerKeywords: ["特征", "feature", "bdp", "写入"],
  initialNodes: [
    { node_id: "F_001", type: "intent", label: "需求理解", status: "pending", agent_type: "Brain-Agent", position: { x: 50, y: 100 }, visible: true },
  ],
  steps: [
    {
      type: "thinking",
      delay: 500,
      content: "收到！让我帮你从 BDP 提取特征并写入特征中心。",
    },
    {
      type: "node_update",
      delay: 800,
      node_updates: [{ node_id: "F_001", status: "running" }],
    },
    {
      type: "thinking",
      delay: 1500,
      content: "理解！这是一个特征工程任务。我们来一步步完成：\n\n1. **选择源数据表**\n2. **配置特征算子**\n3. **执行特征计算**\n4. **写入特征中心**\n\n开始吧！",
    },
    {
      type: "node_update",
      delay: 500,
      node_updates: [{ node_id: "F_001", status: "success" }],
    },
    // 选择数据表
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "F_002", type: "bdp_pull", label: "选择数据表", status: "pending", agent_type: "Data-Worker", position: { x: 250, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "F_002", status: "running" }],
    },
    {
      type: "card",
      delay: 1000,
      card: {
        card_type: "SINGLE_SELECT",
        title: "请选择数据源表",
        description: "最近使用的业务表",
        options: [
          { label: "user_behavior_daily (用户行为表)", value: "user_behavior", is_recommend: true },
          { label: "order_events (订单事件表)", value: "order_events" },
          { label: "item_profile (商品画像表)", value: "item_profile" },
        ],
        action: "SUBMIT_TABLE",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "F_002", status: "success" }],
    },
    // 配置特征算子
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "F_003", type: "feature_config", label: "配置特征算子", status: "pending", agent_type: "Feature-Worker", position: { x: 450, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "F_003", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "好的，数据表已选。现在配置要计算的特征。",
    },
    {
      type: "card",
      delay: 1200,
      card: {
        card_type: "SINGLE_SELECT",
        title: "选择特征模板",
        description: "预定义的特征计算方案",
        options: [
          { label: "用户行为特征包 (32维)", value: "behavior_32", is_recommend: true },
          { label: "统计特征包 (64维)", value: "stats_64" },
          { label: "时序特征包 (128维)", value: "ts_128" },
        ],
        action: "SELECT_FEATURES",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "F_003", status: "success" }],
    },
    // 执行特征计算
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "F_004", type: "feature_op", label: "执行特征计算", status: "pending", agent_type: "Feature-Worker", position: { x: 650, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "F_004", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "开始执行特征计算... 点击率、转化率、活跃度...",
    },
    {
      type: "thinking",
      delay: 2500,
      content: "已完成 50%... 计算滑动窗口统计...",
    },
    {
      type: "node_update",
      delay: 2500,
      node_updates: [{ node_id: "F_004", status: "success" }],
    },
    // 写入特征中心
    {
      type: "add_nodes",
      delay: 300,
      nodes_to_add: [
        { node_id: "F_005", type: "feature_store", label: "写入特征中心", status: "pending", agent_type: "Store-Worker", position: { x: 850, y: 100 }, visible: true },
      ],
    },
    {
      type: "node_update",
      delay: 200,
      node_updates: [{ node_id: "F_005", status: "running" }],
    },
    {
      type: "thinking",
      delay: 600,
      content: "正在写入特征中心...",
    },
    {
      type: "card",
      delay: 1200,
      card: {
        card_type: "SINGLE_SELECT",
        title: "请确认存储路径",
        description: "特征写入位置",
        options: [
          { label: "/feature_store/v2/user_features/", value: "path_v2", is_recommend: true },
          { label: "/feature_store/legacy/user_features/", value: "path_legacy" },
        ],
        action: "SUBMIT_PATH",
      },
    },
    {
      type: "node_update",
      delay: 0,
      node_updates: [{ node_id: "F_005", status: "success" }],
    },
    {
      type: "thinking",
      delay: 500,
      content: "✅ **特征处理完成！**\n\n共生成 **32 维** 特征，已成功写入特征中心！\n- 覆盖用户数: 1,250,000\n- 特征版本: v2.3.0\n- 有效期: 7 天",
    },
  ],
};

export const ALL_SCENARIOS: Scenario[] = [SCENARIO_FINETUNE, SCENARIO_FEATURE];

export function matchScenario(input: string): Scenario | null {
  const lowerInput = input.toLowerCase();
  for (const scenario of ALL_SCENARIOS) {
    for (const keyword of scenario.triggerKeywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        return scenario;
      }
    }
  }
  return null;
}
