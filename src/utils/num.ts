const MISSING = '\u2014'

export function fmt1(x?: number | null): string {
  if (typeof x !== 'number') {
    return MISSING
  }
  if (!Number.isFinite(x)) {
    return MISSING
  }
  return x.toFixed(1)
}

