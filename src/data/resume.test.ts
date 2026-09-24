import {
  achievements,
  coreSkills,
  supportingSkillGroups,
  achievementsLead,
  certifications,
  courses,
  education,
  experience,
  profile,
  projects,
  projectsLead,
  roles,
  skillGroups,
} from './resume';

describe('resume data', () => {
  it('exposes a complete profile', () => {
    expect(profile.name).toBe('Jayson Levin Tapia');
    expect(profile.email).toMatch(/@/);
    expect(profile.cvPath.endsWith('.pdf')).toBe(true);
    expect(profile.socials.length).toBeGreaterThanOrEqual(3);
  });

  it('gives every project a unique id', () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every disclosed project renderable content', () => {
    for (const project of projects.filter((entry) => !entry.confidential)) {
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.highlights.length).toBeGreaterThan(0);
    }
  });

  it('leaks nothing about a confidential project', () => {
    for (const project of projects.filter((entry) => entry.confidential)) {
      expect(project.summary).toBe('');
      expect(project.stack).toHaveLength(0);
      expect(project.highlights).toHaveLength(0);
      expect(project.demoUrl).toBeUndefined();
      expect(project.repoUrl).toBeUndefined();
      expect(project.screenshot).toBeUndefined();
      expect(project.client).toBeUndefined();
      expect(project.download).toBeUndefined();
    }
  });

  it('only ever stores absolute https links', () => {
    const links = [
      ...profile.socials.map((social) => social.href),
      ...projects.flatMap((project) => [project.demoUrl, project.repoUrl, project.download?.url]),
    ].filter((href): href is string => typeof href === 'string' && href.startsWith('http'));

    for (const href of links) {
      expect(href.startsWith('https://')).toBe(true);
    }
  });

  // The APK sits on the portfolio repository's releases, not in the site, so a
  // new version never grows the repository or the deploy. The link names no
  // version: a versioned one broke the moment a new APK replaced the old file,
  // while the latest release always answers, so only the size can go stale and
  // it is given as an approximation.
  it('offers StreamCaption as an Android app to install, from the latest release', () => {
    const app = projects.find((project) => project.id === 'streamcaption');

    expect(app?.kind).toBe('Personal project');
    expect(app?.download?.url).toBe(
      'https://github.com/Levintaps/levi-portfolio/releases/latest/download/StreamCaption.apk',
    );
    expect(app?.download?.detail).toMatch(/^Android 7\.0 or newer, about \d+ MB\./);
  });

  // AWS Cloud Practitioner Essentials is a course, not the exam behind the
  // certification of a similar name, so courses are held to their own shape:
  // dated, credited to whoever ran them, and linked to the certificate itself.
  it('dates every course and credits whoever ran it', () => {
    expect(courses.length).toBeGreaterThan(0);

    for (const course of courses) {
      expect(course.name.length).toBeGreaterThan(0);
      expect(course.issuer.length).toBeGreaterThan(0);
      expect(course.completed).toMatch(/^[A-Z][a-z]{2} \d{4}$/);

      // The picture is what a visitor sees, so it carries a description of
      // its own, and the file it was made from stays beside it.
      if (course.certificate) {
        const { thumbnail, preview, pdf, alt } = course.certificate;
        expect(alt.length).toBeGreaterThan(20);
        expect(pdf).toMatch(/^\/certificates\/[a-z0-9-]+\.pdf$/);
        for (const image of [thumbnail, preview]) {
          expect(image.avif).toMatch(/^\/certificates\/[a-z0-9-]+\.avif$/);
          expect(image.webp).toMatch(/^\/certificates\/[a-z0-9-]+\.webp$/);
          expect(image.fallback).toMatch(/^\/certificates\/[a-z0-9-]+\.jpg$/);
          expect(image.width).toBeGreaterThan(0);
          expect(image.height).toBeGreaterThan(0);
        }
      }
    }
  });

  it('opens with the client work, since the carousel takes the first five in order', () => {
    expect(projects.length).toBeGreaterThanOrEqual(5);
    expect(projects.slice(0, 4).every((project) => project.kind === 'Client project')).toBe(true);
  });

  it('leads the skills with a short core list, every item of it real', () => {
    expect(coreSkills.length).toBeGreaterThanOrEqual(5);
    expect(coreSkills.length).toBeLessThanOrEqual(9);

    const every = skillGroups.flatMap((group) => group.items);
    for (const skill of coreSkills) {
      expect(every).toContain(skill);
    }
  });

  it('never lists a core skill twice', () => {
    const supporting = supportingSkillGroups.flatMap((group) => group.items);
    for (const skill of coreSkills) {
      expect(supporting).not.toContain(skill);
    }
  });

  it('keeps every skill somewhere between the two lists', () => {
    const shown = [...coreSkills, ...supportingSkillGroups.flatMap((group) => group.items)].sort();
    const every = skillGroups.flatMap((group) => group.items).sort();
    expect(shown).toEqual(every);
  });

  it('carries the supporting resume sections', () => {
    expect(experience.length).toBeGreaterThan(0);
    expect(skillGroups.length).toBeGreaterThanOrEqual(5);
    expect(education.length).toBeGreaterThan(0);
    expect(certifications.length).toBeGreaterThan(0);
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('exposes the roles both heroes read, taken from the CV headline', () => {
    expect(roles).toEqual([
      'Software Developer',
      'Information Technology',
      'System Administrator',
      'Cybersecurity Enthusiast',
    ]);
    expect(roles).not.toContain('Security Minded Engineer');
  });

  it('does not claim a course as a certification', () => {
    expect(certifications.some((cert) => cert.name === 'Cloud Practitioner Essentials')).toBe(
      false,
    );
  });

  it('does not link a project demo behind a login wall', () => {
    const vanima = projects.find((project) => project.id === 'vanima-atelier');
    expect(vanima?.demoUrl).toBeUndefined();
  });

  it('keeps the page description in step with the hero introduction', () => {
    expect(profile.intro.length).toBeGreaterThanOrEqual(2);
    expect(profile.summary).toBe(profile.intro.join(' '));
  });

  it('only highlights terms the introduction actually mentions', () => {
    const text = profile.intro.join(' ');
    for (const term of profile.keyTerms) {
      expect(text).toMatch(new RegExp(`\\b${term}\\b`));
    }
  });

  // The introduction talks about the work. Naming the technologies is left
  // to the skills section and the project cards.
  it('names no technology from the skills section in the introduction', () => {
    const text = profile.intro.join(' ');
    for (const skill of skillGroups.flatMap((group) => group.items)) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(text).not.toMatch(new RegExp(`(?<![\\w])${escaped}(?![\\w])`));
    }
  });

  it('never leaves an achievement as a bare heading', () => {
    for (const achievement of achievements) {
      expect(achievement.title.trim().length).toBeGreaterThan(0);
      expect(achievement.detail.trim().length).toBeGreaterThan(0);
    }
  });

  // A note left for filling in later, such as "Add the count and the years
  // here", must never reach the page.
  it('shows no achievement still waiting to be filled in', () => {
    for (const achievement of achievements) {
      expect(achievement.detail).not.toMatch(/\badd\b[^.]*\bhere\b/i);
    }
  });

  it('exposes editable leads for the projects and achievements sections', () => {
    expect(projectsLead.length).toBeGreaterThan(0);
    expect(achievementsLead.length).toBeGreaterThan(0);
  });
});
