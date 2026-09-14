import { Fragment } from 'react';

interface EmphasizeProps {
  text: string;
  terms: string[];
}

function escape(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders text with each listed term set in bold, so a reader skimming for a
 * technology finds it. Terms match whole words only, and a longer term wins
 * over a shorter one it contains.
 */
export default function Emphasize({ text, terms }: EmphasizeProps) {
  if (terms.length === 0) return <>{text}</>;

  const ordered = [...terms].sort((a, b) => b.length - a.length).map(escape);
  // Letters and digits either side of a match mean it sits inside a longer
  // word, which \b alone cannot rule out for terms ending in punctuation.
  const pattern = new RegExp(`(?<![\\w])(${ordered.join('|')})(?![\\w])`, 'g');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        // split() with a capturing group puts every match at an odd index.
        index % 2 === 1 ? <strong key={index}>{part}</strong> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}
