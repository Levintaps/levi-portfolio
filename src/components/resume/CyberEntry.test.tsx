import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CyberEntry from './CyberEntry';

describe('CyberEntry', () => {
  it('links to the cyber route with client-side navigation', () => {
    render(
      <MemoryRouter>
        <CyberEntry />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /enter the lab/i })).toHaveAttribute('href', '/cyber');
  });
});
