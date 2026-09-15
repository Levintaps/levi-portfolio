/**
 * How far one strap point moves toward its target this frame, as a share of
 * the way there: faster when it lags far behind, gentler when it is close.
 *
 * The share is held between nothing and all of the way. Uncapped, a frame
 * slower than a twenty-fifth of a second asked for more than twice the way,
 * which put the point further past its target than it had been short of it;
 * frame after frame that grew until the strap reached Infinity.
 */
export function followFactor(
  frameSeconds: number,
  distance: number,
  minSpeed: number,
  maxSpeed: number,
): number {
  const closeness = Math.max(0.1, Math.min(1, distance));
  const share = frameSeconds * (minSpeed + closeness * (maxSpeed - minSpeed));
  return Math.min(1, Math.max(0, share));
}
