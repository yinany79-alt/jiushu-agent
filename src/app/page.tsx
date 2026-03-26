import { Sidebar } from "@/components/sidebar";
import { Chatbox } from "@/components/chatbox";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar />
      {/* 中间 Chatbox 区域 */}
      <main className="flex-1">
        <Chatbox />
      </main>
    </div>
  );
}
