import * as vscode from 'vscode';
export default function(){
    	/**获取 i18n方法名 */
	const i18nApiName = vscode.workspace.getConfiguration('mytools.i18nTools').get<string[]>('apiName');

	const i8nCodeRegExp = new RegExp(`(${i18nApiName?.join('|')})\\(['|"](.*?)['|"]\\)`, 'g');
	const i18nApiNameRegExp = new RegExp(`(${i18nApiName?.join('|')})\\('.*?'\\)`,'g');

    return {
        i18nApiName,
        i8nCodeRegExp,
        i18nApiNameRegExp,
    }
}