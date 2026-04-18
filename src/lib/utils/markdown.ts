import { marked } from "marked";
import hljs from "highlight.js";

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
      if (lang === "mermaid") {
        return `<pre class="mermaid">${code}</pre>`;
      }

      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(code, { language: lang }).value;
        return `<pre><code class="hljs language-${escapeHtml(lang)}">${highlighted}</code></pre>`;
      }

      const highlighted = hljs.highlightAuto(code).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    },
  },
});

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string;
}
