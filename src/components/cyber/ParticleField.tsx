import { useEffect, useRef } from 'react';
import styles from './ParticleField.module.css';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const narrow = window.matchMedia('(max-width: 47.99rem)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (narrow || reduced) return;

    // The dots borrow the current accent token rather than a hard-coded
    // colour, so a future theme change never leaves this canvas stale.
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    if (!accentColor) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let frame = 0;
    let points: Point[] = [];

    // Arrow functions (rather than hoisted function declarations) so
    // TypeScript keeps the non-null narrowing on `canvas` and `context`.
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const density = Math.min(90, Math.round((canvas.clientWidth * canvas.clientHeight) / 22000));
      points = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.5) * 0.18 * dpr,
        r: (Math.random() * 1.2 + 0.4) * dpr,
      }));
    };

    const draw = () => {
      // Resizing the canvas resets its 2D context state, so the fill
      // style and alpha are reapplied on every frame rather than once.
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = accentColor;
      context.globalAlpha = 0.55;

      for (const point of points) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        context.beginPath();
        context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
