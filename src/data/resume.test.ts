import {
  achievements,
  achievementsLead,
  certifications,
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

  it('gives every project renderable content', () => {
    for (const project of projects) {
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.highlights.length).toBeGreaterThan(0);
    }
  });

  it('only ever stores absolute https links', () => {
    const links = [
      ...profile.socials.map((social) => social.href),
      ...projects.flatMap((project) => [project.demoUrl, project.repoUrl]),
    ].filter((href): href is string => typeof href === 'string' && href.startsWith('http'));

    for (const href of links) {
      expect(href.startsWith('https://')).toBe(true);
    }
  });

  it('features at least three projects', () => {
    expect(projects.filter((project) => project.featured).length).toBeGreaterThanOrEqual(3);
  });

  it('carries the supporting resume sections', () => {
    expect(experience.length).toBeGreaterThan(0);
    expect(skillGroups.length).toBeGreaterThanOrEqual(5);
    expect(education.length).toBeGreaterThan(0);
    expect(certifications.length).toBeGreaterThan(0);
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('exposes the rotating hero roles the cyber view reads, grounded in the CV headline', () => {
    expect(roles.length).toBeGreaterThanOrEqual(3);
    expect(roles).toContain('Full Stack Developer');
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

  it('exposes editable leads for the projects and achievements sections', () => {
    expect(projectsLead.length).toBeGreaterThan(0);
    expect(achievementsLead.length).toBeGreaterThan(0);
  });
});
