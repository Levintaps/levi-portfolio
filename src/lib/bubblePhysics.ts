/**
 * Movement for the message bubbles: each drifts in a straight line, turns back
 * from the walls of the tank, and bounces off the others. Positions are the
 * bubble's centre, in pixels from the tank's top left corner.
 */
export interface Body {
  x: number;
  y: number;
  /** Pixels per second. */
  vx: number;
  vy: number;
  radius: number;
  /** Being read: stays where it is, and the others bounce off it. */
  held: boolean;
  /** Popping: still drifts, but nothing collides with it any more. */
  ghost: boolean;
}

export interface Bounds {
  width: number;
  height: number;
}

type Random = () => number;

/** Slow enough to read on the move, never so slow a bubble looks stuck. */
export const SPEED_MIN = 14;
export const SPEED_MAX = 46;
const LAUNCH_MIN = 20;
const LAUNCH_MAX = 36;

/** A longer frame than this, such as a tab coming back, counts as this long. */
const MAX_STEP_MS = 50;
/** Crowded bubbles push apart a little more with each pass. */
const PASSES = 3;
/** The breathing room a new bubble looks for around itself. */
const SPAWN_GAP = 6;
const SPAWN_TRIES = 24;

function keepSpeed(body: Body) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed === 0) {
    body.vx = SPEED_MIN;
  } else if (speed < SPEED_MIN || speed > SPEED_MAX) {
    const scale = Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed)) / speed;
    body.vx *= scale;
    body.vy *= scale;
  }
}

function keepInside(body: Body, bounds: Bounds) {
  if (body.radius * 2 >= bounds.width) {
    body.x = bounds.width / 2;
  } else if (body.x - body.radius < 0) {
    body.x = body.radius;
    body.vx = Math.abs(body.vx);
  } else if (body.x + body.radius > bounds.width) {
    body.x = bounds.width - body.radius;
    body.vx = -Math.abs(body.vx);
  }

  if (body.radius * 2 >= bounds.height) {
    body.y = bounds.height / 2;
  } else if (body.y - body.radius < 0) {
    body.y = body.radius;
    body.vy = Math.abs(body.vy);
  } else if (body.y + body.radius > bounds.height) {
    body.y = bounds.height - body.radius;
    body.vy = -Math.abs(body.vy);
  }
}

/** Sends a bubble that a collision left all but still away from the other. */
function rescue(body: Body, awayX: number, awayY: number) {
  if (Math.hypot(body.vx, body.vy) < SPEED_MIN) {
    body.vx = awayX * SPEED_MIN;
    body.vy = awayY * SPEED_MIN;
  }
}

function collide(a: Body, b: Body) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const reach = a.radius + b.radius;
  if (distance >= reach) return;

  // Two bubbles on the very same spot have no line between them; any will do.
  const nx = distance === 0 ? 1 : dx / distance;
  const ny = distance === 0 ? 0 : dy / distance;
  const overlap = reach - distance;

  if (a.held || b.held) {
    // The held bubble stays put. The other takes the whole push and bounces
    // off it as it would off a wall.
    const moving = a.held ? b : a;
    const outX = a.held ? nx : -nx;
    const outY = a.held ? ny : -ny;
    moving.x += outX * overlap;
    moving.y += outY * overlap;
    const closing = moving.vx * outX + moving.vy * outY;
    if (closing < 0) {
      moving.vx -= 2 * closing * outX;
      moving.vy -= 2 * closing * outY;
    }
    return;
  }

  a.x -= (nx * overlap) / 2;
  a.y -= (ny * overlap) / 2;
  b.x += (nx * overlap) / 2;
  b.y += (ny * overlap) / 2;

  // Equal bubbles trade the part of their motion that runs along the line
  // between them, and keep the rest. Only a pair still closing is traded, so a
  // pair already parting is never turned back into each other.
  const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (closing < 0) {
    a.vx += closing * nx;
    a.vy += closing * ny;
    b.vx -= closing * nx;
    b.vy -= closing * ny;
    rescue(a, -nx, -ny);
    rescue(b, nx, ny);
  }
}

/** Advances every bubble by one frame, in place. */
export function step(bodies: Body[], elapsedMs: number, bounds: Bounds) {
  if (bounds.width <= 0 || bounds.height <= 0) return;
  const seconds = Math.min(Math.max(elapsedMs, 0), MAX_STEP_MS) / 1000;

  for (const body of bodies) {
    if (body.held) continue;
    keepSpeed(body);
    body.x += body.vx * seconds;
    body.y += body.vy * seconds;
  }

  for (let pass = 0; pass < PASSES; pass += 1) {
    for (let first = 0; first < bodies.length; first += 1) {
      if (bodies[first].ghost) continue;
      for (let second = first + 1; second < bodies.length; second += 1) {
        const a = bodies[first];
        const b = bodies[second];
        if (b.ghost || (a.held && b.held)) continue;
        collide(a, b);
      }
    }
    for (const body of bodies) keepInside(body, bounds);
  }
}

function clearance(x: number, y: number, radius: number, bodies: Body[]) {
  let nearest = Infinity;
  for (const body of bodies) {
    if (body.ghost) continue;
    nearest = Math.min(nearest, Math.hypot(body.x - x, body.y - y) - body.radius - radius);
  }
  return nearest;
}

function across(extent: number, radius: number, random: Random) {
  return radius * 2 >= extent ? extent / 2 : radius + random() * (extent - radius * 2);
}

/**
 * A place anywhere in the tank for a new bubble, clear of the others. When the
 * tank is too full for that, the roomiest of the places it tried.
 */
export function findSpawn(bodies: Body[], radius: number, bounds: Bounds, random: Random) {
  let best = { x: bounds.width / 2, y: bounds.height / 2 };
  let bestRoom = -Infinity;

  for (let attempt = 0; attempt < SPAWN_TRIES; attempt += 1) {
    const x = across(bounds.width, radius, random);
    const y = across(bounds.height, radius, random);
    const room = clearance(x, y, radius, bodies);
    if (room >= SPAWN_GAP) return { x, y };
    if (room > bestRoom) {
      best = { x, y };
      bestRoom = room;
    }
  }

  return best;
}

/** A drifting velocity in a random direction. */
export function launch(random: Random) {
  const heading = random() * Math.PI * 2;
  const speed = LAUNCH_MIN + random() * (LAUNCH_MAX - LAUNCH_MIN);
  return { vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed };
}
