import { useMemo, useRef } from "react";
import { pick } from "../object";
import { isFunction } from "lodash-es";
import { shallowEqual } from "../equal";

// 工具函数不变
export function useContextValue<T extends object>(
  value: T,
  deps: undefined
): T;
export function useContextValue<T extends object, K extends keyof T>(
  value: T,
  deps: K
): T[K];
export function useContextValue<T extends object, K extends keyof T>(
  value: T,
  deps: K[]
): Pick<T, K>;
export function useContextValue<T extends object, K extends keyof T>(
  value: T,
  deps?: K | K[]
): any {
  const keys = Array.isArray(deps) ? deps : deps !== undefined ? [deps] : [];
  const prev = useRef<T | T[K] | Pick<T, K>>(undefined);

  return useMemo(() => {
    if (keys.length === 0) {
      return value;
    }
    if (keys.length === 1) {
      const current = value[keys[0]];
      if (prev.current !== current) {
        prev.current = current;
      }
      return prev.current;
    }
    const current = pick(value, keys);
    if (!shallowEqual(prev.current, current)) {
      prev.current = current;
    }
    return prev.current;
  }, [value, ...keys.map((key) => value[key])]);
}

export function createUseContextValue<T extends object>(fn: T | (() => T)) {
  return function <K extends keyof T = keyof T>(deps?: K | K[]) {
    const value = isFunction(fn) ? fn() : fn;
    return useContextValue<T, K>(value, deps);
  };
}