import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

/**
 * Renderiza markdown com:
 *  - GFM (tabelas, checkboxes, ~strikethrough~)
 *  - Syntax highlight nos blocos de código
 *
 * Uso: <MarkdownContent>{post.content}</MarkdownContent>
 */
export default function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose-post">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
