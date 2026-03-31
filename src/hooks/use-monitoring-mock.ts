"use client";

import { useState, useEffect, useMemo } from "react";

export type TaskStatus = "Healthy" | "Failed" | "Alerting" | "Idle";
export type TaskType = "Training" | "Inference" | "Batch";

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  type: TaskType;
  owner: string;
  space: string;
  duration: string;
  gpuUtilization: number;
  memoryUsage: number;
  currentLoss?: number;
  gradientNorm?: number;
  errors?: string[];
  lineageData?: {
    nodes: LineageNode[];
    edges: LineageEdge[];
  };
}

export interface PerformanceDataPoint {
  time: string;
  latency: number;
  throughput: number;
  isDeployment?: boolean;
  isAnomaly?: boolean;
  event?: string;
}

export interface GPUCard {
  id: string;
  name: string;
  type: "A100" | "H800";
  utilization: number;
  temperature: number;
  memoryUsed: number;
  memoryTotal: number;
  smUtilization: number;
  assignedTask?: {
    taskName: string;
    workerId: string;
    role: "master" | "worker";
  };
}

export interface LineageNode {
  id: string;
  type: "dataSource" | "job" | "model" | "service";
  label: string;
  data: any;
  position: { x: number; y: number };
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
}

export interface ModelVersion {
  id: string;
  version: string;
  metrics: {
    accuracy: number;
    recall: number;
    latency: number;
    modelSize: number;
  };
  hyperparams: {
    learningRate: number;
    batchSize: number;
    optimizer: string;
    epochs: number;
  };
}

export interface ServiceInfo {
  id: string;
  name: string;
  status: "healthy" | "warning" | "critical";
  version: string;
  deployedAt: string;
  owner: string;
}

export interface ServicePerformanceData {
  [serviceId: string]: PerformanceDataPoint[];
}

export interface MonitoringData {
  aiInsight: {
    summary: string;
    status: "normal" | "warning" | "critical";
    actions?: { id: string; label: string; targetId?: string }[];
  };
  taskStats: {
    Healthy: number;
    Failed: number;
    Alerting: number;
    Idle: number;
  };
  tasks: Task[];
  performanceData: PerformanceDataPoint[];
  servicePerformanceData: ServicePerformanceData;
  services: ServiceInfo[];
  gpuCards: GPUCard[];
  finopsAlert: {
    idleCount: number;
    dailyCost: number;
  };
  lineageNodes: LineageNode[];
  lineageEdges: LineageEdge[];
  modelVersions: ModelVersion[];
}

