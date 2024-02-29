import * as vscode from 'vscode';

type ApinameItem = string | [string, string];
export default function(){
    	/**获取 i18n方法名 */
	const i18nApiName = vscode.workspace.getConfiguration('ctools.i18n').get<ApinameItem[]>('apiName');
    const i18nApiNameStrs = i18nApiName ? i18nApiName.map((item) => {
        if(Object.prototype.toString.call(item) === '[object Array]') return item[0];
        return item;
    }) : [];
    /** 从匹配到的i18n调用代码中 获取code */
	const i18nCodeRegExp = new RegExp(`(${i18nApiNameStrs?.join('|')})\\(['|"](.*?)['|"]\\)`, 'g');
    /** 匹配代码中 调用额i18n的代码段 */
	const i18nApiNameRegExp = new RegExp(`(${i18nApiNameStrs?.join('|')})\\('.*?'\\)`,'g');

    return {
        i18nApiName,
        i18nCodeRegExp,
        i18nApiNameRegExp,
    };
}