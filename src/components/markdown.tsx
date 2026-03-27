"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";

interface MarkdownProps {
  content: string;
  className?: string;
  mode?: "qa" | "action";
}

export function Markdown({ content, className, mode = "qa" }: MarkdownProps) {
  return (
    <div className={clsx(
      "markdown-body text-sm leading-relaxed",
      mode === "action" ? "markdown-action" : "markdown-qa",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-sm font-semibold mb-2 mt-3 first:mt-0" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-3 last:mb-0" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-outside ml-5 mb-3 last:mb-0 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-outside ml-5 mb-3 last:mb-0 space-y-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="pl-1" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className={clsx(
              "border-l-4 pl-4 py-1 my-3 italic",
              mode === "action"
                ? "border-slate-600 text-slate-400"
                : "border-slate-300 text-slate-600"
            )} {...props} />
          ),
          pre: ({ ...props }) => (
            <pre className={clsx(
              "rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono",
              mode === "action"
                ? "bg-slate-900/80 border border-slate-700"
                : "bg-slate-900 text-slate-100 shadow-soft"
            )} {...props} />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return isInline ? (
              <code className={clsx(
                "px-1.5 py-0.5 rounded-md text-xs font-mono",
                mode === "action"
                  ? "bg-slate-700 text-pink-300"
                  : "bg-slate-100 text-pink-600 border border-slate-200"
              )} {...props}>
                {children}
              </code>
            ) : (
              <code className={clsx(
                "block",
                mode === "action" ? "text-slate-200" : "text-slate-100"
              )} {...props}>
                {children}
              </code>
            );
          },
          table: ({ ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className={clsx(
              mode === "action" ? "bg-slate-800" : "bg-slate-50"
            )} {...props} />
          ),
          th: ({ ...props }) => (
            <th className={clsx(
              "px-4 py-2 text-left font-semibold border",
              mode === "action" ? "border-slate-700" : "border-slate-200"
            )} {...props} />
          ),
          td: ({ ...props }) => (
            <td className={clsx(
              "px-4 py-2 border",
              mode === "action" ? "border-slate-700" : "border-slate-200"
            )} {...props} />
          ),
          a: ({ ...props }) => (
            <a className={clsx(
              "font-medium underline underline-offset-2 transition-colors",
              mode === "action"
                ? "text-emerald-400 hover:text-emerald-300"
                : "text-indigo-600 hover:text-indigo-500"
            )} target="_blank" rel="noopener noreferrer" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className={clsx(
              "my-4 border-t",
              mode === "action" ? "border-slate-700" : "border-slate-200"
            )} {...props} />
          ),
          input: ({ ...props }) => (
            <input className="mr-2" type="checkbox" checked={props.checked} readOnly />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
