// Positions from the register are ordered. Only join adjacent positions so a
// synchronized invoice between two unconfirmed positions remains visible as a gap.
export function gstPositionRanges(positions: readonly number[]): string {
  const ranges: string[] = [];
  for (let i = 0; i < positions.length; i++) {
    const first = positions[i];
    while (i + 1 < positions.length && positions[i + 1] === positions[i] + 1) i++;
    ranges.push(first === positions[i] ? String(first) : `${first}–${positions[i]}`);
  }
  return ranges.join(', ');
}
