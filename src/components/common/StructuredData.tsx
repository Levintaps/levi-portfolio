import { useEffect } from 'react';
import { profile, siteUrl } from '../../data/resume';

export default function StructuredData() {
  useEffect(() => {
    // profile.location is "City, Region, Country" — split rather than
    // duplicating those three strings as separate literals here.
    const [addressLocality, addressRegion, addressCountry] = profile.location
      .split(',')
      .map((part) => part.trim());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.title,
      url: siteUrl,
      email: `mailto:${profile.email}`,
      telephone: profile.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality,
        addressRegion,
        addressCountry,
      },
      sameAs: profile.socials.map((social) => social.href),
      description: profile.summary,
    });

    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
