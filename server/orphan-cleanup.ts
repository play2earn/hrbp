export function collectReferencedR2Keys(value: unknown, publicDomain?: string): Set<string> {
  const keys = new Set<string>();
  const normalizedDomain = String(publicDomain || '').replace(/\/$/, '');
  if (!normalizedDomain) return keys;
  const prefix = `${normalizedDomain}/`;

  const visit = (item: unknown): void => {
    if (typeof item === 'string') {
      if (item.startsWith(prefix)) {
        const key = item.slice(prefix.length).split(/[?#]/, 1)[0];
        if (key) {
          try {
            keys.add(decodeURIComponent(key));
          } catch {
            keys.add(key);
          }
        }
      }
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (item && typeof item === 'object') Object.values(item).forEach(visit);
  };

  visit(value);
  return keys;
}
