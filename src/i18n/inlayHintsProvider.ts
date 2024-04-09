import * as vscode from 'vscode';
import apiName from './apiName';
import { isArray } from '../command/i18n';
import { transformI18nCodeToMarkdown } from './hoverProvider';
import { i18nOptionsCatch } from './i18nOptionsCatch';

export class CodeInlayHints implements vscode.InlayHintsProvider {
  constructor(public i18nOptionsCatch: Map<string, any>) { }
  provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
    let result: vscode.InlayHint[] = [];
    let { i18nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
    for (let i = range.start.line; i < range.end.line; i++) {
      let line = document.lineAt(i);
      /** 排除空白行 */
      if (line.isEmptyOrWhitespace) continue;
      // if (line.text.includes('=')) {
      //   result.push({
      //     label: 'Inlay Hint',
      //     position: line.range.end,
      //     kind: vscode.InlayHintKind.Parameter,
      //   });
      // }
      // const currentPosition = new vscode.Position(line.lineNumber, range.end);
      // const apiRange = document.getWordRangeAtPosition(line.range.end, i18nApiNameRegExp);
      // const apiRange = document.getWordRangeAtPosition(line.range.end, i18nApiNameRegExp);
      // console.log(document.getWordRangeAtPosition(line.range.end));
      // console.log(line)
      // console.log(apiRange,line.text.match(i18nApiNameRegExp));
      const checkApiStr = line.text.match(i18nApiNameRegExp);
      if (!checkApiStr) continue;

      const codePosition = checkApiStr.map((i) => {
        const txtIndexInLine = line.text.indexOf(i);
        if (txtIndexInLine < 0) return undefined;
        return new vscode.Position(line.lineNumber, txtIndexInLine);
      });
      const apiItem = codePosition.reduce<{ range: vscode.Range, text: string }[]>(
        (result, itemP, index) => {
          if (!itemP) return result;
          const currentRange = document.getWordRangeAtPosition(itemP);
          if (!currentRange) return result;
          return [...result, {
            range: currentRange,
            text: checkApiStr[index]
          }];
        }, []);

      apiItem.forEach(({ range, text }) => {
        console.log(text)
        let [i18nCode, i8nApiName] = text.replace(i18nCodeRegExp, '$2|$1').split('|'); ``
        const apiNameCheck = i18nApiName?.find((i) => isArray(i) && i8nApiName === i[0].replaceAll('/', ''));
        if (apiNameCheck) i18nCode = `${apiNameCheck[1]}.${i18nCode}`;
        const toolsMkd = transformI18nCodeToMarkdown(i18nCode, i18nOptionsCatch);
        console.log(toolsMkd);
        result.push({
          label: toolsMkd,
          position: range.end,
          kind: vscode.InlayHintKind.Parameter,
        });
      })
      // const apiRange = 
      // const text = document.getText(apiRange);
      // console.log(apiRange,text)
    };
    return result;
  }
}