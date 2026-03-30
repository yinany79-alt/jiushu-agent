"use client";

import React, { useCallback, useMemo, useState } from "react";
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
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { clsx } from "clsx";
import {
  Database,
  Cpu,
  Brain,
  Server,
  ChevronRight,
  Info,
} from "lucide-react";
import { LineageNode, LineageEdge, ModelVersion } from "@/hooks/use-monitoring-mock";

interface CustomNodeData {
  label: string;
  type: "dataSource" | "job" | "model" | "service";
  data: any;
  selected?: boolean;
  highlighted?: boolean;
}

function CustomNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  const getConfig = () => {
    switch (data.type) {
      case "dataSource":
        return {
          icon: <Database size={18} />,
          bg: "bg-blue-50",
          border: selected ? "border-blue-500 ring-2 ring-blue-200" : "border-blue-200",
          text: "text-blue-700",
          label: "数据源",
        };
      case "job":
        return {
          icon: <Cpu size={18} />,
          bg: "bg-violet-50",
          border: selected ? "border-violet-500 ring-2 ring-violet-200" : "border-violet-200",
          text: "text-violet-700",
          label: "任务",
        };
      case "model":
        return {
          icon: <Brain size={18} />,
          bg: "bg-emerald-50",
          border: selected ? "border-emerald-500 ring-2 ring-emerald-200" : "border-emerald-200",
          text: "text-emerald-700",
          label: "模型",
        };
      case "service":
        return {
          icon: <Server size={18} />,
          bg: "bg-orange-50",
          border: selected ? "border-orange-500 ring-2 ring-orange-200" : "border-orange-200",
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
      config.border,
      data.highlighted ? "ring-4 ring-yellow-200 scale-105" : ""
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

interface LineageCanvasProps {
  nodes: LineageNode[];
  edges: LineageEdge[];
  modelVersions: ModelVersion[];
  onNodeSelect?: (node: LineageNode | null) => void;
  selectedNodes?: string[];
}

function LineageCanvasInner({
  nodes,
  edges,
  modelVersions,
  onNodeSelect,
  selectedNodes = [],
}: LineageCanvasProps) {
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const reactFlowNodes: Node<CustomNodeData>[] = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        label: node.label,
        type: node.type,
        data: node.data,
        selected: selectedNodes.includes(node.id),
        highlighted: highlightedNodes.includes(node.id),
      },
    }));
  }, [nodes, selectedNodes, highlightedNodes]);

  const reactFlowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: {
        stroke: highlightedEdges.includes(edge.id) ? "#eab308" : "#94a3b8",
        strokeWidth: highlightedEdges.includes(edge.id) ? 3 : 2,
      },
    }));
  }, [edges, highlightedEdges]);

  const [internalNodes, setInternalNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [internalEdges, setInternalEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  const onConnect = useCallback(
    (params: Connection) => setInternalEdges((eds) => addEdge(params, eds)),
    [setInternalEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const clickedNode = nodes.find(n => n.id === node.id);
      if (clickedNode) {
        onNodeSelect?.(clickedNode);

        // 高亮上下游
        const upstreamNodes: string[] = [];
        const downstreamNodes: string[] = [];
        const connectedEdges: string[] = [];

        // 查找上游
        let current: string[] = [node.id];
        while (current.length > 0) {
          const next: string[] = [];
          for (const id of current) {
            const incoming = edges.filter(e => e.target === id);
            for (const e of incoming) {
              if (!upstreamNodes.includes(e.source)) {
                upstreamNodes.push(e.source);
                connectedEdges.push(e.id);
                next.push(e.source);
              }
            }
          }
          current = next;
        }

        // 查找下游
        current = [node.id];
        while (current.length > 0) {
          const next: string[] = [];
          for (const id of current) {
            const outgoing = edges.filter(e => e.source === id);
            for (const e of outgoing) {
              if (!downstreamNodes.includes(e.target)) {
                downstreamNodes.push(e.target);
                connectedEdges.push(e.id);
                next.push(e.target);
              }
            }
          }
          current = next;
        }

        setHighlightedNodes([node.id, ...upstreamNodes, ...downstreamNodes]);
        setHighlightedEdges(connectedEdges);
      }
    },
    [nodes, edges, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  }, [onNodeSelect]);

  // Sync external nodes with internal state
  React.useEffect(() => {
    setInternalNodes(reactFlowNodes);
  }, [reactFlowNodes, setInternalNodes]);

  React.useEffect(() => {
    setInternalEdges(reactFlowEdges);
  }, [reactFlowEdges, setInternalEdges]);

  return (
    <div className="w-full h-full bg-slate-50 rounded-2xl">
      <ReactFlow
        nodes={internalNodes}
        edges={internalEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-50 rounded-2xl"
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls className="bg-white border border-slate-200 shadow-lg rounded-xl" />
        <Panel position="top-left" className="m-4">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 shadow-soft">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info size={16} />
              <span>点击节点查看详情并高亮血缘关系</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function LineageCanvas({
  nodes,
  edges,
  modelVersions,
  onNodeSelect,
  selectedNodes,
}: LineageCanvasProps) {
  return (
    <ReactFlowProvider>
      <LineageCanvasInner
        nodes={nodes}
        edges={edges}
        modelVersions={modelVersions}
        onNodeSelect={onNodeSelect}
        selectedNodes={selectedNodes}
      />
    </ReactFlowProvider>
  );
}
