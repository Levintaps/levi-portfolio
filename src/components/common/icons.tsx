export type IconName =
  | 'github'
  | 'linkedin'
  | 'facebook'
  | 'discord'
  | 'mail'
  | 'phone'
  | 'download'
  | 'external'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'star'
  | 'arrow';

const paths: Record<IconName, string> = {
  github:
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C6.9 1.1 5.8 1.4 5.8 1.4A4.9 4.9 0 0 0 5.7 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22',
  linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v1.5A6 6 0 0 1 16 8ZM6 9H2v12h4Z M4 3.5A2.5 2.5 0 1 1 4 8.5a2.5 2.5 0 0 1 0-5Z',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z',
  discord:
    'M8.5 9.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM8 4l-.6 1.2A15 15 0 0 0 3 6.5C1.5 10 1 14 2 18a16 16 0 0 0 5 2l1-1.6a10 10 0 0 1-2-1 12 12 0 0 0 10 0 10 10 0 0 1-2 1L15 20a16 16 0 0 0 5-2c1-4 .5-8-1-11.5a15 15 0 0 0-4.4-1.3L14 4a13 13 0 0 0-6 0Z',
  mail: 'M3 6h18v12H3Z M3 6l9 7 9-7',
  phone:
    'M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 19h16',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  sun: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0-5v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5M18.5 18.5 20 20M20 4l-1.5 1.5M5.5 18.5 4 20',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8Z',
  arrow: 'M5 12h14m0 0-5-5m5 5-5 5',
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      <path d={paths[name]} />
    </svg>
  );
}
