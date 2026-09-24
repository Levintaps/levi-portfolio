import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      expect(screen.getByText(`${entry.start} - ${entry.end}`)).toBeInTheDocument();
    }
  });

  it('opens on its heading alone, with no number above it', () => {
    render(<Experience />);
    expect(screen.getByRole('heading', { level: 2, name: 'Inside a corporate IT team' })).toBeInTheDocument();
    expect(screen.queryByText(/^\d{2} \//)).toBeNull();
  });

  it('names the company and the kind of role on one line', () => {
    render(<Experience />);
    for (const entry of experience) {
      const line = screen.getByText(entry.company).closest('p');
      expect(line).toHaveTextContent(entry.kind);
    }
  });

  it('renders every highlight as a list item', () => {
    render(<Experience />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(experience.flatMap((entry) => entry.highlights).length);
  });
});

describe('Education', () => {
  it('renders the degree with its institution and dates', () => {
    render(<Education />);
    for (const entry of education) {
      expect(screen.getByText(entry.qualification)).toBeInTheDocument();
      expect(screen.getByText(entry.institution)).toBeInTheDocument();
      expect(screen.getByText(entry.period)).toBeInTheDocument();
    }
  });

  it('ties the degree to the capstone that came out of it', () => {
    render(<Education />);
    for (const entry of education) {
      if (!entry.detail) continue;
      expect(screen.getByText(entry.detail)).toBeInTheDocument();
    }
  });

  it('lists every certification under its own label, with the issuer', () => {
    render(<Education />);
    const list = screen.getByRole('list', { name: /certifications/i });
    expect(within(list).getAllByRole('listitem')).toHaveLength(certifications.length);

    for (const certification of certifications) {
      expect(within(list).getByText(certification.name)).toBeInTheDocument();
      expect(within(list).getByText(certification.issuer)).toBeInTheDocument();
    }
  });

  // The AWS course was finished in September 2026, but a completion certificate
  // is not the exam behind AWS Certified Cloud Practitioner, so it belongs with
  // the courses and must never be read off this list as a certification.
  it('claims no credential that is not in the data', () => {
    render(<Education />);
    const list = screen.getByRole('list', { name: /certifications/i });
    const claimed = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent ?? '');
    expect(claimed).toHaveLength(certifications.length);
    expect(claimed.join(' ')).not.toMatch(/AWS|Cloud Practitioner|Certified/i);
  });
});

describe('Achievements', () => {
  it('renders each achievement with its detail', () => {
    render(
      <MemoryRouter>
        <Achievements />
      </MemoryRouter>,
    );
    const list = screen.getByRole('list');
    for (const item of achievements) {
      expect(within(list).getByText(item.title)).toBeInTheDocument();
      expect(within(list).getByText(item.detail)).toBeInTheDocument();
    }
  });
});
