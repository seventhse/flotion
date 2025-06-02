export type Data<T = unknown, K extends string = string> = Record<K, T>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Fn<P extends any[] = any[], R = any> = (...args: P) => R

export type Arrayable<T> = T | T[]

export type Awaitable<T> = T | Promise<T>

export type SameType<T, U> = T extends U ? (U extends T ? true : false) : false;

export type Assert<T extends true> = T;

export type MarkOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Merge<M, N> = Omit<M, keyof N> & N;

export type MakeBrand<T extends string> = {
  /** @private using ~ to sort last in intellisense */
  [K in `~brand~${T}`]: T;
};

export type MarkNonNullable<T, K extends keyof T> = {
  [P in K]-?: P extends K ? NonNullable<T[P]> : T[P]
} & { [P in keyof T]: T[P] }


export type LocalPoint = [x: number, y: number] & {
  _brand: "flotion__localPoint";
};