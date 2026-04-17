interface MarkdownContentProps {
  html: string | null;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  if (!html) return null;

  return (
    <div
      className="prose [&_pre.mermaid]:border [&_pre.mermaid]:rounded-xl [&_pre.mermaid]:bg-transparent prose-zinc dark:prose-invert max-w-none mx-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
