import { render, screen, within } from '@testing-library/react';
import Experience from './Experience';
import Education from './Education';
import Achievements from './Achievements';
import { achievements, certifications, education, experience } from '../../data/resume';

describe('Experience', () => {
  it('renders every role with its company and dates', () => {
    render(<Experience />);
    for (const entry of experience) {
      expect(screen.getByText(entry.role)).toBeInTheDocument();
      expect(screen.getByText(entry.company)).toBeInTheDocument();
      expect(screen.getByText(`${entry.start} — ${entry.end}`)).toBeInTheDocument();
    }
  });

  it('renders every highlight as a list item', () => {
    render(<Experience />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(experience.flatMap((entry) => entry.highlights).length);
  });
});

describe('Education', () => {
  it('renders qualifications and certifications', () => {
    render(<Education />);
    expect(screen.getByText(education[0].qualification)).toBeInTheDocument();
    expect(screen.getByText(certifications[0].name)).toBeInTheDocument();
  });
});

describe('Achievements', () => {
  it('renders each achievement with its detail', () => {
    render(<Achievements />);
    const list = screen.getByRole('list');
    for (const item of achievements) {
      expect(within(list).getByText(item.title)).toBeInTheDocument();
      expect(within(list).getByText(item.detail)).toBeInTheDocument();
    }
  });
});
