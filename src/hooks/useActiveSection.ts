import { useEffect, useState } from 'react';

// A narrow band below the sticky header. A section becomes current when its
// top crosses that band, not when it first peeks in from the bottom.
const BAND = '-18% 0px -72% 0px';

/**
 * Reports which of the given sections the reader is currently in, for a
 * navigation that marks its place. Null until one of them has been seen.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const signature = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    const inView = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) inView.add(target);
          else inView.delete(target);
        }

        // Positions are read now rather than taken from the entries, whose
        // measurements date from the moment each section crossed the band,
        // thousands of pixels apart. Comparing those picks the wrong section.
        const seen = [...inView].map(
          (element) => [element.id, element.getBoundingClientRect().top] as const,
        );

        // A section whose top is already above the band is one being read, so
        // the most recently crossed of those wins. Otherwise the nearest one
        // still below it does.
        const crossed = seen.filter(([, top]) => top < 0).sort((a, b) => b[1] - a[1]);
        const ahead = seen.filter(([, top]) => top >= 0).sort((a, b) => a[1] - b[1]);

        setActive((crossed[0] ?? ahead[0])?.[0] ?? null);
      },
      { rootMargin: BAND },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [signature]);

  return active;
}
