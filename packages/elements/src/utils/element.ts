import { nanoid } from "nanoid"
import { Random } from "roughjs/bin/math"

let random = new Random(Date.now())

export const randomInteger = () => Math.floor(random.next() * 2 ** 31)

export const reseed = (seed: number) => {
  random = new Random(seed)
}

export const randomId = () => nanoid()


export function arrayToMap<T extends { id: string } | string>(items: T[] | Map<string, T>) {
  if (items instanceof Map) {
    return items
  }

  return items.reduce((acc: Map<string, T>, element) => {
    acc.set(typeof element === 'string' ? element : element.id, element)
    return acc
  }, new Map())
}