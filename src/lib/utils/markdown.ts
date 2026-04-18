import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

marked.use({
  renderer: {
    code: function ({ text: code, lang }) {
      const escaped = escapeHtml(code);
      if (lang === "mermaid") return `<pre class="mermaid">${escaped}</pre>`;
      return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
    },
  },
});

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string;
}
