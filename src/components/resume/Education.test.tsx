import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Education from './Education';
import { certifications, courses } from '../../data/resume';

const withCertificate = courses.find((course) => course.certificate)!;

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

  it('gives each course its issuer, and its date where there is one', () => {
    render(<Education />);
    const training = screen.getByRole('list', { name: /courses and training/i });

    for (const course of courses) {
      expect(within(training).getAllByText(course.issuer).length).toBeGreaterThan(0);
      if (course.completed) {
        expect(within(training).getAllByText(course.completed).length).toBeGreaterThan(0);
      }
    }
  });

  // A remembered month would be a guess, and a guess on a portfolio is a small
  // lie, so a course whose date is gone simply carries none.
  it('leaves out the date rather than guessing at one', () => {
    render(<Education />);
    const undated = courses.find((course) => !course.completed);
    expect(undated, 'expected a course with no date').toBeDefined();

    const entry = screen.getByText(undated!.name).closest('li')!;
    expect(within(entry).getByText(undated!.issuer)).toBeInTheDocument();
    expect(entry.textContent).toBe(`${undated!.name}${undated!.issuer}`);
  });

  // Asking for a download to see a certificate is work the visitor should not
  // have to do, so the proof is on the page as a picture.
  it('shows the certificate as a picture rather than a file to fetch', () => {
    render(<Education />);
    const training = screen.getByRole('list', { name: /courses and training/i });

    expect(within(training).queryByRole('link')).toBeNull();

    // The button says what it opens, so the picture inside it repeats nothing.
    const opener = within(training).getByRole('button', {
      name: `See the ${withCertificate.name} certificate`,
    });
    const thumbnail = opener.querySelector('img')!;
    expect(thumbnail).toHaveAttribute('src', withCertificate.certificate!.thumbnail.fallback);
    expect(thumbnail).toHaveAttribute('alt', '');
    expect(thumbnail).toHaveAttribute('loading', 'lazy');
  });

  it('opens the certificate over the page, with the file a click away', async () => {
    const user = userEvent.setup();
    render(<Education />);

    await user.click(screen.getByRole('button', { name: new RegExp(withCertificate.name, 'i') }));

    const panel = await screen.findByRole('dialog');
    expect(panel).toHaveAccessibleName(new RegExp(withCertificate.name, 'i'));
    expect(within(panel).getByRole('img', { name: withCertificate.certificate!.alt })).toHaveAttribute(
      'src',
      withCertificate.certificate!.preview.fallback,
    );
    expect(within(panel).getByRole('link', { name: /pdf/i })).toHaveAttribute(
      'href',
      withCertificate.certificate!.pdf,
    );
  });

  it('closes the certificate on Escape and hands focus back', async () => {
    const user = userEvent.setup();
    render(<Education />);

    const opener = screen.getByRole('button', { name: new RegExp(withCertificate.name, 'i') });
    await user.click(opener);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
