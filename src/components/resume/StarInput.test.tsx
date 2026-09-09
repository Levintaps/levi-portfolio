import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import StarInput from './StarInput';

function Harness() {
  const [value, setValue] = useState(0);
  return <StarInput value={value} onChange={setValue} />;
}

describe('StarInput', () => {
  it('exposes five radio options in a labelled group', () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: /rating/i });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('selects a rating by click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('radio', { name: /4 stars/i }));
    expect(screen.getByRole('radio', { name: /4 stars/i })).toBeChecked();
  });

  it('selects a rating from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: /2 stars/i })).toBeChecked();
  });
});
