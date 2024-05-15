import * as vscode from 'vscode';
import { Contributes, SelectCodeLensModeItem, SelectCommandItem } from '../type';
import { globalContext } from '../utils/context';

export async function selectCodeLensMode(selectItems: SelectCodeLensModeItem[]) {
    const quickPick = await vscode.window.showQuickPick(selectItems.map(({ code }) => code));
    return quickPick;
}

export async function selectCToolsCommand(CTX: vscode.ExtensionContext) {
    const executableCommands = getExecutableCommands(CTX);
    if(!executableCommands) return;
    const quickPick = await vscode.window.showQuickPick(executableCommands);
    console.log(quickPick, 'quickPick');
    runPickResultCommand(quickPick);
    
    // const quickPick = await vscode.window.showInputBox({
    //     title: 'title1',

    // });
    // console.log(quickPick, 'quickPick');
    // quickPick && vscode.commands.executeCommand(quickPick);
}
/**　命令下拉框 选项 */
const selectCommandItems: SelectCommandItem[] = [
    // { command: 'ctools.i18n.commands' },
    // { command: 'ctools.i18n'},
    { command: 'ctools.i18n.refresh', rule: 'i18nCommandRefresh' },
    { command: '', divider: true, },
    { command: 'ctools.i18n.codeLens', rule: 'codeLensCommandStart' },
    { command: 'ctools.i18n.codeLens.checkMode', rule: 'codeLensCommandCheck' },
    { command: 'ctools.i18n.codeLens.close', rule: 'codeLensCommandClose' },
    // { command: 'ctools.i18n.codeLens.search', rule: ({codeLensCommandSearch}) => codeLensCommandSearch },
];
const getExecutableCommands = (CTX: vscode.ExtensionContext) => {
    const extension = vscode.extensions.getExtension('chestunttree.ctools');
    if (!extension) return undefined;
    const packageCommands: Contributes.commands[] = extension.packageJSON.contributes.commands;
    const commandsMap = packageCommands.reduce<Record<string, Contributes.commands>>((resMap, item) => ({ ...resMap, [item.command]: item }), {});
    const commandsItems = selectCommandItems.reduce<vscode.QuickPickItem[]>(function (list, item) {
        const { command, rule, divider } = item;
        /**　分割线 */
        if(divider) return [...list, { label: '', kind: vscode.QuickPickItemKind.Separator }]
        
        if(!commandsMap[command]) return list;
        if (!checkCommandRule(rule, CTX)) return list;
        return [...list, createPickItem(commandsMap, command)];
    }, []);
    return commandsItems;
};
/**　检查命令在Context是否被标记为隐藏  */
const checkCommandRule = (rule:SelectCommandItem['rule'], CTX: vscode.ExtensionContext) => !rule || globalContext.getContext('ctools.'+rule);
const createPickItem = (commandsMap:Record<string, Contributes.commands>, command:string, other?:Omit<vscode.QuickPickItem, 'label'|'detail'> ) => {
    const pickItem:vscode.QuickPickItem = {label: commandsMap[command].title, detail: command};
    if(other?.buttons) pickItem.buttons = other.buttons;
    return pickItem;
};

/** 执行command下拉 选中后的命令 */
const runPickResultCommand = (pickResult?: vscode.QuickPickItem) => {
    if(!pickResult) return;
    const {detail} = pickResult;
    if(!detail) return;
    vscode.commands.executeCommand(detail);
}