function generateNormalSummary(): string {
  const summaries = [
    "当前集群运行稳健，98% 的任务处于预期 SLA 内。今日 GPU 算力利用率峰值出现在 10:00，目前水位安全。",
    "全系统状态良好，所有核心服务响应正常。训练任务进度符合预期，未发现异常指标。",
    "集群资源利用率处于健康区间，近 24 小时无重大告警事件。模型推理延迟稳定。",
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

function generateWarningSummary(): string {
  const summaries = [
    "发现 1 个高危告警！任务 `Llama-v3-Train-07` 出现显存泄露风险，预计 15 分钟后 OOM。线上 `CTR-Ranking-Service` 延迟上升 12ms，建议排查网关负载。",
    "注意：任务 `Qwen-Finetune-02` 梯度范数持续偏高，可能存在训练不稳定风险。同时有 2 个推理服务 P99 延迟超标。",
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

// ========== 任务专属的血缘数据 (放在 baseTasks 之前) ==========

const llamaTaskLineage = {
  nodes: [
    { id: "llama_data_1", type: "dataSource", label: "BDP_Corpus_v3", data: { rows: "5.2B", columns: 12 }, position: { x: 50, y: 100 } },
    { id: "llama_data_2", type: "dataSource", label: "Human_Feedback", data: { rows: "1.2M", columns: 8 }, position: { x: 50, y: 200 } },
    { id: "llama_job_1", type: "job", label: "Data_Preprocess", data: { engine: "Spark" }, position: { x: 250, y: 150 } },
    { id: "llama_job_2", type: "job", label: "SFT_Training", data: { gpu: 8 }, position: { x: 450, y: 150 } },
    { id: "llama_model", type: "model", label: "Llama-3-8B-FT", data: { version: "v1.0" }, position: { x: 650, y: 100 } },
    { id: "llama_service", type: "service", label: "API_Serving", data: { instance: 4 }, position: { x: 850, y: 100 } },
  ],
  edges: [
    { id: "llama_e1", source: "llama_data_1", target: "llama_job_1" },
    { id: "llama_e2", source: "llama_data_2", target: "llama_job_1" },
    { id: "llama_e3", source: "llama_job_1", target: "llama_job_2" },
    { id: "llama_e4", source: "llama_job_2", target: "llama_model" },
    { id: "llama_e5", source: "llama_model", target: "llama_service" },
  ],
} as { nodes: LineageNode[], edges: LineageEdge[] };

const qwenTaskLineage = {
  nodes: [
    { id: "qwen_data_1", type: "dataSource", label: "Chinese_Corpus", data: { rows: "3.8B" }, position: { x: 50, y: 100 } },
    { id: "qwen_job_1", type: "job", label: "Tokenization", data: { engine: "Python" }, position: { x: 250, y: 100 } },
    { id: "qwen_job_2", type: "job", label: "LoRA_Finetune", data: { gpu: 4 }, position: { x: 450, y: 100 } },
    { id: "qwen_model", type: "model", label: "Qwen-7B-LoRA", data: { version: "v0.9" }, position: { x: 650, y: 100 } },
  ],
  edges: [
    { id: "qwen_e1", source: "qwen_data_1", target: "qwen_job_1" },
    { id: "qwen_e2", source: "qwen_job_1", target: "qwen_job_2" },
    { id: "qwen_e3", source: "qwen_job_2", target: "qwen_model" },
  ],
} as { nodes: LineageNode[], edges: LineageEdge[] };

const videoTaskLineage = {
  nodes: [
    { id: "video_data_1", type: "dataSource", label: "Video_Clips_v2", data: { rows: "2.1M" }, position: { x: 50, y: 100 } },
    { id: "video_data_2", type: "dataSource", label: "Audio_Features", data: { rows: "2.1M" }, position: { x: 50, y: 200 } },
    { id: "video_job_1", type: "job", label: "Feature_Extract", data: { gpu: 16 }, position: { x: 250, y: 150 } },
    { id: "video_job_2", type: "job", label: "Contrastive_Learn", data: { gpu: 8 }, position: { x: 450, y: 150 } },
    { id: "video_model", type: "model", label: "Video-Encoder-v2", data: { version: "v2.1" }, position: { x: 650, y: 100 } },
    { id: "video_service", type: "service", label: "Batch_Inference", data: { instance: 8 }, position: { x: 850, y: 100 } },
  ],
  edges: [
    { id: "video_e1", source: "video_data_1", target: "video_job_1" },
    { id: "video_e2", source: "video_data_2", target: "video_job_1" },
    { id: "video_e3", source: "video_job_1", target: "video_job_2" },
    { id: "video_e4", source: "video_job_2", target: "video_model" },
    { id: "video_e5", source: "video_model", target: "video_service" },
  ],
} as { nodes: LineageNode[], edges: LineageEdge[] };

// ========== 基础任务数据 ==========

const baseTasks: Task[] = [
  {
    id: "job_001",
    name: "Llama-v3-Train-07",
    status: "Alerting",
    type: "Training",
    owner: "zhang.san",
    space: "NLP-Platform",
    duration: "2h 34m",
    gpuUtilization: 92,
    memoryUsage: 78,
    currentLoss: 0.872,
    gradientNorm: 15.2,
    errors: ["Warning: Gradient norm exceeded threshold", "Memory usage increasing steadily"],
    lineageData: llamaTaskLineage,
  },
  {
    id: "job_002",
    name: "CTR-Ranking-Service",
    status: "Healthy",
    type: "Inference",
    owner: "li.si",
    space: "RecSys",
    duration: "12d 5h",
    gpuUtilization: 45,
    memoryUsage: 52,
  },
  {
    id: "job_003",
    name: "Qwen-Finetune-02",
    status: "Failed",
    type: "Training",
    owner: "wang.wu",
    space: "NLP-Platform",
    duration: "45m",
    gpuUtilization: 0,
    memoryUsage: 0,
    errors: ["CUDA out of memory", "Error at epoch 3, batch 128"],
    lineageData: qwenTaskLineage,
  },
  {
    id: "job_004",
    name: "Embedding-Batch-Prod",
    status: "Healthy",
    type: "Batch",
    owner: "zhao.liu",
    space: "Data-Platform",
    duration: "3h 12m",
    gpuUtilization: 78,
    memoryUsage: 65,
    currentLoss: 0.234,
  },
  {
    id: "job_005",
    name: "Chat-Service-V2",
    status: "Healthy",
    type: "Inference",
    owner: "qian.yang",
    space: "Chat-Platform",
    duration: "5d 8h",
    gpuUtilization: 55,
    memoryUsage: 48,
  },
  {
    id: "job_006",
    name: "Image-Encoding-Job",
    status: "Idle",
    type: "Batch",
    owner: "zhou.wu",
    space: "CV-Platform",
    duration: "0m",
    gpuUtilization: 0,
    memoryUsage: 0,
  },
  {
    id: "job_007",
    name: "Video-Understanding-Train",
    status: "Healthy",
    type: "Training",
    owner: "wu.zheng",
    space: "CV-Platform",
    duration: "6h 22m",
    gpuUtilization: 89,
    memoryUsage: 82,
    currentLoss: 0.456,
    gradientNorm: 3.8,
    lineageData: videoTaskLineage,
  },
];

// ========== 其他数据生成函数 ==========

function generatePerformanceData(): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const isBusinessHour = hour >= 9 && hour <= 21;

    const baseLatency = isBusinessHour ? 45 : 25;
    const baseThroughput = isBusinessHour ? 850 : 350;

    const latency = baseLatency + Math.random() * 20 - 10;
    const throughput = baseThroughput + Math.random() * 200 - 100;

    let isDeployment = false;
    let isAnomaly = false;
    let event = undefined;

    if (i === 18) {
      isDeployment = true;
      event = "部署 v2.3.1";
    } else if (i === 8) {
      isAnomaly = true;
      event = "数据库延迟";
    }

    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      latency: Math.max(10, latency),
      throughput: Math.max(100, throughput),
      isDeployment,
      isAnomaly,
      event,
    });
  }

  return data;
}

