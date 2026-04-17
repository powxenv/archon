interface MarkdownContentProps {
  html: string | null;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  if (!html) return null;

  return (
    <div
      className="prose prose-zinc dark:prose-invert max-w-none mx-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
