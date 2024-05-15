import type {QuickPickItem} from 'vscode'
import { CommandPick } from './utils/enum';

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

/** select pick 选项 */
interface SelectCommandItemBase {
    rule?: string
    remark?: string
    /** 分类用的图标 */
    groupIcon?: string
    /** 分割线 */
}
interface commandItemPick { type: CommandPick.commandItem, command: string, rule: string }
interface DividerItemPick { type: CommandPick.divider }
interface ModeItemPick {
    type: CommandPick.modeItem,
    options: () => Promise<QuickPickItem[]>
}
export type SelectCommandItem = commandItemPick | DividerItemPick | ModeItemPick


/**　extension.packageJSON.contributes 类型 */
export namespace Contributes {
    /**　packageJSON中的command */
    type commands<T extends object = {}> = T & {
        command: string,
        title: string,
    }
}