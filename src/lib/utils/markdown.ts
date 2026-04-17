import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.setOptions({
  breaks: true,
  gfm: true,
});

marked.use({
  renderer: {
    code: function ({ text: code, lang }) {
      if (lang == "mermaid") return `<pre class="mermaid">${code}</pre>`;
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    },
  },
});

export function renderMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html);
}
