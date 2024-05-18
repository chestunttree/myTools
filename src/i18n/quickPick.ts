import * as vscode from 'vscode';
import { Contributes, ModeItemPick, SelectCodeLensModeItem, SelectCommandItem } from '../type';
import { globalContext } from '../utils/context';
import { CODE_MODE_CHECK, CommandPick } from '../utils/enum';
import { ayncReadFile } from '../utils/fileLoad';
import { pathResolveOfWorkspace } from '../utils/workspace';

const checkedIcon = new vscode.ThemeIcon('lens-choose');
const chooseIcon = new vscode.ThemeIcon('debug-breakpoint-unverified')

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
    const modePickList: Promise<vscode.QuickPickItem | undefined>[] = [];
    if (!i18nOptions) return [];
    const i18noptionsUrlAccess = (option: vscode.QuickPickItem, url: string) =>
        ayncReadFile(pathResolveOfWorkspace(url))
            .then(() => option).catch(() => undefined);
    for (let i in i18nOptions) {
        modePickList.push(i18noptionsUrlAccess({
            label: i,
            description: CODE_MODE_CHECK,
            iconPath: currentMode === i ? checkedIcon : chooseIcon
        },i18nOptions[i]))
    }
    const isNotUndefined = <T>(v: T | undefined): v is T => Boolean(v)
    const results = await Promise.all(modePickList);
    return results.filter(isNotUndefined);
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
    let modePickList: Promise<vscode.QuickPickItem[]>[] = [];
    const baseCommandsItems = selectCommandItems.reduce<vscode.QuickPickItem[]>(function (list, item) {
        const { type } = item;
        /**　分割线 */
        if (type === CommandPick.divider) return [...list, { label: '', kind: vscode.QuickPickItemKind.Separator }];
        if (type === CommandPick.commandItem) {
            const { command, rule } = item;
            if (!commandsMap[command]) return list;
            if (!isCommandPickShow(rule)) return list;
            return [...list, createPickItem(commandsMap, command)];
        }
        modePickList.push(item.options());
        return list;
    }, []);
    const modePickListResult = await Promise.all(modePickList);
    const modePickItems = modePickListResult.flat(2);
    const modePickDivider:vscode.QuickPickItem = {label: 'codeLens mode check', kind: vscode.QuickPickItemKind.Separator}
    const commandsItems = [...baseCommandsItems, modePickDivider, ...modePickItems]
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
    const { detail, description, label } = pickResult;
    if (description === CODE_MODE_CHECK && label) {
        const codeLensConfig = vscode.workspace.getConfiguration('ctools.i18n.codeLens');
        codeLensConfig.update('mode', label, vscode.ConfigurationTarget.Workspace);
        vscode.commands.executeCommand('ctools.i18n.codeLens');
    }
    if (detail) vscode.commands.executeCommand(detail);
}
