import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content break-words overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground border-b border-border pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 text-foreground" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed text-foreground/90 break-words overflow-wrap-anywhere" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="mb-4 ml-6 space-y-2 list-disc marker:text-primary" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-4 ml-6 space-y-2 list-decimal marker:text-primary" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-foreground/90 leading-relaxed" {...props} />
          ),
          
          // Code
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code 
                  className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-sm border border-border/50" 
                  {...props} 
                />
              );
            }
            return (
              <code 
                className="block p-4 rounded-lg bg-muted border border-border font-mono text-sm overflow-x-auto my-4" 
                {...props} 
              />
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="mb-4 overflow-x-auto" {...props} />
          ),
          
          // Blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r-lg italic text-foreground/80" 
              {...props} 
            />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a 
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors" 
              target="_blank"
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground border border-border" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-foreground/90 border border-border" {...props} />
          ),
          
          // Horizontal Rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t border-border" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-foreground/90" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
