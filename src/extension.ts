// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { i18nInit } from './i18n';

// /[\$t|\$tc](['|"](.*?)['|"])/

// 当你的扩展被激活时，这个方法被调用
// 你的扩展在第一次执行命令时被激活
export function activate(context: vscode.ExtensionContext) {
	i18nInit(context);
}


// This method is called when your extension is deactivated
export function deactivate() { }