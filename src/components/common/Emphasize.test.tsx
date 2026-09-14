import { render } from '@testing-library/react';
import Emphasize from './Emphasize';

function marked(container: HTMLElement): string[] {
  return [...container.querySelectorAll('strong')].map((node) => node.textContent ?? '');
}

describe('Emphasize', () => {
  it('marks each term it is given', () => {
    const { container } = render(
      <Emphasize text="Built in React and TypeScript on Firebase." terms={['React', 'TypeScript', 'Firebase']} />,
    );
    expect(marked(container)).toEqual(['React', 'TypeScript', 'Firebase']);
  });

  it('leaves the wording exactly as it was', () => {
    const text = 'Comfortable in React, and at home with Active Directory.';
    const { container } = render(<Emphasize text={text} terms={['React', 'Active Directory']} />);
    expect(container.textContent).toBe(text);
  });

  it('marks a term of more than one word as a single run', () => {
    const { container } = render(
      <Emphasize text="Accounts through Active Directory." terms={['Active Directory']} />,
    );
    expect(marked(container)).toEqual(['Active Directory']);
  });

  // "Java" must not light up the first four letters of "JavaScript".
  it('never marks a term inside a longer word', () => {
    const { container } = render(<Emphasize text="JavaScript, not Java." terms={['Java']} />);
    expect(marked(container)).toEqual(['Java']);
    expect(container.textContent).toBe('JavaScript, not Java.');
  });

  it('prefers the longer term when two could match the same words', () => {
    const { container } = render(
      <Emphasize text="Uses React Native daily." terms={['React', 'React Native']} />,
    );
    expect(marked(container)).toEqual(['React Native']);
  });

  it('renders plain text when there is nothing to mark', () => {
    const { container } = render(<Emphasize text="Nothing special here." terms={[]} />);
    expect(marked(container)).toEqual([]);
    expect(container.textContent).toBe('Nothing special here.');
  });
});
