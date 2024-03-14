export type PickPromiseReturn<P> = P extends Promise<infer T> ? T : P;

export type NotUndefined<T> = T extends undefined ? never : T;