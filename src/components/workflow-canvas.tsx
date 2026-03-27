"use client";

import React, { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { clsx } from "clsx";
import { CanvasNode, NodeStatus } from "@/lib/scenarios";
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";

interface CustomNodeData {
  label: string;
  status: NodeStatus;
  agent_type: string;
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case "pending":
        return "border-slate-300 bg-slate-50 text-slate-500";
      case "running":
        return "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
      case "success":
        return "border-emerald-400 bg-emerald-50 text-emerald-700";
      case "error":
        return "border-red-400 bg-red-50 text-red-700";
    }
  };

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-slate-400" />;
      case "running":
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "error":
        return <AlertCircle size={16} className="text-red-500" />;
    }
  };

  return (
    <div className={clsx(
      "px-5 py-3 rounded-2xl border-2 shadow-lg min-w-[160px] transition-all duration-300",
      getStatusColor(data.status),
      data.status === "running" && "animate-pulse"
    )}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        {getStatusIcon(data.status)}
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{data.label}</span>
          <span className="text-xs opacity-60">{data.agent_type}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowCanvasProps {
  nodes: CanvasNode[];
  className?: string;
}

function WorkflowCanvasInner({ nodes, className }: WorkflowCanvasProps) {
  // 只过滤出可见的节点
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => n.visible !== false);
  }, [nodes]);

  const reactFlowNodes: Node<CustomNodeData>[] = useMemo(() => {
    return visibleNodes.map((node) => ({
      id: node.node_id,
      type: "custom",
      position: node.position || { x: 100, y: 100 },
      data: {
        label: node.label,
        status: node.status,
        agent_type: node.agent_type,
      },
    }));
  }, [visibleNodes]);

  const reactFlowEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    // 按照节点顺序连接
    for (let i = 0; i < visibleNodes.length - 1; i++) {
      const source = visibleNodes[i];
      const target = visibleNodes[i + 1];
      const sourceStatus = source.status;
      const isAnimated = sourceStatus === "running" || sourceStatus === "success";

      edges.push({
        id: `e-${source.node_id}-${target.node_id}`,
        source: source.node_id,
        target: target.node_id,
        animated: isAnimated,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: {
          stroke: sourceStatus === "success" ? "#10b981" : sourceStatus === "error" ? "#ef4444" : "#cbd5e1",
          strokeWidth: 2,
        },
      });
    }
    return edges;
  }, [visibleNodes]);

  const [internalNodes, setInternalNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [internalEdges, setInternalEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  const onConnect = useCallback(
    (params: Connection) => setInternalEdges((eds) => addEdge(params, eds)),
    [setInternalEdges]
  );

  // Sync external nodes with internal state
  React.useEffect(() => {
    setInternalNodes(reactFlowNodes);
  }, [reactFlowNodes, setInternalNodes]);

  React.useEffect(() => {
    setInternalEdges(reactFlowEdges);
  }, [reactFlowEdges, setInternalEdges]);

  return (
    <div className={clsx("w-full h-full bg-slate-50", className)}>
      <ReactFlow
        nodes={internalNodes}
        edges={internalEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-50"
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls className="bg-white border border-slate-200 shadow-lg rounded-xl" />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas({ nodes, className }: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner nodes={nodes} className={className} />
    </ReactFlowProvider>
  );
}
