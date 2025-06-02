export function pick<T extends object, K extends keyof T>(
  state: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = state[key];
  }
  return result;
}