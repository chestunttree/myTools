import * as vscode from 'vscode';
import getCodesLine from './fileLoad';
export function transformI18nCodeToMarkdown(code: string, i18nOptionsCatch:Map<string, any>) {
    const codes = code.split('.');
    const markdownArr: vscode.MarkdownString[] = [];
    i18nOptionsCatch.forEach((item, key) => {
        const codeText = codes.reduce((result, key) => {
            return result[key];
        }, item.content);
        const fileLink = `[修改](/${key})`;
        const codeLineCount = getCodesLine(codes, item.path);
        console.log(codeLineCount)
        markdownArr.push(new vscode.MarkdownString(`<font size=2>${codeText}</font> <font color=#0000ff size=1>${fileLink}</font>`));
    });
    return markdownArr;
}

export function createHover(i8nCode:string, i18nOptionsCatch:Map<string, any>) {
    return new vscode.Hover([
        // new vscode.MarkdownString('### 国际化 '),
        ...transformI18nCodeToMarkdown(i8nCode, i18nOptionsCatch)
    ]);
}