import * as vscode from 'vscode';
import { Contributes, SelectCodeLensModeItem, SelectCommandItem } from '../type';
import { globalContext } from '../utils/context';
import { CommandPick } from '../utils/enum';

export async function selectCodeLensMode(selectItems: SelectCodeLensModeItem[]) {
    const quickPick = await vscode.window.showQuickPick(selectItems.map(({ code }) => code));
    return quickPick;
}

export async function selectCToolsCommand(CTX: vscode.ExtensionContext) {
    const executableCommands = await getExecutableCommands(CTX);
    if (!executableCommands) return;
    const quickPick = await vscode.window.showQuickPick(executableCommands);
    runPickResultCommand(quickPick);
}

const codeLensPickList = async () => {
    const i18nOptions = vscode.workspace.getConfiguration('ctools.i18n').get<Record<string, string>>('options');
    const currentMode = vscode.workspace.getConfiguration('ctools.i18n.codeLens').get('mode');
    const modePickList: vscode.QuickPickItem[] = [];
    if (!i18nOptions) return modePickList;
    for (let i in i18nOptions) {
        modePickList.push({ label: i, description: 'CodeLens mode', picked: currentMode === i })
    }
    return modePickList;
}
/**　命令下拉框 选项 */
const selectCommandItems: SelectCommandItem[] = [
    // { command: 'ctools.i18n'},
    { type: CommandPick.commandItem, command: 'ctools.i18n.refresh', rule: 'i18nCommandRefresh' },
    { type: CommandPick.divider, },
    { type: CommandPick.commandItem, command: 'ctools.i18n.codeLens', rule: 'codeLensCommandStart' },
    { type: CommandPick.commandItem, command: 'ctools.i18n.codeLens.close', rule: 'codeLensCommandClose' },
    { type: CommandPick.modeItem, options: codeLensPickList }

    // { type: CommandPick.commandItem, command: 'ctools.i18n.codeLens.checkMode', rule: 'codeLensCommandCheck' },
    // { command: 'ctools.i18n.codeLens.search', rule: ({codeLensCommandSearch}) => codeLensCommandSearch },
];


const getExecutableCommands = async (CTX: vscode.ExtensionContext) => {
    const extension = vscode.extensions.getExtension('chestunttree.ctools');
    if (!extension) return undefined;
    const packageCommands: Contributes.commands[] = extension.packageJSON.contributes.commands;
    const commandsMap = packageCommands.reduce<Record<string, Contributes.commands>>((resMap, item) => ({ ...resMap, [item.command]: item }), {});
    const commandsItems = selectCommandItems.reduce<vscode.QuickPickItem[]>(function (list, item) {
        const { type } = item;
        /**　分割线 */
        if (type === CommandPick.divider) return [...list, { label: '', kind: vscode.QuickPickItemKind.Separator }];
        if (type === CommandPick.commandItem) {
            const { command, rule } = item;
            if (!commandsMap[command]) return list;
            if (!isCommandPickShow(rule)) return list;
            return [...list, createPickItem(commandsMap, command)];
        }
        const dividerPick: vscode.QuickPickItem = { label: '', kind: vscode.QuickPickItemKind.Separator }
        const modeItem = await item.options()
        return [...list, dividerPick, ...modeItem];
    }, []);
    return commandsItems;
};
/**　检查命令在Context是否被标记为隐藏  */
const isCommandPickShow = (rule: string) => !rule || globalContext.getContext('ctools.' + rule);
const createPickItem = (commandsMap: Record<string, Contributes.commands>, command: string, other?: Omit<vscode.QuickPickItem, 'label' | 'detail'>) => {
    const pickItem: vscode.QuickPickItem = { label: commandsMap[command].title, detail: command };
    if (other?.buttons) pickItem.buttons = other.buttons;
    return pickItem;
};

/** 执行command下拉 选中后的命令 */
const runPickResultCommand = (pickResult?: vscode.QuickPickItem) => {
    if (!pickResult) return;
    const { detail } = pickResult;
    if (!detail) return;
    vscode.commands.executeCommand(detail);
}
