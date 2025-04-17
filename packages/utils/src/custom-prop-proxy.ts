export const createCustomPropProxy = <T, Custom extends Record<string | symbol, unknown>>(
  value: T,
  customProp?: Custom
): T & Custom => {
  const isPrimitive = typeof value !== "object" && typeof value !== "function"
  return new Proxy(Object(value), {
    get(target, prop, receiver) {
      if (customProp && prop in customProp) {
        return customProp[prop]
      }
      const result = Reflect.get(target, prop, receiver)

      // 如果是原始类型，直接返回原始值
      if (isPrimitive) {
        return typeof result === "function"
          ? result.bind(target) // 绑定方法的 this
          : value
      }

      return result
    },
    // 确保其他操作都能正常进行
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver)
    },
    has(target, prop) {
      return Reflect.has(target, prop)
    },
    deleteProperty(target, prop) {
      return Reflect.deleteProperty(target, prop)
    },
    ownKeys(target) {
      return Reflect.ownKeys(target)
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop)
    },
    defineProperty(target, prop, attributes) {
      return Reflect.defineProperty(target, prop, attributes)
    }
  }) as T & Custom
}
