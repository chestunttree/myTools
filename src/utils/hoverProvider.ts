import * as vscode from 'vscode';


/**
 * 解析出i18nOptionsCatch code对应的 文本、链接(不同模式) 
 * @param code 要被解析的code
 * @param i18nOptionsCatch
 * @returns 解析后的文本 链接 对应模式
 */
export function transformI18nCodeText(code: string, i18nOptionsCatch:Map<string, {content: any, path:string, modeName: string}>){
    const codes = code.split('.');
    const codeTextList: [string, string, string][]= [];
    i18nOptionsCatch.forEach((item, key) => {
        const codeText = codes.reduce((result, k) => {    
            return result[k];
        }, item.content);
        const fileLink = `[修改](/${key})`;
        codeTextList.push([codeText as string, fileLink, item.modeName]);
    });
    return codeTextList;
}

export function TooltipMarkdown(codeTextList: ReturnType<typeof transformI18nCodeText>) {
    return codeTextList.map(([codeText,fileLink])=>new vscode.MarkdownString(`<font size=2>${codeText}</font> <font color=#0000ff size=1>${fileLink}</font>`));
}

export function createHover(i8nCode:string, i18nOptionsCatch:Map<string, any>) {
    return new vscode.Hover([
        // new vscode.MarkdownString('### 国际化 '),
        ...TooltipMarkdown(transformI18nCodeText(i8nCode, i18nOptionsCatch))
    ]);
}