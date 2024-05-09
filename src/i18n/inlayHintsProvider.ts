import * as vscode from 'vscode';
import { isArray } from '../command/i18n';
import { i18nOptionsCatch } from './i18nOptionsCatch';
import apiName from '../utils/apiName';
import { TooltipMarkdown, transformI18nCodeText } from '../utils/hoverProvider';

export class CodeInlayHints implements vscode.InlayHintsProvider {
  constructor(public _i18nOptionsCatch: Map<string, any>) { }
  provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
    let result: vscode.InlayHint[] = [];
    let { i18nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
    for (let i = range.start.line; i < range.end.line; i++) {
      let line = document.lineAt(i);
      /** 排除空白行 */
      if (line.isEmptyOrWhitespace) continue;
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
          const currentRange = document.getWordRangeAtPosition(itemP, i18nApiNameRegExp);
          if (!currentRange) return result;
          return [...result, {
            /** 将文本插入到括号内 */
            range: currentRange.with(undefined, new vscode.Position(itemP.line, currentRange.end.character-1)),
            text: checkApiStr[index]
          }];
        }, []);

      apiItem.forEach(({ range, text }) => {
        let [i18nCode, i8nApiName] = text.replace(i18nCodeRegExp, '$2|$1').split('|');
        const apiNameCheck = i18nApiName?.find((i) => isArray(i) && i8nApiName === i[0].replaceAll('/', ''));
        if (apiNameCheck) i18nCode = `${apiNameCheck[1]}.${i18nCode}`;
        const codeTextList = transformI18nCodeText(i18nCode, i18nOptionsCatch);
        const toolsMkd = TooltipMarkdown(codeTextList);
        result.push({
          // label: codeTextList[0][0],
          label: codeTextList.map(([txt])=>txt).join(','),
          position: range.end,
          kind: vscode.InlayHintKind.Parameter,
          // tooltip: toolsMkd[0]
        });
      });
    };
    return result;
  }
}