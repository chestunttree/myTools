import * as vscode from 'vscode';
import apiName from './apiName';
import { isArray } from '../command/i18n';
import { transformI18nCodeToMarkdown } from './hoverProvider';
import { i18nOptionsCatch } from './i18nOptionsCatch';

export class CodeInlayHints implements vscode.InlayHintsProvider {
  constructor(public i18nOptionsCatch: Map<string, any>){ }
  provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
    let result: vscode.InlayHint[] = [];
    let { i18nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
    for (let i = range.start.line; i < range.end.line; i++){
        let line = document.lineAt(i);
        if (line.text.includes('=')) {
            result.push({
                label: 'Inlay Hint',
                position: line.range.end,
                kind: vscode.InlayHintKind.Parameter,
            });
        }
        const currentPosition = new vscode.Position(i, range.end.line);
        const apiRange = document.getWordRangeAtPosition(currentPosition, i18nApiNameRegExp);
        if(apiRange) {
          const text = document.getText(apiRange);
          let [i18nCode, i8nApiName] = text.replace(i18nCodeRegExp, '$2|$1').split('|');
          const apiNameCheck = i18nApiName?.find((i) => isArray(i) && i8nApiName === i[0].replaceAll('/', ''));
          if (apiNameCheck) i18nCode = `${apiNameCheck[1]}.${i18nCode}`;
          const toolsMkd = transformI18nCodeToMarkdown(i18nCode, i18nOptionsCatch);
          console.log(toolsMkd);
        }
    };
    return result;
  }
}