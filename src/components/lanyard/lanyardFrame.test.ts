import { lanyardFrame, viewOffsetX } from './lanyardFrame';

describe('lanyardFrame', () => {
  // A 360px portrait column starting 88px in, on a page 1265px wide.
  it('spans the canvas across the page, from its left edge, with the badge over the column', () => {
    expect(lanyardFrame({ left: 88, width: 360 }, 1265)).toEqual({
      start: -88,
      width: 1265,
      anchorX: 268,
    });
  });

  it('follows the column wherever the layout puts it', () => {
    expect(lanyardFrame({ left: 400, width: 200 }, 1000)).toEqual({
      start: -400,
      width: 1000,
      anchorX: 500,
    });
  });
});

describe('viewOffsetX', () => {
  // The camera looks at the middle of its view. Offsetting the view by the
  // gap between the canvas middle and the column puts that point over the
  // column instead.
  it('shifts the view so the middle of the scene lands over the column', () => {
    expect(viewOffsetX(1265, 268)).toBe(364.5);
  });

  it('needs no shift when the column is already in the middle', () => {
    expect(viewOffsetX(1000, 500)).toBe(0);
  });
});
