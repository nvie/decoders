export type CellResult =
  | { status: 'accepted'; value: string }
  | { status: 'rejected'; error: string };

export type Mode = 'verify' | 'value';
export type Fmt = 'formatShort' | 'formatInline';

export function formatValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (value instanceof URL) return `URL { href: ${JSON.stringify(value.href)} }`;
  if (value instanceof Date) return `Date { ${JSON.stringify(value.toISOString())} }`;
  if (value instanceof Error)
    return `${value.constructor.name} { ${JSON.stringify(value.message)} }`;
  if (value instanceof Set)
    return `Set(${value.size}) { ${[...value].map(formatValue).join(', ')} }`;
  if (value instanceof Map)
    return `Map(${value.size}) { ${[...value].map(([k, v]) => `${formatValue(k)} => ${formatValue(v)}`).join(', ')} }`;
  try {
    if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
    return JSON.stringify(value, null, 2).replace(/\n\s*/g, ' ');
  } catch {
    return String(value);
  }
}
