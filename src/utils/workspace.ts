import * as vscode from 'vscode';
import path from 'path';

const workspaceFolders = vscode.workspace.workspaceFolders;
/** 获取当前工作区路径 */
export const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';

/** 获取 相对当前工作空间的Url */
export const pathResolveOfWorkspace = (url:string) => path.resolve(workspacePath, url);