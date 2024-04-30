export type PickPromiseReturn<P> = P extends Promise<infer T> ? T : P;

export type NotUndefined<T> = T extends undefined ? never : T;

export type ModuleContext = { 
    exports: any,
    require: NodeRequire,
    module: { exports: any },
}

declare class CodeInlayHints {
    constructor(i18nOptionsCatch:number);
}