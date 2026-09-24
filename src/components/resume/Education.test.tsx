import { render, screen, within } from '@testing-library/react';
import Education from './Education';
import { certifications, courses } from '../../data/resume';

describe('Education', () => {
  // A completion certificate is not an exam pass, so the courses keep their own
  // group rather than sitting among the certifications and reading like one.
  it('keeps the courses apart from the certifications', () => {
    render(<Education />);
    const certs = screen.getByRole('list', { name: /certifications/i });
    const training = screen.getByRole('list', { name: /courses and training/i });

    expect(within(certs).getByText(certifications[0].name)).toBeInTheDocument();
    expect(within(training).getByText(courses[0].name)).toBeInTheDocument();
    expect(within(certs).queryByText(courses[0].name)).toBeNull();
  });

  it('gives each course its issuer and the date it was finished', () => {
    render(<Education />);
    const training = screen.getByRole('list', { name: /courses and training/i });

    for (const course of courses) {
      expect(within(training).getAllByText(course.issuer).length).toBeGreaterThan(0);
      expect(within(training).getAllByText(course.completed).length).toBeGreaterThan(0);
    }
  });

  // The certificate is the proof, so it is a click away, and the link says what
  // opens rather than leaving the visitor to guess at the file.
  it('opens the certificate of a course that ships one', () => {
    render(<Education />);
    const course = courses.find((entry) => entry.certificate);
    if (!course) return;

    const link = screen.getByRole('link', { name: new RegExp(course.name, 'i') });
    expect(link).toHaveAttribute('href', course.certificate);
    expect(link).toHaveAccessibleName(/certificate, pdf/i);
  });
});
