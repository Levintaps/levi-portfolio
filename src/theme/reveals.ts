export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export type RevealName = 'corner' | 'center' | 'page' | 'doors' | 'curtain' | 'button' | 'crumple';

/** One of the browser's two photographs of the page, and how it moves. */
export interface RevealLayer {
  pseudoElement: typeof NEW | typeof OLD;
  keyframes: Keyframe[];
  /** The curve for the whole run. Left out, the shared ease is used. */
  easing?: string;
}

export interface Reveal {
  name: RevealName;
  duration: number;
  /** Set when the reveal starts from the theme button and must know where it is. */
  needsOrigin?: boolean;
  layers(viewport: Viewport, origin?: Point): RevealLayer[];
}

// The page as it was and the page as it now is, photographed by the browser
// either side of the theme change.
const NEW = '::view-transition-new(root)';
const OLD = '::view-transition-old(root)';

const DURATION_MS = 700;

/**
 * A circle of the new theme opening from `centre` until it reaches the corner
 * of the screen furthest from it, rounded up so no sliver is left uncovered.
 */
function circleFrom(centre: Point, { width, height }: Viewport): RevealLayer[] {
  const radius = Math.ceil(
    Math.hypot(Math.max(centre.x, width - centre.x), Math.max(centre.y, height - centre.y)),
  );
  const at = `at ${centre.x}px ${centre.y}px`;
  return [
    {
      pseudoElement: NEW,
      keyframes: [{ clipPath: `circle(0px ${at})` }, { clipPath: `circle(${radius}px ${at})` }],
    },
  ];
}

function insetFrom(start: string): RevealLayer[] {
  return [
    {
      pseudoElement: NEW,
      keyframes: [{ clipPath: `inset(${start})` }, { clipPath: 'inset(0% 0% 0% 0%)' }],
    },
  ];
}

// How far out each point of the page's outline ends up, as a share of the
// ball's radius, one for each point of the outline. Uneven but shallow: deep
// notches in a few points read as a star, small bumps in many read as a
// screwed-up sheet of paper.
const CREASES = [
  0.94, 0.86, 0.98, 0.9, 0.82, 0.96, 0.88, 1, 0.84, 0.93, 0.87, 0.97, 0.81, 0.91, 0.99, 0.85,
  0.95, 0.83, 0.92, 1, 0.86, 0.9, 0.97, 0.8, 0.94, 0.88, 0.99, 0.84, 0.93, 0.89, 0.96, 0.82,
];

function px(value: number): string {
  return `${Math.round(value * 10) / 10}px`;
}

function polygon(points: Point[]): string {
  return `polygon(${points.map(({ x, y }) => `${px(x)} ${px(y)}`).join(', ')})`;
}

/**
 * The page's outline as thirty-two points, clockwise from the top left: the
 * four corners and seven more along each edge. The crumpled ball moves these
 * same points, since a polygon only animates into one with as many points.
 */
function outline({ width, height }: Viewport): Point[] {
  const perEdge = CREASES.length / 4;
  const along = Array.from({ length: perEdge }, (_, index) => index / perEdge);
  return [
    ...along.map((share) => ({ x: width * share, y: 0 })),
    ...along.map((share) => ({ x: width, y: height * share })),
    ...along.map((share) => ({ x: width * (1 - share), y: height })),
    ...along.map((share) => ({ x: 0, y: height * (1 - share) })),
  ];
}

