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
  summary: string;
  location: string;
  email: string;
  phone: string;
  availability: string;
  currently: string;
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
