export interface SocialLink {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'facebook' | 'discord' | 'mail' | 'phone';
}

export interface Profile {
  name: string;
  initials: string;
  title: string;
  headline: string;
  /** The hero introduction, one entry per paragraph. */
  intro: string[];
  /** Terms set in bold wherever the introduction mentions them. */
  keyTerms: string[];
  /** The introduction as one run of text, for page descriptions. */
  summary: string;
  location: string;
  timezone: string;
  email: string;
  phone: string;
  availability: string;
  cvPath: string;
  portrait: {
    avif: string;
    webp: string;
    fallback: string;
    width: number;
    height: number;
    alt: string;
  };
  socials: SocialLink[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  kind: string;
  start: string;
  end: string;
  highlights: string[];
}

export type ProjectKind =
  | 'Client project'
  | 'Capstone project'
  | 'Personal project'
  | 'Game project'
  | 'Startup project';

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  period: string;
  summary: string;
  stack: string[];
  highlights: string[];
  client?: string;
  clientUrl?: string;
  clientEmail?: string;
  demoUrl?: string;
  repoUrl?: string;
  demoNote?: string;
  repoNote?: string;
  confidential?: boolean;
  screenshot?: {
    avif: string;
    webp: string;
    fallback: string;
    width: number;
    height: number;
    alt: string;
  };
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface EducationEntry {
  qualification: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface Achievement {
  title: string;
  detail: string;
}

export interface ChessStat {
  label: string;
  value: string;
  note: string;
  /** Won at the board in rated play, or online. */
  group: 'board' | 'online';
}

export interface ChessMilestone {
  /** A calendar year, a school year such as 2007–2008, or a span of years. */
  year: string;
  title: string;
  detail: string;
}
