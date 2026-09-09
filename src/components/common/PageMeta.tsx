import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  view: 'resume' | 'cyber';
}

export default function PageMeta({ title, description, view }: PageMetaProps) {
  useEffect(() => {
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);

    document.documentElement.setAttribute('data-view', view);
  }, [title, description, view]);

  return null;
}
