import * as vscode from 'vscode';
import { SelectCodeLensModeItem } from '../type';

export async function selectCodeLensMode(selectItems: SelectCodeLensModeItem[]) {
    const quickPick = await vscode.window.showQuickPick(selectItems.map(({code})=>code));
    return quickPick;
}

export async function selectCToolsCommand() {
    // const quickPick = await vscode.window.showQuickPick()
}

// export function ctoolsCommand
//createQuickPick