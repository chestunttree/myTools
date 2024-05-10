import * as vscode from 'vscode';
import { SelectCodeLensModeItem, SelectCommandItem } from '../type';

export async function selectCodeLensMode(selectItems: SelectCodeLensModeItem[]) {
    const quickPick = await vscode.window.showQuickPick(selectItems.map(({ code }) => code));
    return quickPick;
}

export async function selectCToolsCommand() {
    // const quickPick = await vscode.window.showQuickPick()
    console.log(getExecutableCommands());
}

// export function ctoolsCommand
/**　命令下拉框 选项 */
const selectCommandItems: SelectCommandItem[] = [
    { command: 'ctools.i18n.commands' },
    { command: 'ctools.i18n' },
    { command: 'ctools.i18n.refresh', rule: 'i18nCommandRefresh' },
    { command: 'ctools.i18n.codeLens' },
    { command: 'ctools.i18n.codeLens.checkMode', rule: 'codeLensCommandCheck' },
    { command: 'ctools.i18n.codeLens.close', rule: 'codeLensCommandClose' },
    // { command: 'ctools.i18n.codeLens.search', rule: ({codeLensCommandSearch}) => codeLensCommandSearch },
];

const getExecutableCommands = (CTX: vscode.ExtensionContext) => {
    const extension = vscode.extensions.getExtension('chestunttree.ctools');
    if(!extension) return undefined;
    const packageCommands:Record<'command'|'title', string>[] = extension.packageJSON.contributes.commands;
    const commandsMap = packageCommands.reduce<Record< string,typeof packageCommands[0]>>((resMap,item) => ({...resMap, [item.command]: item}), {});
    const commandsItems = selectCommandItems.reduce<vscode.QuickPickItem[]>((list, item)=>{
        const { command, rule} = item;
        if(!rule) return [...list, {label: commandsMap[command], detail: command}]
        if(!CTX.globalState.get(rule)) return list;
        return [...list, {label: commandsMap[command], detail: command}]
    }, [])
    // return contexts;
} 

// const commandSelect = vscode.window.createQuickPick()