import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useElementWidth } from './useElementWidth';

function Probe() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const width = useElementWidth(element);
  return (
    <div ref={setElement}>
      <output>{width === null ? 'unknown' : String(width)}</output>
    </div>
  );
}

describe('useElementWidth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reads the width before the first paint, and follows it as it changes', () => {
    let width = 752;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width);
    let notify: () => void = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );

    render(<Probe />);
    expect(screen.getByRole('status')).toHaveTextContent('752');

    width = 560;
    act(() => notify());
    expect(screen.getByRole('status')).toHaveTextContent('560');
  });

  // An element with no layout yet, as in a test environment, says nothing
  // about how much room there is.
  it('reports an unknown width while the element has none', () => {
    render(<Probe />);
    expect(screen.getByRole('status')).toHaveTextContent('unknown');
  });
});
