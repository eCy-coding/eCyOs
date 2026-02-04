// eCy OS v1005.0 - Lorem Ipsum Generator
// Generate placeholder text with customization

import { useState } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './LoremIpsum.module.css';

type HtmlTag = 'none' | 'p' | 'div' | 'span';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateSentence(wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const word = loremWords[Math.floor(Math.random() * loremWords.length)];
    words.push(i === 0 ? capitalize(word) : word);
  }
  return words.join(' ') + '.';
}

function generateParagraph(sentenceCount: number, wordsPerSentence: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(wordsPerSentence));
  }
  return sentences.join(' ');
}

export function LoremIpsum() {
  const [paragraphCount, setParagraphCount] = useState(3);
  const [sentenceCount, setSentenceCount] = useState(5);
  const [wordsPerSentence, setWordsPerSentence] = useState(15);
  const [htmlTag, setHtmlTag] = useState<HtmlTag>('p');
  const [generatedText, setGeneratedText] = useState('');

  const generateText = () => {
    const paragraphs: string[] = [];
    
    for (let i = 0; i < paragraphCount; i++) {
      const para = generateParagraph(sentenceCount, wordsPerSentence);
      
      switch (htmlTag) {
        case 'p':
          paragraphs.push(`<p>${para}</p>`);
          break;
        case 'div':
          paragraphs.push(`<div>${para}</div>`);
          break;
        case 'span':
          paragraphs.push(`<span>${para}</span>`);
          break;
        default:
          paragraphs.push(para);
      }
    }
    
    setGeneratedText(paragraphs.join('\n\n'));
  };

  const downloadText = () => {
    if (!generatedText) return;

    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lorem-ipsum.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setGeneratedText('');
  };

  // Auto-generate on mount
  if (!generatedText) {
    generateText();
  }

  return (
    <UtilityBase
      title="Lorem Ipsum"
      icon="📄"
      description="Generate placeholder text with customization"
    >
      <div className={styles.container}>
        {/* Controls */}
        <div className={styles.controls}>
          {/* Paragraph Count */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>
              Paragraphs: {paragraphCount}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={paragraphCount}
              onChange={(e) => setParagraphCount(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Sentence Count */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>
              Sentences per paragraph: {sentenceCount}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={sentenceCount}
              onChange={(e) => setSentenceCount(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Words per Sentence */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>
              Words per sentence: {wordsPerSentence}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={wordsPerSentence}
              onChange={(e) => setWordsPerSentence(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* HTML Tag */}
          <div className={styles.control}>
            <label className={styles.controlLabel}>HTML Tag</label>
            <div className={styles.radioGroup}>
              {(['none', 'p', 'div', 'span'] as HtmlTag[]).map((tag) => (
                <label key={tag} className={styles.radio}>
                  <input
                    type="radio"
                    name="htmlTag"
                    value={tag}
                    checked={htmlTag === tag}
                    onChange={(e) => setHtmlTag(e.target.value as HtmlTag)}
                  />
                  <span>{tag === 'none' ? 'None' : `<${tag}>`}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={generateText} className={styles.generateBtn}>
            🔄 Generate
          </button>
          <button onClick={clearAll} className={styles.clearBtn}>
            Clear
          </button>
          <button onClick={downloadText} disabled={!generatedText} className={styles.downloadBtn}>
            📥 Download TXT
          </button>
          {generatedText && <CopyButton text={generatedText} label="Copy All" />}
        </div>

        {/* Preview */}
        {generatedText && (
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>Preview</span>
              <span className={styles.charCount}>
                {generatedText.length} characters
              </span>
            </div>
            <div className={styles.previewContent}>
              <pre>{generatedText}</pre>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Paragraphs</span>
            <span className={styles.statValue}>{paragraphCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Sentences</span>
            <span className={styles.statValue}>{paragraphCount * sentenceCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Words (est.)</span>
            <span className={styles.statValue}>
              {paragraphCount * sentenceCount * wordsPerSentence}
            </span>
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
