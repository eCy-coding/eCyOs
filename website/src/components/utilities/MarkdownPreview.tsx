import { useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './MarkdownPreview.module.css';

// Configure marked for GFM
marked.setOptions({
  gfm: true,
  breaks: true,
});

const exampleMarkdown = `# Welcome to Markdown Preview

## Features

- **GitHub Flavored Markdown** support
- Live preview with syntax highlighting
- Tables, task lists, and strikethrough
- Code blocks with language detection

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('eCy OS');
\`\`\`

## Task List

- [x] Implement markdown parser
- [x] Add syntax highlighting
- [ ] Export to PDF

## Table

| Feature | Status |
|---------|--------|
| Tables | ✅ |
| Code | ✅ |
| Lists | ✅ |

## Emphasis

**Bold text** and *italic text* and ~~strikethrough~~.

> This is a blockquote with **formatting**.
`;

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [html, setHtml] = useState('');

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
    try {
      const rendered = marked(value) as string;
      setHtml(rendered);
      
      // Apply syntax highlighting after render
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 0);
    } catch (e) {
      console.error('Markdown parse error:', e);
      setHtml('<p>Error parsing markdown</p>');
    }
  };

  const loadExample = () => {
    setMarkdown(exampleMarkdown);
    handleMarkdownChange(exampleMarkdown);
  };

  const clearAll = () => {
    setMarkdown('');
    setHtml('');
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
  };

  // Initial render
  if (!html && markdown) {
    handleMarkdownChange(markdown);
  }

  return (
    <UtilityBase
      title="Markdown Preview"
      icon="📝"
      description="Live preview with GitHub Flavored Markdown"
    >
      <div className={styles.container}>
        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={loadExample} className={styles.exampleBtn}>
            Load Example
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
          <CopyButton text={markdown} label="Copy Markdown" />
          <button onClick={copyHtml} className={styles.copyHtmlBtn}>
            Copy HTML
          </button>
        </div>

        {/* Split Pane */}
        <div className={styles.splitPane}>
          {/* Editor */}
          <div className={styles.editorPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneTitle}>📝 Editor</span>
              <span className={styles.charCount}>{markdown.length} chars</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder="Write your markdown here..."
              className={styles.textarea}
            />
          </div>

          {/* Preview */}
          <div className={styles.previewPane}>
            <div className={styles.paneHeader}>
              <span className={styles.paneTitle}>👁️ Preview</span>
            </div>
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Lines</span>
            <span className={styles.statValue}>{markdown.split('\n').length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Words</span>
            <span className={styles.statValue}>
              {markdown.split(/\s+/).filter((w) => w.length > 0).length}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Characters</span>
            <span className={styles.statValue}>{markdown.length}</span>
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
