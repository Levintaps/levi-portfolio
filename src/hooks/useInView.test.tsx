import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { useInView } from './useInView';
import { stubIntersectionObserver } from '../test/viewport';

function Probe() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const inView = useInView(element);
  return <div ref={setElement}>{inView ? 'in view' : 'out of view'}</div>;
}

describe('useInView', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Without a way to tell, work carries on as it always did rather than
  // stopping for good.
  it('counts an element as in view where the browser cannot say', () => {
    render(<Probe />);
    expect(screen.getByText('in view')).toBeInTheDocument();
  });

  it('follows an element out of view and back in', () => {
    const viewport = stubIntersectionObserver();
    render(<Probe />);
    const element = screen.getByText('in view');

    viewport.setVisible(element, false);
    expect(element).toHaveTextContent('out of view');

    viewport.setVisible(element, true);
    expect(element).toHaveTextContent('in view');
  });

  it('stops watching once the component is gone', () => {
    const viewport = stubIntersectionObserver();
    const { unmount } = render(<Probe />);
    const element = screen.getByText('in view');
    expect(viewport.isWatched(element)).toBe(true);

    unmount();

    expect(viewport.isWatched(element)).toBe(false);
  });
});
