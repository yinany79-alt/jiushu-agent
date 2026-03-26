export function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo 图标 - 参考用户提供的样式 */}
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 红色部分 */}
          <path d="M5 5H20L12 20H5V5Z" fill="#FF2D55" />
          {/* 蓝色部分 */}
          <path d="M5 20H12L8 36C7 38.5 4 39 3 37C2 35 5 33 5 30V20Z" fill="#2563EB" />
          <path d="M5 20H15L10 36C9 38.5 6 39 5 37C4 35 7 33 7 30V20Z" fill="#3B82F6" />
        </svg>
      </div>
      {/* 文字 */}
      <span className="text-xl font-bold text-slate-700">九数算法中台</span>
      {/* Beta 标签 */}
      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
        Beta
      </span>
    </div>
  );
}
