import * as vscode from 'vscode';
import path from 'path';
import { createHover } from './hoverProvider';
import { ayncReadFile } from './fileLoad';


export const languages = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'];
export function i18nInit(context: vscode.ExtensionContext) {

}

export function isObj(target: any) {
	return Object.prototype.toString.call(target) === '[object Object]';
}
export function isArray(target: any) {
	return Object.prototype.toString.call(target) === '[object Array]';
}
