import type { ComponentType } from 'react';

export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  /** A flat strap colour. When set, the sample strap texture is not drawn. */
  bandColor?: string | null;
  maxDpr?: number;
  eventSource?: { current: HTMLElement | null } | HTMLElement | null;
}

declare const Lanyard: ComponentType<LanyardProps>;
export default Lanyard;
