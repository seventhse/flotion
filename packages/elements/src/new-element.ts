import { DEFAULT_ELEMENT } from "./constant";
import { FlotionElement, NonDeleted } from "./interface";
import { randomId, randomInteger } from "./utils";

function newElementImpl<T extends FlotionElement>(opts: Partial<T> & { type: T['type'] }): NonDeleted<T> {
  const {
    id = randomId(),
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    seed = randomInteger(),
    isDeleted = false,
    locked = false,
    opacity = DEFAULT_ELEMENT.opacity,
    angle = DEFAULT_ELEMENT.angle,
    fillStyle = DEFAULT_ELEMENT.fillStyle,
    backgroundColor = DEFAULT_ELEMENT.backgroundColor,
    strokeColor = DEFAULT_ELEMENT.strokeColor,
    strokeWidth = DEFAULT_ELEMENT.strokeWidth,
    strokeStyle = DEFAULT_ELEMENT.strokeStyle,
    roughness = DEFAULT_ELEMENT.roughness,
    type,
    ...rest
  } = opts

  return {
    id,
    type,
    x,
    y,
    width,
    height,
    seed,
    isDeleted,
    locked,
    opacity,
    angle,
    fillStyle,
    backgroundColor,
    strokeColor,
    strokeWidth,
    strokeStyle,
    roughness,
    version: rest.version || 1,
    ...rest
  } as NonDeleted<T>
}

/**
 * 创建一个新的图形元素
 * @param type 元素类型
 * @param config 元素配置参数
 * @returns 创建的非删除状态的元素实例
 */
export function newElement<T extends FlotionElement = FlotionElement>(
  type: T['type'],
  config?: Partial<Omit<T, 'type'>>
): NonDeleted<T> {
  return newElementImpl<T>({
    type,
    ...(config as Partial<T>)
  })
}

