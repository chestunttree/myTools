import * as vscode from 'vscode';

/** 当前vscode上下文获取、设置 这里控制需要在特定条件下才展示的命令 */

/** 展示　codeLens.start 命令 */
export const showCodeLensStartCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandStart', true);
};
/**　隐藏　codeLens.start 命令 */
export const hideCodeLensStartCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandStart', false);
};

/** 展示　codeLens.Check 命令 */
export const showCodeLensCheckCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandCheck', true);
};
/**　隐藏　codeLens.Check 命令 */
export const hideCodeLensCheckCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandCheck', false);
};

/** 展示　codeLens.close 命令 */
export const showCodeLensCloseCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandClose', true);
};
/**　隐藏　codeLens.close 命令 */
export const hideCodeLensCloseCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'codeLensCommandClose', false);
};

/** 展示　i18nTools.close 命令 */
export const showI18nCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'i18nCommandClose', true);
};
/**　隐藏　i18nTools.close 命令 */
export const hideI18nCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'i18nCommandClose', false);
};

/** 展示　i18nTools.refresh 命令 */
export const showI18nRefreshCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'i18nCommandRefresh', true);
};
/**　隐藏　i18nTools.refresh 命令 */
export const hideI18nRefreshCommandDispose = () => {
  vscode.commands.executeCommand('setContext', 'i18nCommandRefresh', false);
};

