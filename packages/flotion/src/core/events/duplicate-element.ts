import {  bumpVersion, FlotionElement, FlotionElementsMap, randomId, randomInteger } from "@llm-flow/elements";
import { safeArray } from "@llm-flow/utils";
import { cloneDeep, findLastIndex } from "lodash-es";


export function duplicateElement<TElement extends FlotionElement>(
  element: TElement,
  overrides?: Partial<TElement>,
  randomizeSeed?: boolean
) {
  let copy = cloneDeep(element)

  copy.id = randomId()

  if (randomizeSeed) {
    copy.seed = randomInteger()
    bumpVersion(copy)
  }

  if (overrides) {
    copy = Object.assign(copy, overrides)
  }
  return copy
}

export function duplicateElements(opts: {
  elements: FlotionElement[],
  randomizeSeed?: boolean,
  overrides?: (originalElement: FlotionElement) => Partial<FlotionElement>
} & (
    { type: 'everything' } | { type: 'in-place', idsOfElementsToDuplicate: FlotionElementsMap, reverseOrder: boolean }
  )) {
  let { elements } = opts

  const isInPlace = opts.type === 'in-place'

  const reverseOrder = isInPlace ? opts.reverseOrder : false

  const processedIds = new Map<FlotionElement['id'], true>()
  const newElements: FlotionElement[] = []
  const oldElements: FlotionElement[] = []
  const oldIdToDuplicatedId = new Map()
  const duplicatedElementsMap = new Map<string, FlotionElement>()
  const _idsOfElementsToDuplicate = isInPlace ? opts.idsOfElementsToDuplicate : new Map(elements.map(el => [el.id, el]))

  const elementsWithClones: FlotionElement[] = elements.slice()

  const copyElements = <T extends FlotionElement | FlotionElement[]>(
    element: T,
  ): T extends FlotionElement[]
    ? FlotionElement[]
    : FlotionElement | null => {
    const elements = safeArray(element);

    const _newElements = elements.reduce(
      (acc: FlotionElement[], element) => {
        if (processedIds.has(element.id)) {
          return acc;
        }

        processedIds.set(element.id, true);

        const newElement = duplicateElement(
          element,
          opts.overrides?.(element),
          opts.randomizeSeed,
        );

        processedIds.set(newElement.id, true);

        duplicatedElementsMap.set(newElement.id, newElement);
        oldIdToDuplicatedId.set(element.id, newElement.id);

        oldElements.push(element);
        newElements.push(newElement);

        acc.push(newElement);
        return acc;
      },
      [],
    );

    return (
      Array.isArray(element) ? _newElements : _newElements[0] || null
    ) as T extends FlotionElement[]
      ? FlotionElement[]
      : FlotionElement | null;
  };

  const insertBeforeOrAfterIndex = (
    index: number,
    elements: FlotionElement | null | FlotionElement[],
  ) => {
    if (!elements) {
      return;
    }

    if (reverseOrder && index < 1) {
      elementsWithClones.unshift(...safeArray(elements));
      return;
    }

    if (!reverseOrder && index > elementsWithClones.length - 1) {
      elementsWithClones.push(...safeArray(elements));
      return;
    }

    elementsWithClones.splice(
      index + (reverseOrder ? 0 : 1),
      0,
      ...safeArray(elements),
    );
  };

  for (const element of elements) {
    if (processedIds.has(element.id)) {
      continue
    }

    if (!_idsOfElementsToDuplicate.has(element.id)) {
      continue
    }

    insertBeforeOrAfterIndex(
      findLastIndex(elementsWithClones, (el) => el.id === element.id),
      copyElements(element)
    )
  }

  return {
    newElements,
    elementsWithClones
  }
}