function generateGPUCards(): GPUCard[] {
  const cards: GPUCard[] = [];
  const names = ["GPU-01", "GPU-02", "GPU-03", "GPU-04", "GPU-05", "GPU-06", "GPU-07", "GPU-08"];

  // 定义训练任务分配
  const taskAssignments = [
    { taskName: "Llama-v3-Train-07", workerId: "worker-0", role: "master" as const },
    { taskName: "Llama-v3-Train-07", workerId: "worker-1", role: "worker" as const },
    { taskName: "Llama-v3-Train-07", workerId: "worker-2", role: "worker" as const },
    { taskName: "Llama-v3-Train-07", workerId: "worker-3", role: "worker" as const },
    { taskName: "Video-Understanding-Train", workerId: "worker-0", role: "master" as const },
    { taskName: "Video-Understanding-Train", workerId: "worker-1", role: "worker" as const },
    { taskName: "Embedding-Batch-Prod", workerId: "worker-0", role: "master" as const },
    { taskName: "Embedding-Batch-Prod", workerId: "worker-1", role: "worker" as const },
  ];

  names.forEach((name, idx) => {
    const type = idx < 4 ? "A100" : "H800";
    const baseUtilization = idx < 4 ? 75 : 60; // 训练中的GPU利用率更高
    const utilization = Math.min(100, Math.max(10, baseUtilization + (Math.random() - 0.5) * 30));
    const memoryTotal = type === "A100" ? 80 : 96;
    const memoryUsed = (utilization / 100) * memoryTotal * (0.75 + Math.random() * 0.2);

    cards.push({
      id: `gpu_${idx + 1}`,
      name,
      type,
      utilization: Math.round(utilization),
      temperature: Math.round(35 + utilization * 0.35),
      memoryUsed: Math.round(memoryUsed),
      memoryTotal,
      smUtilization: Math.round(utilization * (0.85 + Math.random() * 0.15)),
      assignedTask: taskAssignments[idx],
    });
  });

  return cards;
}

