export type Data<T = unknown, K extends string = string> = Record<K, T>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Fn<P extends any[] = any[], R = any> = (...args: P) => R

export type Arrayable<T> = T | T[]

export type Awaitable<T> = T | Promise<T>
