import { projectLinkNotes } from '../../data/resume';
import type { Project } from '../../data/types';

export function demoNoteFor(project: Project): string {
  if (project.demoNote) return project.demoNote;
  return project.kind === 'Client project'
    ? projectLinkNotes.clientDemo
    : projectLinkNotes.demo;
}

export function repoNoteFor(project: Project): string {
  return project.repoNote ?? projectLinkNotes.repo;
}
