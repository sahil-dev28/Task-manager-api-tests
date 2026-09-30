/**
 * Returns one page from a list.
 *
 * BUG-01: the offset was `page * limit`, which skipped a page and made page 1
 * impossible to fetch. Pages start at 1, so page 1 starts at index 0.
 *
 * Takes a plain array and no Express or store types, so it can also page a
 * filtered list. The BUG-06 fix needs that.
 */
export const paginate = <T>(items: T[], page: number, limit: number): T[] => {
	const offset = Math.max(0, (page - 1) * limit);
	return items.slice(offset, offset + limit);
};
