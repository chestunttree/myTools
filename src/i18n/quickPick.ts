import * as vscode from 'vscode';
import { SelectCodeLensModeItem } from '../type';

export async function selectCodeLensMode(selectItems: SelectCodeLensModeItem[]) {
    const quickPick = await vscode.window.showQuickPick(selectItems.map(({code})=>code));
    return quickPick;
}

export async function selectCToolsCommand() {
    // const quickPick = await vscode.window.showQuickPick()
    console.log(getExecutableCommands());
}

// export function ctoolsCommand
const getExecutableCommands = () => vscode.extensions.getExtension('chestunttree.ctools');

// const commandSelect = vscode.window.createQuickPick()