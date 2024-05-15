import * as vscode from 'vscode';

/** 当前vscode上下文获取、设置 这里控制需要在特定条件下才展示的命令 */

/** 展示　codeLens.start 命令 */
export const showCodeLensStartCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandStart', true);
};
/**　隐藏　codeLens.start 命令 */
export const hideCodeLensStartCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandStart', false);
};

/** 展示　codeLens.Check 命令 */
export const showCodeLensCheckCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandCheck', true);
};
/**　隐藏　codeLens.Check 命令 */
export const hideCodeLensCheckCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandCheck', false);
};

/** 展示　codeLens.close 命令 */
export const showCodeLensCloseCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandClose', true);
};
/**　隐藏　codeLens.close 命令 */
export const hideCodeLensCloseCommandDispose = () => {
  globalContext.setContext('ctools.codeLensCommandClose', false);
};

/** 展示　i18nTools.close 命令 */
export const showI18nCommandDispose = () => {
  globalContext.setContext('ctools.i18nCommandClose', true);
};
/**　隐藏　i18nTools.close 命令 */
export const hideI18nCommandDispose = () => {
  globalContext.setContext('ctools.i18nCommandClose', false);
};

/** 展示　i18nTools.refresh 命令 */
export const showI18nRefreshCommandDispose = () => {
  globalContext.setContext('ctools.i18nCommandRefresh', true);
};
/**　隐藏　i18nTools.refresh 命令 */
export const hideI18nRefreshCommandDispose = () => {
  globalContext.setContext('ctools.i18nCommandRefresh', false);
};

class ExtensionContext {
  private commands = new Map();
  setContext(contextId:string, value: boolean|string ) {
    this.commands.set(contextId, value);
    vscode.commands.executeCommand('setContext', contextId, value);
  }
  getContext<T extends boolean | string = boolean>(contextId:string){
    if(!this.commands.has(contextId)) return undefined;
    return this.commands.get(contextId) as T;
  }
  
}
export const globalContext = new ExtensionContext();