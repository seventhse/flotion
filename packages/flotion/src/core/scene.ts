import {
  FlotionElement,
  FlotionElements,
  FlotionElementsMap,
  isNonDeletedElement,
  NonDeleted,
  NonDeletedFlotionElement,
  NonDeletedFlotionElementsMap,
  ElementsMapOrArray,
  randomInteger
} from "@llm-flow/elements";
import { isString } from "lodash-es";
import { getNonDeletedElements, getSelectedElements } from "./scene-helper";
import { FlotionAppState } from "./interface";

export class Scene {
  private static sceneMapByElement = new WeakMap<FlotionElement, Scene>()
  private static sceneMapById = new Map<string, Scene>()

  static mapElementToScene(elementKey: FlotionElement | FlotionElement['id'], scene: Scene) {
    if (isString(elementKey)) {
      this.sceneMapById.set(elementKey, scene)
    } else {
      this.sceneMapByElement.set(elementKey, scene)
      this.sceneMapById.set(elementKey.id, scene)
    }
  }

  private elements: FlotionElements = []
  private nonDeletedElements: NonDeletedFlotionElement[] = []
  private elementsMap: FlotionElementsMap = new Map()
  private nonDeletedElementsMap: NonDeletedFlotionElementsMap = new Map()

  private selectedElementsCache: {
    selectedIds: FlotionAppState['selectedElementIds'] | null
    elements: ElementsMapOrArray | null
    cache: Map<string, NonDeletedFlotionElement[]>
  } = {
      elements: null,
      selectedIds: null,
      cache: new Map()
    }

  private callbacks: Set<() => void> = new Set()
  private sceneNonce: number | undefined

  getSceneNonce() {
    return this.sceneNonce
  }


  getElements() {
    return this.elements
  }
  getNonDeletedElements() {
    return this.nonDeletedElements
  }
  getElementsMap() {
    return this.elementsMap
  }
  getNonDeletedElementsMap() {
    return this.nonDeletedElementsMap
  }


  getElement<T extends FlotionElement>(id: T['id']): T | null {
    return (this.elementsMap.get(id) as T | undefined) || null
  }
  getNonDeletedElement(id: FlotionElement['id']): NonDeleted<FlotionElement> | null {
    const element = this.getElement(id)
    if (element && isNonDeletedElement(element)) {
      return element
    }
    return null
  }


  getSelectedElements(opts: {
    selectedIds: FlotionAppState['selectedElementIds'],
    elements?: ElementsMapOrArray
  }) {
    const hash = `hash:${opts.selectedIds?.length ? opts.selectedIds.length : 0}-${opts.elements ? '1' : '0'}`
    const elements = opts?.elements || this.nonDeletedElements

    if (this.selectedElementsCache.elements === elements && this.selectedElementsCache.selectedIds === opts.selectedIds) {
      const cached = this.selectedElementsCache.cache.get(hash)
      if (cached) {
        return cached
      }
    } else if (opts?.elements === undefined) {
      this.selectedElementsCache.cache.clear()
    }

    const selectedElements = getSelectedElements(elements, opts.selectedIds)

    if (opts?.elements === undefined) {
      this.selectedElementsCache.selectedIds = opts.selectedIds
      this.selectedElementsCache.elements = this.nonDeletedElements
      this.selectedElementsCache.cache.set(hash, selectedElements)
    }

    return selectedElements
  }


  triggerUpdate() {
    this.sceneNonce = randomInteger()

    for (const callback of Array.from(this.callbacks)) {
      callback()
    }
  }

  onUpdate(cb: () => void): () => void {
    if (this.callbacks.has(cb)) {
      throw new Error('Exist same callback')
    }

    this.callbacks.add(cb)

    return () => {
      if (!this.callbacks.has(cb)) {
        throw new Error('Cannot remove callback, it is not exist.')
      }
      this.callbacks.delete(cb)
    }
  }

  replaceAllElements(nextElements: FlotionElements | FlotionElementsMap) {
    const _nextElements = nextElements instanceof Array ? nextElements : Array.from(nextElements.values())

    this.elements = _nextElements
    this.elementsMap.clear()
    _nextElements.forEach(element => {
      this.elementsMap.set(element.id, element)
      Scene.mapElementToScene(element, this)
    })
    const nonDeletedElements = getNonDeletedElements(_nextElements)
    this.nonDeletedElements = nonDeletedElements.elements
    this.nonDeletedElementsMap = nonDeletedElements.elementsMap

    this.triggerUpdate()
  }

  mapElements(iteratee: (element: FlotionElement) => FlotionElement) {
    let didChange = false
    const newElements = this.elements.map(element => {
      const nextElement = iteratee(element)
      if (nextElement !== element) {
        didChange = true
      }
      return nextElement
    })
    if (didChange) {
      this.replaceAllElements(newElements)
    }
    return didChange
  }

  insertElementAtIndex(element: FlotionElement, index: number) {
    if (!Number.isFinite(index) || index < 0) {
      throw new Error("[insertElementAtIndex] can only be called with index >= 0")
    }

    const _nextElements = [
      ...this.elements.slice(0, index),
      element,
      ...this.elements.slice(index)
    ]

    this.replaceAllElements(_nextElements)
  }

  insertElementsAtIndex(elements: FlotionElement[], index: number) {
    if (elements.length) {
      return
    }

    if (!Number.isFinite(index) || index < 0) {
      throw new Error("[insertElementsAtIndex] can only be called with index >= 0")
    }

    const _nextElements = [
      ...this.elements.slice(0, index),
      ...elements,
      ...this.elements.slice(index)
    ]

    this.replaceAllElements(_nextElements)
  }

  insertElement(element: FlotionElement) {
    const index = this.elements.length

    this.insertElementAtIndex(element, index)
  }

  insertElements(elements: FlotionElement[]) {
    if (!elements.length) {
      return
    }

    this.insertElementsAtIndex(elements, this.elements.length)
  }


  destroy() {
    this.elements = []
    this.nonDeletedElements = []
    this.elementsMap.clear()
    this.nonDeletedElementsMap.clear()
    Scene.sceneMapById.forEach((scene, elementKey) => {
      if (scene === this) {
        Scene.sceneMapById.delete(elementKey)
      }
    })

    this.callbacks.clear()
  }
}
