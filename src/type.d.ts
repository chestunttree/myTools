export type PickPromiseReturn<P> = P extends Promise<infer T> ? T : P;

export type NotUndefined<T> = T extends undefined ? never : T;

export type ModuleContext = {
    exports: any,
    require: NodeRequire,
    module: { exports: any },
}

declare class CodeInlayHints {
    constructor(i18nOptionsCatch: number);
}

export type SelectCodeLensModeItem = {
    code: string;
    link: string;
}

export interface SelectCommandItem {
    command: string
    rule?: string
    remark?: string
    /** 分类用的图标 */
    groupIcon?: string
    /** 分割线 */
    divider?: boolean
}

/**　extension.packageJSON.contributes 类型 */
export namespace Contributes {
    /**　packageJSON中的command */
    type commands<T extends object = {}> = T & {
        command: string,
        title: string,
    }
}