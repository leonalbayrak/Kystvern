export function fmt1(x?: number): string {
  return x !== undefined ? x.toFixed(1) : '—'
}
