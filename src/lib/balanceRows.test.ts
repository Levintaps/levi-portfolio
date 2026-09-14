import { balanceRows, groupWeight } from './balanceRows';

const group = (name: string, ...items: string[]) => ({ name, items });

describe('balanceRows', () => {
  it('places every group in exactly one row', () => {
    const groups = [group('a', 'one'), group('b', 'two'), group('c', 'three'), group('d', 'four')];
    const rows = balanceRows(groups, 2);

    const placed = rows.flat().map((entry) => entry.name).sort();
    expect(placed).toEqual(['a', 'b', 'c', 'd']);
    expect(rows).toHaveLength(2);
  });

  it('keeps groups in their original order within a row', () => {
    const groups = [group('a', 'xxxx'), group('b', 'x'), group('c', 'xxxx'), group('d', 'x')];

    for (const row of balanceRows(groups, 2)) {
      const indexes = row.map((entry) => groups.indexOf(entry));
      expect(indexes).toEqual([...indexes].sort((x, y) => x - y));
    }
  });

  // Four single-skill groups of 10, 7, 6 and 3 characters split exactly evenly,
  // as 10 + 3 against 7 + 6, so the best answer has no difference at all.
  it('finds the most even split available', () => {
    const pad = (length: number) => 'x'.repeat(length);
    const groups = [
      group('ten', pad(10)),
      group('seven', pad(7)),
      group('six', pad(6)),
      group('three', pad(3)),
    ];

    const rows = balanceRows(groups, 2);
    const weights = rows.map((row) => row.reduce((sum, entry) => sum + groupWeight(entry), 0));

    expect(Math.abs(weights[0] - weights[1])).toBe(0);
  });

  it('returns empty rows rather than inventing groups when there are too few', () => {
    const rows = balanceRows([group('only', 'thing')], 3);
    expect(rows).toHaveLength(3);
    expect(rows.flat()).toHaveLength(1);
  });

  it('weighs a group by the length of what it shows', () => {
    expect(groupWeight(group('g', 'ab', 'cde'))).toBeGreaterThan(groupWeight(group('g', 'ab')));
  });
});
