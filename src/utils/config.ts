import { ExtensionMode } from "vscode";

/** 可兼容文件后缀 */
export const fileExtensions = [
    'js', 'ts', 'josn',
];
/** 是否是开发模式 */
export const isDevMode = (mode:ExtensionMode) => mode === ExtensionMode.Development;