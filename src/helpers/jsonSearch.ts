/**
 * Depth-first walk over a JSON-like value. Returns dot-paths of every leaf
 * whose value matches `predicate`. Arrays are addressed as `key[i]`.
 */
export function findLeafPaths(
  value: unknown,
  predicate: (leaf: unknown) => boolean,
  path = '',
): string[] {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findLeafPaths(item, predicate, `${path}[${i}]`));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      findLeafPaths(child, predicate, path ? `${path}.${key}` : key),
    );
  }

  return predicate(value) ? [path] : [];
}

/**
 * Paths of every string leaf equal to `address`.
 */
export function findAddressPaths(payload: unknown, address: string): string[] {
  const isHex = /^0x[0-9a-f]+$/i.test(address);
  const target = isHex ? address.toLowerCase() : address;

  return findLeafPaths(payload, (leaf) => {
    if (typeof leaf !== 'string') return false;
    return isHex ? leaf.toLowerCase() === target : leaf === target;
  });
}
