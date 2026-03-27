import { Sidebar } from "@/components/sidebar";
import { AgenticWorkflow } from "@/components/agentic-workflow";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar />
      {/* 中间 Agentic Workflow 区域 */}
      <main className="flex-1">
        <AgenticWorkflow />
      </main>
    </div>
  );
}
