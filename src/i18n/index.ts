import * as vscode from 'vscode';
import path from 'path';

export const languages = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'];
export function i18nInit(context: vscode.ExtensionContext) {

}

export function isObj(target: any) {
	return Object.prototype.toString.call(target) === '[object Object]';
}
export function isArray(target: any) {
	return Object.prototype.toString.call(target) === '[object Array]';
}

export async function getI18nOptionsConfiguration() {
	let config = vscode.workspace.getConfiguration('ctools.i18n');
	let options = config.get<Record<string, string>>('options');
	const validateOptions = options && isObj(options) && Object.keys(options).length > 0;
	let errorMessage = '';
	if (!Boolean(options)) { errorMessage = 'i18n 配置文件路径未设置: ctools.i18n.options'; }
	if (!isObj(options)) { errorMessage = 'ctools.i18n.option默认类型为Object: { [语言]: [配置文件路径] }'; }
	if (!(options && Object.keys(options).length > 0)) { errorMessage = 'ctools.i18n.option不能为空对象'; }
	if (!validateOptions) {
		vscode.window.showErrorMessage(errorMessage, { title: 'Open Settings' })
			.then(selection => {
				if (selection && selection.title === 'Open Settings') {
					vscode.commands.executeCommand('workbench.action.openSettings', 'ctools.i18n.options');
				}
			});
		return Promise.reject('fails');
	} else {
		return options;
	}
}