function crumple(viewport: Viewport): RevealLayer[] {
  const { width, height } = viewport;
  const middle = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.45;

  const page = polygon(outline(viewport));
  // Each point of the outline pulled in along its own line to the middle.
  const ball = polygon(
    outline(viewport).map((point, index) => {
      const angle = Math.atan2(point.y - middle.y, point.x - middle.x);
      const reach = radius * CREASES[index];
      return { x: middle.x + Math.cos(angle) * reach, y: middle.y + Math.sin(angle) * reach };
    }),
  );
  const flat = 'brightness(1) contrast(1)';
  // Folds catch less light, so the ball is a little darker and harder.
  const folded = 'brightness(0.86) contrast(1.12)';
  const moved = (x: number, y: number, turn: number, scale: number) =>
    `translate(${px(x)}, ${px(y)}) rotate(${turn}deg) scale(${scale})`;

  // Every frame names every property. A property missing from a frame would
  // ease towards the page's own value, and the ball would open back up. Each
  // comment describes the movement that starts at its frame.
  return [
    {
      pseudoElement: OLD,
      easing: 'linear',
      keyframes: [
        // Screwed up into a ball where it stands.
        {
          offset: 0,
          easing: 'cubic-bezier(0.55, 0, 0.35, 1)',
          transform: moved(0, 0, 0, 1),
          clipPath: page,
          filter: flat,
        },
        // A last squeeze before the throw.
        {
          offset: 0.45,
          easing: 'ease-in-out',
          transform: moved(0, 0, -14, 0.42),
          clipPath: ball,
          filter: folded,
        },
        // Up and away...
        {
          offset: 0.55,
          easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)',
          transform: moved(0, 0, -20, 0.38),
          clipPath: ball,
          filter: folded,
        },
        // ...then falling out past the bottom right corner, spinning.
        {
          offset: 0.7,
          easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)',
          transform: moved(width * 0.18, height * -0.14, 70, 0.36),
          clipPath: ball,
          filter: folded,
        },
        {
          offset: 1,
          transform: moved(width * 0.8, height * 1.1, 250, 0.3),
          clipPath: ball,
          filter: folded,
        },
      ],
    },
  ];
}

export const REVEALS: readonly Reveal[] = [
  {
    name: 'corner',
    duration: DURATION_MS,
    layers: (viewport) => circleFrom({ x: 0, y: 0 }, viewport),
  },
  {
    name: 'center',
    duration: DURATION_MS,
    layers: (viewport) => circleFrom({ x: viewport.width / 2, y: viewport.height / 2 }, viewport),
  },
  {
    name: 'page',
    duration: DURATION_MS,
    // The new page slides in from the right edge, casting a soft shadow on the
    // old one, which draws back a little and dims as it is covered.
    layers: () => [
      {
        pseudoElement: NEW,
        keyframes: [
          { transform: 'translateX(100%)', boxShadow: '-1.5rem 0 3rem rgb(0 0 0 / 0.18)' },
          { transform: 'translateX(0%)', boxShadow: '-1.5rem 0 3rem rgb(0 0 0 / 0.18)' },
        ],
      },
      {
        pseudoElement: OLD,
        keyframes: [
          { transform: 'translateX(0%)', filter: 'brightness(1)' },
          { transform: 'translateX(-30%)', filter: 'brightness(0.8)' },
        ],
      },
    ],
  },
  {
    name: 'doors',
    duration: DURATION_MS,
    layers: () => insetFrom('0% 50% 0% 50%'),
  },
  {
    name: 'curtain',
    duration: DURATION_MS,
    layers: () => insetFrom('0% 0% 100% 0%'),
  },
  {
    name: 'button',
    duration: DURATION_MS,
    needsOrigin: true,
    // The button lives at the top right, which is also where the circle starts
    // if it is ever asked for without being told.
    layers: (viewport, origin) => circleFrom(origin ?? { x: viewport.width, y: 0 }, viewport),
  },
  {
    name: 'crumple',
    duration: 1000,
    layers: crumple,
  },
];

interface PickOptions {
  /** The reveal played last time, which is left out so none plays twice in a row. */
  previous?: RevealName;
  /** Where the theme button is. Without it the button circle is left out. */
  origin?: Point;
  random?: () => number;
}

export function pickReveal({ previous, origin, random = Math.random }: PickOptions = {}): Reveal {
  const choices = REVEALS.filter(
    (reveal) => reveal.name !== previous && (origin !== undefined || !reveal.needsOrigin),
  );
  return choices[Math.floor(random() * choices.length)];
}
