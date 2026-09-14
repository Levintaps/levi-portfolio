import { render, screen } from '@testing-library/react';
import StatusBanner from './StatusBanner';

describe('StatusBanner', () => {
  // A status waits for the screen reader to finish what it is saying.
  it('announces good news politely', () => {
    render(<StatusBanner tone="success">Message sent.</StatusBanner>);

    expect(screen.getByRole('status')).toHaveTextContent('Message sent.');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // An alert interrupts, which a failure deserves and a success does not.
  it('announces a failure straight away', () => {
    render(<StatusBanner tone="error">It did not send.</StatusBanner>);

    expect(screen.getByRole('alert')).toHaveTextContent('It did not send.');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('carries whatever it is given, links included', () => {
    render(
      <StatusBanner tone="error">
        Email <a href="mailto:someone@example.com">someone@example.com</a> instead.
      </StatusBanner>,
    );

    expect(screen.getByRole('link', { name: 'someone@example.com' })).toHaveAttribute(
      'href',
      'mailto:someone@example.com',
    );
  });
});
