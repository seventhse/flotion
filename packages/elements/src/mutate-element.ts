import { removeElementRoughCache } from "./element-cache";
import { FlotionElement } from "./interface";

export type ElementUpdate<TElement extends FlotionElement> = Omit<
  Partial<TElement>,
  "id" | "version" | "versionNonce" | "updated"
>;

export function mutateElement<TElement extends FlotionElement>(
  element: TElement,
  updates: ElementUpdate<TElement>,
  triggerUpdate: () => void,
  infomMutation = true,
  options?: {
    isDragging?: boolean
  }
): TElement {
  let didChange = false

  for (const key in updates) {
    const value = (updates as any)[key];
    if (typeof value !== "undefined") {
      if (
        (element as any)[key] === value &&
        // if object, always update because its attrs could have changed
        // (except for specific keys we handle below)
        (typeof value !== "object" ||
          value === null ||
          key === "groupIds" ||
          key === "scale")
      ) {
        continue;
      }

      if (key === "scale") {
        const prevScale = (element as any)[key];
        const nextScale = value;
        if (prevScale[0] === nextScale[0] && prevScale[1] === nextScale[1]) {
          continue;
        }
      } else if (key === "points") {
        const prevPoints = (element as any)[key];
        const nextPoints = value;
        if (prevPoints.length === nextPoints.length) {
          let didChangePoints = false;
          let index = prevPoints.length;
          while (--index) {
            const prevPoint = prevPoints[index];
            const nextPoint = nextPoints[index];
            if (
              prevPoint[0] !== nextPoint[0] ||
              prevPoint[1] !== nextPoint[1]
            ) {
              didChangePoints = true;
              break;
            }
          }
          if (!didChangePoints) {
            continue;
          }
        }
      }

      (element as any)[key] = value;
      didChange = true;
    }
  }

  if (!didChange) {
    return element
  }

  if (
    typeof updates.height !== "undefined" ||
    typeof updates.width !== "undefined"
  ) {
    removeElementRoughCache(element)
  }

  element.version++

  if (infomMutation) {
    triggerUpdate()
  }


  return element
}

export function newElementWith<TElement extends FlotionElement>(
  element: TElement,
  updates: ElementUpdate<TElement>,
  /** pass `true` to always regenerate */
  force = false,
): TElement {
  let didChange = false;
  for (const key in updates) {
    const value = (updates as any)[key];
    if (typeof value !== "undefined") {
      if (
        (element as any)[key] === value &&
        // if object, always update because its attrs could have changed
        (typeof value !== "object" || value === null)
      ) {
        continue;
      }
      didChange = true;
    }
  }

  if (!didChange && !force) {
    return element;
  }

  return {
    ...element,
    ...updates,
    version: element.version + 1,
  };
};

export function bumpVersion<T extends FlotionElement>(
  element: T,
  version?: FlotionElement["version"],
) {
  element.version = (version ?? element.version) + 1;
  return element;
};