const lineageNodes: LineageNode[] = [
  {
    id: "data_1",
    type: "dataSource",
    label: "BDP_User_Table",
    data: { rows: "2.3B", columns: 156, path: "s3://bdp/user/v2" },
    position: { x: 50, y: 100 },
  },
  {
    id: "data_2",
    type: "dataSource",
    label: "BDP_Item_Features",
    data: { rows: "850M", columns: 89, path: "s3://bdp/item/v1" },
    position: { x: 50, y: 200 },
  },
  {
    id: "job_1",
    type: "job",
    label: "Spark_Data_Clean",
    data: { engine: "Spark", executor: 64, duration: "2.5h" },
    position: { x: 250, y: 150 },
  },
  {
    id: "job_2",
    type: "job",
    label: "Galileo_Train",
    data: { engine: "Galileo", gpu: 8, framework: "PyTorch" },
    position: { x: 450, y: 150 },
  },
  {
    id: "model_v1",
    type: "model",
    label: "Ranking_Model_V1.0",
    data: { version: "v1.0", accuracy: 0.78, createdAt: "2024-01-15" },
    position: { x: 650, y: 100 },
  },
  {
    id: "model_v2",
    type: "model",
    label: "Ranking_Model_V2.0",
    data: { version: "v2.0", accuracy: 0.85, createdAt: "2024-02-20" },
    position: { x: 650, y: 200 },
  },
  {
    id: "service_1",
    type: "service",
    label: "Triton_Prod_Service",
    data: { instance: 12, qps: 850, latency: "45ms" },
    position: { x: 850, y: 150 },
  },
];

const lineageEdges: LineageEdge[] = [
  { id: "e1", source: "data_1", target: "job_1" },
  { id: "e2", source: "data_2", target: "job_1" },
  { id: "e3", source: "job_1", target: "job_2" },
  { id: "e4", source: "job_2", target: "model_v1" },
  { id: "e5", source: "job_2", target: "model_v2" },
  { id: "e6", source: "model_v2", target: "service_1" },
];

const modelVersions: ModelVersion[] = [
  {
    id: "model_v1",
    version: "V1.0",
    metrics: { accuracy: 0.78, recall: 0.72, latency: 32, modelSize: 2.1 },
    hyperparams: { learningRate: 1e-4, batchSize: 64, optimizer: "Adam", epochs: 10 },
  },
  {
    id: "model_v2",
    version: "V2.0",
    metrics: { accuracy: 0.85, recall: 0.81, latency: 42, modelSize: 6.3 },
    hyperparams: { learningRate: 5e-5, batchSize: 32, optimizer: "AdamW", epochs: 15 },
  },
];

