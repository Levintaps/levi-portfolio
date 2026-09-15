export interface ColumnBox {
  /** From the left edge of the page, in pixels. */
  left: number;
  width: number;
}

export interface LanyardFrame {
  /** Where the canvas starts, from the column's own left edge: the page's left edge. */
  start: number;
  /** As wide as the page. */
  width: number;
  /** Where the badge hangs, from the canvas's left edge: over the column's middle. */
  anchorX: number;
}

/**
 * The badge's canvas spans the page from edge to edge, however wide the
 * portrait column it hangs over, so no pixel is drawn off the page and a
 * thrown badge still reaches either side.
 */
export function lanyardFrame(column: ColumnBox, pageWidth: number): LanyardFrame {
  return {
    start: -column.left,
    width: pageWidth,
    anchorX: column.left + column.width / 2,
  };
}

/**
 * The view offset that puts the middle of the scene, where the strap is
 * fixed, at `anchorX` across a canvas `canvasWidth` wide, for
 * PerspectiveCamera.setViewOffset.
 */
export function viewOffsetX(canvasWidth: number, anchorX: number): number {
  return canvasWidth / 2 - anchorX;
}
