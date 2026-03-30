export type NodeStatus = "pending" | "running" | "success" | "error" | "streaming";

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

export interface SliderOption {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ButtonGroupOption {
  label: string;
  value: string;
  icon?: string;
  style?: "primary" | "secondary" | "success";
}

export type CardType =
  | "SINGLE_SELECT"
  | "CONFIRM"
  | "MULTI_SELECT"
  | "DROPDOWN"
  | "SLIDER"
  | "BUTTON_GROUP"
  | "RECOMMENDED";

export interface InteractionCard {
  card_type: CardType;
  title: string;
  description?: string;
  options?: SelectionOption[];
  slider_options?: SliderOption[];
  dropdown_options?: DropdownOption[];
  button_options?: ButtonGroupOption[];
  action: string;
}

export interface ScenarioStep {
  type: "thinking" | "card" | "show_loss_chart";
  delay?: number;
  content?: string;
  card?: InteractionCard;
  node_updates?: Array<{ node_id: string; status: NodeStatus }>;
  nodes_to_add?: CanvasNode[];
  auto_continue?: boolean; // true = 自动继续，false/null = 显示"继续"按钮
}

export interface Scenario {
  id: string;
  name: string;
  triggerKeywords: string[];
  initialNodes: CanvasNode[];
  steps: ScenarioStep[];
}

// 场景 A: 6 阶段 Llama3 微调流程（完整工业级演示版）
export const SCENARIO_FINETUNE: Scenario = {
  id: "finetune_llama3",
  name: "Llama3 模型微调",
  triggerKeywords: ["微调", "train", "训练", "llama"],
  initialNodes: [
    { node_id: "S_001", type: "setup", label: "项目初始化", status: "pending", agent_type: "Init-Agent", position: { x: 50, y: 100 }, visible: true },
    { node_id: "S_002", type: "data", label: "数据策略", status: "pending", agent_type: "Data-Agent", position: { x: 280, y: 100 }, visible: true },
    { node_id: "S_003", type: "resource", label: "GPU 集群", status: "pending", agent_type: "Resource-Agent", position: { x: 510, y: 100 }, visible: true },
    { node_id: "S_004", type: "hyperparams", label: "超参数", status: "pending", agent_type: "Config-Agent", position: { x: 740, y: 100 }, visible: true },
    { node_id: "S_005", type: "execution", label: "实时监控", status: "pending", agent_type: "Execute-Agent", position: { x: 970, y: 100 }, visible: true },
    { node_id: "S_006", type: "artifacts", label: "制品产出", status: "pending", agent_type: "Artifact-Agent", position: { x: 1200, y: 100 }, visible: true },
  ],
  steps: [
    // === 阶段 1: 项目初始化 ===
    {
      type: "thinking",
      content: "正在识别用户权限，检索可用算力分区... 建议在 `Space_Yveson_Pro` 进行实验。",
      node_updates: [{ node_id: "S_001", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "card",
      card: {
        card_type: "RECOMMENDED",
        title: "选择实验空间和基座模型",
        description: "推荐配置已根据您的权限预设",
        options: [
          { label: "Space_Yveson_Pro + Llama-3-8B (推荐)", value: "space_pro_8b", is_recommend: true },
          { label: "Space_Yveson_Pro + Llama-3-70B", value: "space_pro_70b" },
          { label: "Space_Standard + Llama-3-8B", value: "space_std_8b" },
        ],
        action: "SELECT_SPACE_MODEL",
      },
    },
    {
      type: "thinking",
      content: "已确认实验配置，空间和模型已就绪。",
      node_updates: [{ node_id: "S_001", status: "success" }],
      auto_continue: true,
      delay: 3000,
    },

    // === 阶段 2: 数据策略 ===
    {
      type: "thinking",
      content: "正在扫描 BDP 存储... 发现 `dataset_llama_v1`。正在进行 Token 分布采样分析...",
      node_updates: [{ node_id: "S_002", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "card",
      card: {
        card_type: "MULTI_SELECT",
        title: "选择数据集 (最多2个)",
        description: "选择训练集和验证集",
        options: [
          { label: "dataset_llama_v1 (训练集)", value: "train_llama_v1", is_recommend: true },
          { label: "dataset_llama_eval (验证集)", value: "eval_llama", is_recommend: true },
          { label: "dataset_alpaca (辅助训练)", value: "alpaca" },
          { label: "dataset_sharegpt (对话数据)", value: "sharegpt" },
        ],
        action: "SELECT_DATASETS",
      },
    },
    {
      type: "card",
      card: {
        card_type: "DROPDOWN",
        title: "选择 Prompt 模板",
        description: "用于训练的指令格式模板",
        dropdown_options: [
          { label: "Llama-3 Chat (推荐)", value: "llama3_chat" },
          { label: "Alpaca 格式", value: "alpaca" },
          { label: "ShareGPT 多轮对话", value: "sharegpt_format" },
        ],
        action: "SELECT_PROMPT_TEMPLATE",
      },
    },
    {
      type: "thinking",
      content: "数据集和模板已配置，Token 分布分析完成。",
      node_updates: [{ node_id: "S_002", status: "streaming" }],
      auto_continue: true,
      delay: 3000,
    },

    // === 阶段 3: GPU 集群 ===
    {
      type: "thinking",
      content: "计算模型参数量中... 建议使用 4 × A100 (80G) 以开启 DeepSpeed ZeRO-3 优化。",
      node_updates: [{ node_id: "S_003", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "card",
      card: {
        card_type: "RECOMMENDED",
        title: "选择 GPU 配置",
        description: "已根据模型大小自动计算最优配置",
        options: [
          { label: "4 × A100 (80G) - 推荐配置", value: "a100_4x80g", is_recommend: true },
          { label: "2 × H800 (80G)", value: "h800_2x80g" },
          { label: "8 × A100 (80G)", value: "a100_8x80g" },
        ],
        action: "SELECT_GPU",
      },
    },
    {
      type: "thinking",
      content: "GPU 资源已分配，DeepSpeed ZeRO-3 优化已启用。",
      node_updates: [{ node_id: "S_003", status: "success" }],
      auto_continue: true,
      delay: 3000,
    },

    // === 阶段 4: 超参数调优 ===
    {
      type: "thinking",
      content: "根据数据集大小，已为你预设最佳学习率 2e-5。LoRA Rank 建议设置为 8。",
      node_updates: [{ node_id: "S_004", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "card",
      card: {
        card_type: "SLIDER",
        title: "配置超参数",
        description: "微调学习率、批大小和 LoRA Rank",
        slider_options: [
          { label: "学习率", min: 1, max: 10, step: 0.5, default: 2, unit: "e-5" },
          { label: "批大小", min: 16, max: 128, step: 16, default: 32, unit: "batch" },
          { label: "LoRA Rank", min: 4, max: 32, step: 4, default: 8, unit: "rank" },
        ],
        action: "CONFIG_HYPERPARAMS",
      },
    },
    {
      type: "thinking",
      content: "超参数已配置完成，训练准备就绪。",
      node_updates: [{ node_id: "S_004", status: "success" }],
      auto_continue: true,
      delay: 3000,
    },

    // === 阶段 5: 实时监控 ===
    {
      type: "thinking",
      content: "正在提交 K8s 训练任务...",
      node_updates: [{ node_id: "S_005", status: "running" }],
      auto_continue: true,
      delay: 1500,
    },
    {
      type: "thinking",
      content: "任务已提交，训练节点正在启动...",
      node_updates: [{ node_id: "S_005", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "show_loss_chart",
      node_updates: [{ node_id: "S_005", status: "running" }],
    },

    // === 阶段 6: 制品产出 ===
    {
      type: "thinking",
      content: "训练完成，验证集 PPL 达到 1.08，优于 Baseline。正在打包模型权重...",
      node_updates: [{ node_id: "S_006", status: "running" }],
      auto_continue: true,
      delay: 3000,
    },
    {
      type: "card",
      card: {
        card_type: "BUTTON_GROUP",
        title: "训练完成！选择后续操作",
        description: "验证集 PPL: 1.08 | 训练时长: 2h 15m",
        button_options: [
          { label: "部署到在线推理", value: "deploy", style: "primary", icon: "Rocket" },
          { label: "导出到模型中心", value: "export", style: "success", icon: "Download" },
          { label: "查看详细报告", value: "report", style: "secondary", icon: "FileText" },
        ],
        action: "SELECT_NEXT_ACTION",
      },
    },
    {
      type: "thinking",
      content: "恭喜！Llama-3 微调流程已完成，模型已准备就绪。",
      node_updates: [{ node_id: "S_006", status: "success" }],
    },
  ],
};

// 场景 B: 特征处理流（简化可控版）
export const SCENARIO_FEATURE: Scenario = {
  id: "feature_engineering",
  name: "特征处理流",
  triggerKeywords: ["特征", "feature", "bdp", "写入"],
  initialNodes: [
    { node_id: "F_001", type: "intent", label: "需求理解", status: "pending", agent_type: "Brain-Agent", position: { x: 50, y: 100 }, visible: true },
    { node_id: "F_002", type: "bdp_pull", label: "选择数据表", status: "pending", agent_type: "Data-Worker", position: { x: 250, y: 100 }, visible: true },
    { node_id: "F_003", type: "feature_config", label: "配置特征算子", status: "pending", agent_type: "Feature-Worker", position: { x: 450, y: 100 }, visible: true },
  ],
  steps: [
    {
      type: "thinking",
      content: "收到，处理特征工程任务。",
      node_updates: [{ node_id: "F_001", status: "running" }],
      auto_continue: true,
    },
    {
      type: "thinking",
      content: "已确认：从 BDP 提取特征并写入特征中心。",
      node_updates: [{ node_id: "F_001", status: "success" }],
      auto_continue: true,
    },

    // 选择数据表
    {
      type: "thinking",
      content: "第一步：选择数据源表。",
      node_updates: [{ node_id: "F_002", status: "running" }],
      auto_continue: true,
    },
    {
      type: "card",
      card: {
        card_type: "SINGLE_SELECT",
        title: "请选择数据源表",
        description: "从最近使用的业务表中选择",
        options: [
          { label: "user_behavior_daily (用户行为表)", value: "user_behavior", is_recommend: true },
          { label: "order_events (订单事件表)", value: "order_events" },
          { label: "item_profile (商品画像表)", value: "item_profile" },
        ],
        action: "SUBMIT_TABLE",
      },
    },
    {
      type: "thinking",
      content: "已选择数据表。",
      node_updates: [{ node_id: "F_002", status: "success" }],
      auto_continue: true,
    },

    // 配置特征算子
    {
      type: "thinking",
      content: "第二步：配置特征计算方案。",
      node_updates: [{ node_id: "F_003", status: "running" }],
      auto_continue: true,
    },
    {
      type: "card",
      card: {
        card_type: "SINGLE_SELECT",
        title: "选择特征模板",
        description: "选择预定义的特征计算方案",
        options: [
          { label: "用户行为特征包 (32维，推荐)", value: "behavior_32", is_recommend: true },
          { label: "统计特征包 (64维)", value: "stats_64" },
          { label: "时序特征包 (128维)", value: "ts_128" },
        ],
        action: "SELECT_FEATURES",
      },
    },
    {
      type: "thinking",
      content: "已选择特征模板，配置完成！",
      node_updates: [{ node_id: "F_003", status: "success" }],
    },
  ],
};

export function matchScenario(input: string): Scenario | null {
  const normalized = input.toLowerCase();

  for (const scenario of [SCENARIO_FINETUNE, SCENARIO_FEATURE]) {
    if (scenario.triggerKeywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return scenario;
    }
  }

  // 默认返回微调场景
  return SCENARIO_FINETUNE;
}
