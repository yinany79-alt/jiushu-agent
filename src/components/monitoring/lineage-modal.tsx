"use client";

import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Handle,
  Position,
  Node,
  Edge,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { clsx } from "clsx";
import {
  Database,
  Cpu,
  Brain,
  Server,
  X,
  Info,
} from "lucide-react";

interface LineageNode {
  id: string;
  type: "dataSource" | "job" | "model" | "service";
  label: string;
  data: any;
  position: { x: number; y: number };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
}

interface LineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
}

interface CustomNodeData {
  label: string;
  type: "dataSource" | "job" | "model" | "service";
  data: any;
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const getConfig = () => {
    switch (data.type) {
      case "dataSource":
        return {
          icon: <Database size={18} />,
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          label: "数据源",
        };
      case "job":
        return {
          icon: <Cpu size={18} />,
          bg: "bg-violet-50",
          border: "border-violet-200",
          text: "text-violet-700",
          label: "任务",
        };
      case "model":
        return {
          icon: <Brain size={18} />,
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          label: "模型",
        };
      case "service":
        return {
          icon: <Server size={18} />,
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-700",
          label: "服务",
        };
    }
  };

  const config = getConfig();

  return (
    <div className={clsx(
      "px-4 py-3 rounded-2xl border-2 shadow-lg min-w-[160px] transition-all duration-300",
      config.bg,
      config.border
    )}>
      {data.type !== "dataSource" && (
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-400" />
      )}
      <div className="flex items-center gap-2.5">
        <span className={config.text}>{config.icon}</span>
        <div className="flex flex-col">
          <span className={clsx("font-semibold text-sm", config.text)}>{data.label}</span>
          <span className={clsx("text-xs opacity-60", config.text)}>{config.label}</span>
        </div>
      </div>
      {data.type !== "service" && (
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-400" />
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

function LineageModalContent({
  taskName,
  nodes,
  edges,
}: {
  taskName: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
}) {
  const reactFlowNodes: Node<CustomNodeData>[] = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        label: node.label,
        type: node.type,
        data: node.data,
      },
    }));
  }, [nodes]);

  const reactFlowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: {
        stroke: "#94a3b8",
        strokeWidth: 2,
      },
    }));
  }, [edges]);

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-50"
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable={false}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls className="bg-white border border-slate-200 shadow-lg rounded-xl" />
        <Panel position="top-left" className="m-4">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 shadow-soft">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info size={16} />
              <span>{taskName} 的模型血缘链路</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function LineageModal({ isOpen, onClose, taskName, nodes, edges }: LineageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-6xl h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">模型血缘追踪</h3>
            <p className="text-sm text-slate-500">{taskName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* 血缘图谱内容 */}
        <div className="flex-1">
          <ReactFlowProvider>
            <LineageModalContent taskName={taskName} nodes={nodes} edges={edges} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
