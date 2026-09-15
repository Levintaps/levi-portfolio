import { followFactor } from './strapFollow';

const MIN_SPEED = 0;
const MAX_SPEED = 50;

/** One point of the strap chasing a still target for a run of frames. */
function chase(frameSeconds: number, frames: number) {
  let position = 0;
  const target = 1;
  const visited: number[] = [];
  for (let frame = 0; frame < frames; frame += 1) {
    const factor = followFactor(frameSeconds, Math.abs(target - position), MIN_SPEED, MAX_SPEED);
    position += (target - position) * factor;
    visited.push(position);
  }
  return visited;
}

describe('followFactor', () => {
  it('eases a strap point most of the way in one frame at sixty frames a second', () => {
    expect(followFactor(1 / 60, 1, MIN_SPEED, MAX_SPEED)).toBeCloseTo(50 / 60);
  });

  it('eases more gently when the point is already close', () => {
    // Distance counts for no less than 0.1, so 1/60 of 0.1 of 50.
    expect(followFactor(1 / 60, 0.02, MIN_SPEED, MAX_SPEED)).toBeCloseTo(5 / 60);
  });

  // A frame that takes longer than a twenty-fifth of a second used to push the
  // point past its target by more than it was short, every frame, until the
  // strap reached Infinity and three.js logged an error on every frame.
  it('never carries a point past what it follows, however slow the frames', () => {
    for (const frameSeconds of [1 / 60, 1 / 20, 1 / 10, 0.5, 2]) {
      const visited = chase(frameSeconds, 200);
      for (const position of visited) {
        expect(Number.isFinite(position)).toBe(true);
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThanOrEqual(1);
      }
      expect(visited[visited.length - 1]).toBeCloseTo(1);
    }
  });

  it('never moves a point backwards when a frame reports no time or less', () => {
    expect(followFactor(0, 1, MIN_SPEED, MAX_SPEED)).toBe(0);
    expect(followFactor(-0.1, 1, MIN_SPEED, MAX_SPEED)).toBe(0);
  });
});
