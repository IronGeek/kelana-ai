import MarkdownToJsx from 'markdown-to-jsx';
import { cn } from '@/lib/utils';

import styles from '@/components/markdown.module.scss';
import { MouseEvent, PropsWithChildren, useState } from 'react';

interface MarkdownViewProps {
  className?: string
  handwritten?: boolean
  transparent?: boolean
  fontScale?: number
  children?: string
}

const MarkdownView = ({ className, fontScale, handwritten, transparent, children }: MarkdownViewProps) => {
  const [markdown, setMarkdown] = useState(children);

  return (
    <MarkdownToJsx
      className={
        cn('markdown', styles.markdown, {
          [styles['markdown-transparent']]: !!transparent,
          [styles['markdown-handwritten']]: !!handwritten,
        }, className)
      }
      style={{
        '--font-factor': fontScale
      } as any}
    >
      {markdown}
    </MarkdownToJsx>
  )
}

interface MarkdownTextProps {
  className?: string
  fontScale?: number
  children?: string
}

const sanitize = (line: string): string => {
  return line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

const highlightMarkdown = (line: string): string => {
  if (/^\s*$/.test(line)) { return '&nbsp;'; }

  // Regex rules to wrap markdown tokens in styled spans (ORDER MATTERS HERE)
  // Escape raw HTML brackets to prevent accidental HTML rendering
  let html = sanitize(line);

  // MATCH NESTED BLOCKQUOTES: Counts any sequence of '&gt;' tokens separated by optional spaces
  // Example match: '  &gt; &gt; text' -> group 1: leading whitespace, group 2: the quote tokens, group 3: the rest
  const bqRegex = /^(\s*)((?:&gt;\s*)+)(.*)$/gm;

  if (bqRegex.test(html)) {
    html = html.replace(bqRegex, (match, leadingSpaces, bqTokens, content) => {
      // Count how many individual '>' tokens exist to determine depth level
      const depth = (bqTokens.match(/&gt;/g) || []).length;

      // Wrap the raw '>' tokens in our semi-transparent indicator style so they look clean
      const styledTokens = `<span class="markdown-quote-indicator">${bqTokens}</span>`;

      // Return the row wrapped in a structural blockquote tag containing the depth level
      return `${leadingSpaces}<span class="markdown-quote" data-depth="${depth}">${styledTokens}${content}</span>`;
    });
  } else {
    // Horizontal Rule (Only works if line is just 3 or more dashes, allowing leading spaces)
    html = html.replace(/^(\s*)(-{3,})\s*$/gm, '$1<span class="markdown-hr">$2</span>')
      // Checked Checkbox (e.g. - [x] or * [X]).
      .replace(/^(\s*)([-*+]\s+)(\[)([xX])(\]\s?)(.*)$/gm, '$1$2<span class="markdown-check-indicator">$3</span><span class="markdown-check" data-clickable="true" data-checked="true">$4</span><span class="markdown-check-indicator">$5</span><span class="markdown-check-label">$6</span>')
      // Unchecked Checkbox (e.g. - [ ])
      .replace(/^(\s*)([-*+]\s+)(\[)(\s)(\]\s?)(.*)$/gm, '$1$2<span class="markdown-check-indicator">$3</span><span class="markdown-check" data-clickable="true" data-checked="false">$4</span><span class="markdown-check-indicator">$5</span><span class="markdown-check-label">$6</span>')
      // Headers & Blockquotes
      .replace(/^(\s*)(#{1,6})(\s+.*)$/gm, '$1<span class="markdown-header-indicator">$2</span><span class="markdown-header">$3</span>')
      // Standard Lists (Only matches if it wasn't caught by the checkbox rules above)
      .replace(/^(\s*)([-*+])(\s+.*)$/gm, '$1<span class="markdown-list-indicator">$2</span><span class="markdown-list">$3</span>')
  }

  // .replace(/^(\s*)(&gt;)(\s+.*)$/gm, '$1<span class="markdown-quote-indicator">$2</span><span class="markdown-quote">$3</span>')

  // Inline token formatting blocks
  return html.replace(/\*\*(.*?)\*\*/g, '<span class="markdown-bold-indicator">**</span><span class="markdown-bold">$1</span><span class="markdown-bold-indicator">**</span>')
    .replace(/([*_])(.*?)\1/g, '<span class="markdown-italic-indicator">$1</span><span class="markdown-italic">$2</span><span class="markdown-italic-indicator">$1</span>')
    .replace(/(~)(.*?)\1/g, '<span class="markdown-strike-indicator">$1</span><span class="markdown-strike">$2</span><span class="markdown-strike-indicator">$1</span>')
    .replace(/`(.*?)`/g, '<span class="markdown-code-indicator">`</span><span class="markdown-code">$1</span><span class="markdown-code-indicator">`</span>')
    // Matches http:// or https:// followed by non-space characters.
    .replace(/(?<!\()(https?:\/\/[^\s$.?#].[^\s]*)(?![^<]*>)/g, '<span class="markdown-url" data-clickable="true" data-url="$1">$1</span>')
    // Matches Markdown Image (e.g. (![]())
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<span class="markdown-image-indicator">![</span><span class="markdown-image">$1</span><span class="markdown-image-indicator">]</span><span class="markdown-url-indicator">(</span><span class="markdown-url" data-clickable="true" data-url="$2">$2</span><span class="markdown-url-indicator">)</span>')
    // Matches Markdown Link (e.g []())
    .replace(/(?<!\!)\[(.*?)\]\((.*?)\)/g, '<span class="markdown-link-indicator">[</span><span class="markdown-link">$1</span><span class="markdown-link-indicator">]</span><span class="markdown-url-indicator">(</span><span class="markdown-url" data-clickable="true" data-url="$2">$2</span><span class="markdown-url-indicator">)</span>')
}

const highlightBlock = (line: string): string => {
  let html = sanitize(line);

  return html.replace(/(```)(.*)/g, '<span class="markdown-fence-indicator">$1</span><span class="markdown-fence-meta">$2</span>');
};

const highlightCode = (line: string): string => {
  return `<span class="markdown-code-fence">${sanitize(line)}</span>`;
}

interface MarkdownLineProps {
  html?: string
  className?: string
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

const MarkdownLine = ({ className, html, onClick }: MarkdownLineProps) => {
  return (
    <div className="markdown-line">
      { html ? <span className={className} onClick={onClick} dangerouslySetInnerHTML={{ __html: html}}></span> : null }
    </div>
  );
};

const MarkdownText = ({ className, fontScale, children }: MarkdownTextProps) => {
  const [lines, setLines] = useState<string[]>(children?.split('\n') ?? []);

  const handleLineClick = (e: MouseEvent<HTMLSpanElement>, row: number) => {
    const target = e.target as HTMLSpanElement;
    if (target.getAttribute('data-clickable') === 'true') {
      const updated = [...lines];
      const current = lines[row];

      if (target.classList.contains('markdown-check')) {
        const checked = target.getAttribute('data-checked');
        if (checked === 'true') {
          updated[row] = current.replace('[x]', '[ ]').replace('data-checked="true"', 'data-checked="false"');
        } else {
          updated[row] = current.replace('[ ]', '[x]').replace('data-checked="false"', 'data-checked="true"');
        }
        setLines(updated);
      } else if (target.classList.contains('markdown-url')) {
        const dest = target.getAttribute('data-url');
        if (dest) {
          window.open(dest, '_blank', 'noopener, noreferrer');
        }
      }
    }
  };

  let inCodeBlock: boolean = false;
  return (
    <pre
      className={cn('markdown-text', styles['markdown-text'], className)}
      style={{
        '--font-factor': fontScale
      } as any}
    >
      <code className="flex flex-col gap-0.5 leading-normal whitespace-pre-wrap font-mono text-shadow-xs">
        {
          lines.map((line, row) => {
            const ln = line.trim();
            if (ln === '') { return <MarkdownLine key={row} /> }

            if (ln.startsWith('```')) {
              inCodeBlock = !inCodeBlock;

              return <MarkdownLine
                key={row}
                className={
                  cn('markdown-fence', {
                    'markdown-fence-start': inCodeBlock,
                    'markdown-fence-end': !inCodeBlock
                  })
                }
                html={highlightBlock(line)} />
            }

            if (inCodeBlock) {
              return <MarkdownLine key={row} className="markdown-fence" html={highlightCode(line)} />
            }

            return <MarkdownLine key={row} html={highlightMarkdown(line)} onClick={(e) => { handleLineClick(e, row) }} />
          })
        }
      </code>
    </pre>
  )
};

const Markdown = {
  View: MarkdownView,
  Text: MarkdownText
};

export { Markdown, MarkdownView, MarkdownText };
export type { MarkdownViewProps, MarkdownTextProps };
