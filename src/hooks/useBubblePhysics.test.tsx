import { useMemo } from 'react';
import { render, screen } from '@testing-library/react';
import { useBubblePhysics, type BubblePhysics } from './useBubblePhysics';

const DIAMETER = 40;
const TANK = { width: 400, height: 300 };

let physics: BubblePhysics;

function Item({ id }: { id: number }) {
  const ref = useMemo(() => physics.attach(id, DIAMETER), [id]);
  return <li ref={ref} data-testid={`bubble-${id}`} />;
}

function Tank({ paused, ids }: { paused: boolean; ids: number[] }) {
  physics = useBubblePhysics(paused);
  return (
    <ul ref={physics.tankRef}>
      {ids.map((id) => (
        <Item key={id} id={id} />
      ))}
    </ul>
  );
}

/** The top left corner a bubble was last moved to. */
function corner(id: number) {
  const match = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px, 0(px)?\)/.exec(
    screen.getByTestId(`bubble-${id}`).style.transform,
  );
  if (!match) throw new Error(`bubble ${id} has not been placed`);
  return { x: Number(match[1]), y: Number(match[2]) };
}

let queued = new Map<number, FrameRequestCallback>();
let nextFrame = 1;

function frame(now: number) {
  const callbacks = [...queued.values()];
  queued = new Map();
  for (const callback of callbacks) callback(now);
}

describe('useBubblePhysics', () => {
  beforeEach(() => {
    queued = new Map();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(TANK.width);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(TANK.height);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = nextFrame++;
      queued.set(id, callback);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      queued.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('places each bubble wholly inside the tank the moment it appears', () => {
    render(<Tank paused={false} ids={[1, 2, 3]} />);

    for (const id of [1, 2, 3]) {
      const { x, y } = corner(id);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(TANK.width - DIAMETER);
      expect(y).toBeLessThanOrEqual(TANK.height - DIAMETER);
    }
  });

  it('moves the bubbles along on every frame', () => {
    render(<Tank paused={false} ids={[1, 2]} />);
    const before = corner(1);

    frame(1000);
    frame(1016);
    frame(1032);

    expect(corner(1)).not.toEqual(before);
  });

  it('stops asking for frames while paused, and leaves the bubbles where they are', () => {
    const { rerender } = render(<Tank paused={false} ids={[1, 2]} />);
    frame(1000);
    frame(1016);

    rerender(<Tank paused ids={[1, 2]} />);
    const held = corner(1);
    frame(1032);
    frame(1048);

    expect(queued.size).toBe(0);
    expect(corner(1)).toEqual(held);
  });

  it('starts moving again when the pause ends', () => {
    const { rerender } = render(<Tank paused ids={[1, 2]} />);
    const before = corner(1);

    rerender(<Tank paused={false} ids={[1, 2]} />);
    frame(5000);
    frame(5016);
    frame(5032);

    expect(corner(1)).not.toEqual(before);
  });

  it('keeps a bubble still while it is being read, and lets it go after', () => {
    render(<Tank paused={false} ids={[1, 2]} />);
    physics.hold(1, true);
    const reading = corner(1);

    frame(1000);
    frame(1016);
    frame(1032);
    expect(corner(1)).toEqual(reading);

    physics.hold(1, false);
    frame(1048);
    frame(1064);
    expect(corner(1)).not.toEqual(reading);
  });
});
