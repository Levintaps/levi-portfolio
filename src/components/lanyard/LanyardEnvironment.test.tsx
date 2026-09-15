import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import LanyardEnvironment from './LanyardEnvironment';

// drei's Environment redraws its whole cube map, six renders of the lighting
// scene, whenever the children it is given are not the very same object as
// last time. The stand-in keeps every set of children it receives.
const received = vi.hoisted(() => ({ children: [] as ReactNode[] }));

vi.mock('@react-three/drei', () => ({
  Environment: ({ children }: { children: ReactNode }) => {
    received.children.push(children);
    return null;
  },
  Lightformer: () => null,
}));

describe('LanyardEnvironment', () => {
  it('hands the environment the very same lights however often the badge re-renders', () => {
    received.children = [];
    const { rerender } = render(<LanyardEnvironment />);
    rerender(<LanyardEnvironment />);
    rerender(<LanyardEnvironment />);

    expect(received.children).toHaveLength(3);
    expect(received.children[1]).toBe(received.children[0]);
    expect(received.children[2]).toBe(received.children[0]);
  });
});
