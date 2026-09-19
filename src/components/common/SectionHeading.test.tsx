import { render, screen } from '@testing-library/react';
import SectionHeading from './SectionHeading';

describe('SectionHeading', () => {
  // The heading names the section by itself: no numbered label sits above it.
  it('shows the title and the lead, and nothing else', () => {
    const { container } = render(<SectionHeading title="Selected work" lead="Things I built." />);

    expect(screen.getByRole('heading', { level: 2, name: 'Selected work' })).toBeInTheDocument();
    expect(screen.getByText('Things I built.')).toBeInTheDocument();
    expect(container.querySelector('header')?.children).toHaveLength(2);
  });
});
