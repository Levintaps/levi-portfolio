import { useEffect } from 'react';
import { profile, siteUrl } from '../../data/resume';

export default function StructuredData() {
  useEffect(() => {
    // profile.location is "City, Region, Country" — split rather than
    // duplicating locality/region as separate literals here. The country is
    // emitted as its ISO 3166-1 alpha-2 code (search engines prefer that
    // over the spelled-out name), so it is not taken from the split.
    const [addressLocality, addressRegion] = profile.location
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
        addressCountry: 'PH',
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
