interface MarkdownContentProps {
  html: string | null;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  if (!html) return null;

  return (
    <div
      className="prose [&_pre.mermaid]:border prose-pre:p-1 prose-pre:rounded-xl prose-code:rounded-lg prose-pre:border-dashed prose-pre:border prose-pre:bg-transparent [&_pre.mermaid]:rounded-xl [&_pre.mermaid]:bg-transparent prose-zinc dark:prose-invert max-w-none mx-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
