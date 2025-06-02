

export function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false
    }
    if (!Object.is(a[key], b[key])) {
      return false
    }
  }

  return true
}

function _defaultIsShallowComparatorFallback(a: any, b: any): boolean {
  // consider two empty arrays equal
  if (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === 0 &&
    b.length === 0
  ) {
    return true;
  }
  return a === b;
};

export function isShallowEqual<
  T extends Record<string, any>,
  K extends readonly unknown[],
>(
  objA: T,
  objB: T,
  comparators?:
    | { [key in keyof T]?: (a: T[key], b: T[key]) => boolean }
    | (keyof T extends K[number]
      ? K extends readonly (keyof T)[]
      ? K
      : {
        _error: "keys are either missing or include keys not in compared obj";
      }
      : {
        _error: "keys are either missing or include keys not in compared obj";
      }),
  debug = false,
) {
  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  if (aKeys.length !== bKeys.length) {
    if (debug) {
      console.warn(
        `%cisShallowEqual: objects don't have same properties ->`,
        "color: #8B4000",
        objA,
        objB,
      );
    }
    return false;
  }

  if (comparators && Array.isArray(comparators)) {
    for (const key of comparators) {
      const ret =
        objA[key] === objB[key] ||
        _defaultIsShallowComparatorFallback(objA[key], objB[key]);
      if (!ret) {
        if (debug) {
          console.warn(
            `%cisShallowEqual: ${key} not equal ->`,
            "color: #8B4000",
            objA[key],
            objB[key],
          );
        }
        return false;
      }
    }
    return true;
  }

  return aKeys.every((key) => {
    const comparator = (
      comparators as { [key in keyof T]?: (a: T[key], b: T[key]) => boolean }
    )?.[key as keyof T];
    const ret = comparator
      ? comparator(objA[key], objB[key])
      : objA[key] === objB[key] ||
      _defaultIsShallowComparatorFallback(objA[key], objB[key]);

    if (!ret && debug) {
      console.warn(
        `%cisShallowEqual: ${key} not equal ->`,
        "color: #8B4000",
        objA[key],
        objB[key],
      );
    }
    return ret;
  });
}