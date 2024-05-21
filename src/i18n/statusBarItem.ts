import * as vscode from 'vscode';

// let statusBarItem: vscode.StatusBarItem;

// /** 创建左下角图标 */
// function createStatusBarItem() {
//     if (statusBarItem) return statusBarItem;
//     statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
//     statusBarItem.text = `$(comment-discussion)`; // 使用内置的图标
//     statusBarItem.tooltip = 'start I18n cache';
//     statusBarItem.command = 'ctools.i18n.commands'; // 当点击图标时执行的命令
//     statusBarItem.show(); // 让状态栏项显示出来
//     return statusBarItem;
// }

export class StatusBarItem {
    static items: Record<string, StatusBarItem> = {};
    readonly barItem: vscode.StatusBarItem;
    constructor(public priority?: number) {
        this.barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, this.priority);
        this.startBarItem();
        this.barItem.show();
        StatusBarItem.items['fastBar'] = this;
    }
    public startBarItem() {
        this.barItem.text = `$(comment-discussion)`; // 使用内置的图标
        this.barItem.tooltip = 'start I18n tips';
        this.barItem.command = 'ctools.i18n'; // 当点击图标时执行的命令
    }

    public loadingBarItem() {
        this.barItem.text = `$(loading~spin) tools loading...`; // 使用内置的图标
        this.barItem.tooltip = '';
        this.barItem.command = ''; // 当点击图标时执行的命令
    }

    public fastBarItem() {
        this.barItem.text = `$(comment-discussion)`; // 使用内置的图标
        this.barItem.tooltip = 'I18n fast commands';
        this.barItem.command = 'ctools.i18n.commands'; // 当点击图标时执行的命令
    }
}