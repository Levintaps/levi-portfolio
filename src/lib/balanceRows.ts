import type { SkillGroup } from '../data/types';

// A skill shows as a pill: its text plus roughly this many characters' worth
// of padding, border and the gap after it.
const PILL_OVERHEAD = 4;

/** How much horizontal room a group takes up, in character widths. */
export function groupWeight(group: SkillGroup): number {
  return group.items.reduce((sum, item) => sum + item.length + PILL_OVERHEAD, 0);
}

/**
 * Splits groups across a number of rows so the rows come out as close to the
 * same length as possible, keeping every group whole and in its original
 * order. There are only ever a handful of groups, so every arrangement is
 * tried and the most even one kept.
 */
export function balanceRows(groups: SkillGroup[], count: number): SkillGroup[][] {
  const weights = groups.map(groupWeight);
  const assignment = groups.map(() => 0);
  const totals = new Array<number>(count).fill(0);
  let best = [...assignment];
  let bestSpread = Number.POSITIVE_INFINITY;

  function place(index: number) {
    if (index === groups.length) {
      const spread = Math.max(...totals) - Math.min(...totals);
      if (spread < bestSpread) {
        bestSpread = spread;
        best = [...assignment];
      }
      return;
    }

    for (let row = 0; row < count; row += 1) {
      assignment[index] = row;
      totals[row] += weights[index];
      place(index + 1);
      totals[row] -= weights[index];
    }
  }

  place(0);

  return Array.from({ length: count }, (_, row) =>
    groups.filter((_, index) => best[index] === row),
  );
}
