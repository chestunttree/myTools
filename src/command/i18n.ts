import * as vscode from 'vscode';
import apiName from '../utils/apiName';
import path from 'path';
import { ayncReadFile } from '../utils/fileLoad';
import { createHover } from '../utils/hoverProvider';

export const languages = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'];
export function createI18nCommand() {
    let { i18nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
    const i18nOptionsCatch = new Map<string, any>();
    let statusBarItem = createStatusBarItem();
    let statusBarItemLoading: NodeJS.Timeout;
    let isFresh = true;
    let isI18nReay = false;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    /** 获取当前工作区路径 */
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    const i18nCommand = vscode.commands.registerCommand('ctools.i18n', () => {
        if (!i18nApiName || !i18nApiName.length) {
            return vscode.window.showErrorMessage('ctools.i18n 失败启动：i18n.apiName配置不能为空', { title: 'Open Settings' })
                .then(selection => {
                    if (selection && selection.title === 'Open Settings') {
                        /** 打开 setting.json 设置插件 */
                        vscode.commands.executeCommand('workbench.action.openSettings', 'ctools.i18n.apiName');
                    }
                });
        }
        if (isI18nReay) { return vscode.window.showInformationMessage('mytools.i18n 已启动'); }
        isI18nReay = true;
        /** 监听 Setting.json 和 i18n配置文件更新 */
        let changeFiles: string[] = [];
        vscode.workspace.onDidChangeTextDocument(event => {
            const currentFileUri = event.document.uri.fsPath;
            const i18noptionsFilePaths = [...i18nOptionsCatch.keys()];
            if (!i18noptionsFilePaths.includes(currentFileUri.replace(/\\/g, '/'))) { return; }
            if (!changeFiles.includes(currentFileUri)) {
                changeFiles.push(currentFileUri);
            }
        });
        // 监听文件的保存
        vscode.workspace.onDidSaveTextDocument(savedDocument => {
            const saveFileUri = savedDocument.uri.fsPath;
            if (changeFiles.includes(saveFileUri)) {
                changeFiles = changeFiles.filter((i => i === saveFileUri));
                readI18nOptionsfiles();
            }
        });
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('ctools.i18n')) {
                readI18nOptionsfiles();
                const apiNameData = apiName();
                i18nCodeRegExp = apiNameData.i18nCodeRegExp;
                i18nApiNameRegExp = apiNameData.i18nApiNameRegExp;
                i18nApiName = apiNameData.i18nApiName;
            }
        });
        readI18nOptionsfiles();
        vscode.window.showInformationMessage('mytools.i18n complete!');
    });
    /** i18n 调用代码块 hover Provide */
    const i18nProvide = vscode.languages.registerHoverProvider(languages, {
        provideHover(document, position, token) {
            if(!isI18nReay) return;
            const range = document.getWordRangeAtPosition(position, i18nApiNameRegExp);
            if (!range) { return Promise.reject(null); }
            return new Promise((resolve, reject) => {
                if (token.isCancellationRequested) {
                    reject(null);
                } else {
                    const text = document.getText(range);
                    let [i18nCode, i8nApiName] = text.replace(i18nCodeRegExp, '$2|$1').split('|');
                    const apiNameCheck = i18nApiName?.find((i) => isArray(i) && i8nApiName === i[0].replaceAll('/', ''));
                    if (apiNameCheck) i18nCode = `${apiNameCheck[1]}.${i18nCode}`;
                    resolve((createHover(i18nCode, i18nOptionsCatch)));
                }

            });
        }
    });

    return [i18nCommand, statusBarItem, i18nProvide];

    async function getI18nOptionsConfiguration() {
        let config = vscode.workspace.getConfiguration('ctools.i18n');
        let options = config.get<Record<string, string>>('options');
        const validateOptions = options && isObj(options) && Object.keys(options).length > 0;
        let errorMessage = '';
        if (!Boolean(options)) { errorMessage = 'i18n 配置文件路径未设置: ctools.i18n.options'; }
        if (!isObj(options)) { errorMessage = 'ctools.i18n.option默认类型为Object: { [语言]: [配置文件路径] }'; }
        if (!(options && Object.keys(options).length > 0)) { errorMessage = 'ctools.i18n.option不能为空对象'; }
        if (!validateOptions) {
            vscode.window.showErrorMessage(errorMessage, { title: 'Open Settings' })
                .then(selection => {
                    if (selection && selection.title === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'ctools.i18n.options');
                    }
                });
            return Promise.reject('fails');
        } else {
            return options;
        }
    }
    /** 加载 i18n 配置文件 */
    async function readI18nOptionsfiles() {
        if (statusBarItem) animateStatusBarItem(true);
        const options = await getI18nOptionsConfiguration();
        for (let languagesItem in options) {
            const filePath = path.resolve(workspacePath, options[languagesItem]);
            loaderFile(filePath, options[languagesItem]);
        }
        if (isFresh) {
            isFresh = false;
            vscode.window.showInformationMessage('i18n 配置加载完成!');
        } else {
            vscode.window.showInformationMessage('i18n 配置已更新!');
        }
        if (statusBarItem) animateStatusBarItem(false);
    }
    /** 加载文件 */
    async function loaderFile(filePath: string, relativePath: string) {
        if (filePath) {
            delete require.cache[require.resolve(filePath)];
            console.log(relativePath, filePath, filePath.replace(/\\/g, '/'))
            try {
                await ayncReadFile(filePath, relativePath);
            } catch (error) {
                console.log('error', error);
                console.error(error);
            }

            i18nOptionsCatch.set(filePath.replace(/\\/g, '/'), {
                content: require(filePath),
                path: relativePath
            });
        }
    }


    function afterI18nOptionsChange() {
        let changeFiles: string[] = [];

        vscode.workspace.onDidChangeTextDocument(event => {
            const currentFileUri = event.document.uri.fsPath;
            const i18noptionsFilePaths = [...i18nOptionsCatch.keys()];
            if (!i18noptionsFilePaths.includes(currentFileUri.replace(/\\/g, '/'))) { return; }
            if (!changeFiles.includes(currentFileUri)) {
                changeFiles.push(currentFileUri);
            }
        });

        // 监听文件的保存
        vscode.workspace.onDidSaveTextDocument(savedDocument => {
            const saveFileUri = savedDocument.uri.fsPath;
            if (changeFiles.includes(saveFileUri)) {
                changeFiles = changeFiles.filter((i => i === saveFileUri));
                readI18nOptionsfiles();
            }
        });
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('ctools.i18n')) { readI18nOptionsfiles(); }
        });
    }
    async function animateStatusBarItem(isRun: boolean) {
        if (statusBarItemLoading !== undefined) clearTimeout(statusBarItemLoading);
        if (!isRun) return;
        let counter = 0;
        statusBarItemLoading = setInterval(() => {
            switch (counter % 4) {
                case 0:
                    statusBarItem.text = `$(sync~spin)`;
                    break;

                case 1:
                    statusBarItem.text = `$(sync~spin)`;
                    break;

                case 2:
                    statusBarItem.text = `$(sync~spin)`;
                    break;

                case 3:
                    statusBarItem.text = `$(sync~spin)`;
                    break;
            }
            statusBarItem.show();
            counter++;
        }, 200);

    }
}


/** 创建左下角图标 */
function createStatusBarItem() {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = `$(refresh)`; // 使用内置的图标
    statusBarItem.tooltip = 'Refresh I18n cache';
    statusBarItem.command = 'ctools.i18n.refresh'; // 当点击图标时执行的命令
    statusBarItem.show(); // 让状态栏项显示出来
    return statusBarItem;
}


export function isObj(target: any) {
    return Object.prototype.toString.call(target) === '[object Object]';
}
export function isArray(target: any) {
    return Object.prototype.toString.call(target) === '[object Array]';
}