import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  view: 'resume' | 'cyber';
}

export default function PageMeta({ title, description, view }: PageMetaProps) {
  // tokens.css keys the cyber view's whole palette off this attribute, so it
  // has to land before the browser paints this route's first frame. Setting
  // it here, during render, rather than in the effect below (which only
  // runs after commit) is what stops a route change from ever painting a
  // frame under the previous route's theme. See also RouteFallback's `view`
  // prop, which covers the Suspense fallback shown before this component
  // itself has even loaded.
  document.documentElement.setAttribute('data-view', view);

  useEffect(() => {
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);

  return null;
}
