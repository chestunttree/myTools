import * as vscode from 'vscode';


export function transformI18nCodeText(code: string, i18nOptionsCatch:Map<string, any>){
    const codes = code.split('.');
    const codeTextList: [string, string][]= [];
    i18nOptionsCatch.forEach((item, key) => {
        const codeText = codes.reduce((result, key) => {    
            return result[key];
        }, item.content);
        const fileLink = `[修改](/${key})`;
        codeTextList.push([codeText as string,fileLink]);
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