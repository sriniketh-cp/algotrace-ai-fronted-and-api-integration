export function getVarType(val) {
  if (val === null || val === undefined) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
  if (typeof val === 'string') return 'str';
  if (typeof val === 'object') return 'dict';
  return 'unknown';
}
