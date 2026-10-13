/** Collect every page, failing closed if a broken endpoint stops advancing. */
export async function collectPages<T extends { id: string }>(
  fetchPage: (offset: number) => Promise<{ rows: T[]; hasMore: boolean }>,
): Promise<T[]> {
  const rows: T[] = [];
  const seen = new Set<string>();
  let offset = 0;
  for (;;) {
    const page = await fetchPage(offset);
    let added = 0;
    for (const row of page.rows) {
      if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); added++; }
    }
    if (!page.hasMore) return rows;
    if (!page.rows.length || !added) throw new Error('pagination_incomplete');
    offset += page.rows.length;
  }
}