const services: ServiceInfo[] = [
  {
    id: "ctr-ranking",
    name: "CTR-Ranking-Service",
    status: "healthy",
    version: "v2.3.1",
    deployedAt: "2024-03-28 14:30:00",
    owner: "li.si",
  },
  {
    id: "chat-service",
    name: "Chat-Service-V2",
    status: "healthy",
    version: "v1.5.0",
    deployedAt: "2024-03-25 09:15:00",
    owner: "qian.yang",
  },
  {
    id: "embedding-batch",
    name: "Embedding-Batch-Prod",
    status: "warning",
    version: "v0.9.2",
    deployedAt: "2024-03-20 16:45:00",
    owner: "zhao.liu",
  },
  {
    id: "realtime-rec",
    name: "RealTime-Rec-Service",
    status: "healthy",
    version: "v3.0.1",
    deployedAt: "2024-03-15 11:20:00",
    owner: "wang.wu",
  },
];

function generateServicePerformanceData(serviceId: string, baseLatency: number, baseThroughput: number): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const isBusinessHour = hour >= 9 && hour <= 21;

    const latencyVariance = serviceId === "embedding-batch" ? 30 : 15;
    const throughputVariance = serviceId === "chat-service" ? 300 : 150;

    const latency = baseLatency + Math.random() * latencyVariance - latencyVariance / 2;
    const throughput = baseThroughput + Math.random() * throughputVariance - throughputVariance / 2;

    let isDeployment = false;
    let isAnomaly = false;
    let event = undefined;

    if (i === 18 && serviceId === "ctr-ranking") {
      isDeployment = true;
      event = "部署 v2.3.1";
    } else if (i === 8 && serviceId === "ctr-ranking") {
      isAnomaly = true;
      event = "数据库延迟";
    } else if (i === 12 && serviceId === "embedding-batch") {
      isAnomaly = true;
      event = "处理队列积压";
    }

    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      latency: Math.max(5, latency),
      throughput: Math.max(50, throughput),
      isDeployment,
      isAnomaly,
      event,
    });
  }

  return data;
}

function generateAllServicePerformanceData(): ServicePerformanceData {
  return {
    "ctr-ranking": generateServicePerformanceData("ctr-ranking", 45, 850),
    "chat-service": generateServicePerformanceData("chat-service", 120, 2400),
    "embedding-batch": generateServicePerformanceData("embedding-batch", 85, 320),
    "realtime-rec": generateServicePerformanceData("realtime-rec", 28, 1800),
  };
}

export function useMonitoringMock() {
  const [hasWarning, setHasWarning] = useState(true);
  const [data, setData] = useState<MonitoringData>(() => generateData(true));

  function generateData(warning: boolean): MonitoringData {
    const tasks = [...baseTasks];
    if (!warning) {
      tasks[0].status = "Healthy";
      tasks[2].status = "Healthy";
    }

    const taskStats = {
      Healthy: tasks.filter(t => t.status === "Healthy").length,
      Failed: tasks.filter(t => t.status === "Failed").length,
      Alerting: tasks.filter(t => t.status === "Alerting").length,
      Idle: tasks.filter(t => t.status === "Idle").length,
    };

    return {
      aiInsight: {
        summary: warning ? generateWarningSummary() : generateNormalSummary(),
        status: warning ? "warning" : "normal",
        actions: warning
          ? [{ id: "RESTART_WITH_NEW_CONFIG", label: "扩容并重启", targetId: "job_001" }]
          : undefined,
      },
      taskStats,
      tasks,
      performanceData: generatePerformanceData(),
      servicePerformanceData: generateAllServicePerformanceData(),
      services,
      gpuCards: generateGPUCards(),
      finopsAlert: {
        idleCount: 3,
        dailyCost: 1200,
      },
      lineageNodes,
      lineageEdges,
      modelVersions,
    };
  }

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        gpuCards: prev.gpuCards.map(card => ({
          ...card,
          utilization: Math.min(100, Math.max(0, card.utilization + (Math.random() - 0.5) * 10)),
          temperature: Math.min(90, Math.max(30, card.temperature + (Math.random() - 0.5) * 2)),
        })),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleWarning = () => {
    const newWarning = !hasWarning;
    setHasWarning(newWarning);
    setData(generateData(newWarning));
  };

  return {
    data,
    toggleWarning,
    hasWarning,
  };
}
