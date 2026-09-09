import { render, screen } from '@testing-library/react';
import Projects from './Projects';
import { projectsLead } from '../../data/resume';

describe('Projects', () => {
  it('renders its section lead from the resume data', () => {
    render(<Projects />);
    expect(screen.getByText(projectsLead)).toBeInTheDocument();
  });
});
