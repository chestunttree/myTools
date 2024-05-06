import * as vscode from 'vscode';
import apiName from '../utils/apiName';
import path from 'path';
import vm from 'vm';
import { ayncReadFile, loadFile } from '../utils/fileLoad';
import { createHover } from '../utils/hoverProvider';
import { ModuleContext, NotUndefined, PickPromiseReturn } from '../type';
import { CodeInlayHints } from '../i18n/inlayHintsProvider';
import { i18nOptionsCatch } from '../i18n/i18nOptionsCatch';
import { isDevMode } from '../utils/config';

export const languages = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'];
export function createI18nCommand(CTX: vscode.ExtensionContext) {
    let { i18nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
    let statusBarItem = createStatusBarItem();
    let isFresh = true;
    let isI18nReay = false;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    /** 获取当前工作区路径 */
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
    
    const handleI18nStart =  () => {
        if (!i18nApiName || !i18nApiName.length) {
            return vscode.window.showErrorMessage('ctools.i18n 失败启动：i18n.apiName配置不能为空', { title: 'Open Settings' })
                .then(selection => {
                    if (selection && selection.title === 'Open Settings') {
                        /** 打开 setting.json 设置插件 */
                        vscode.commands.executeCommand('workbench.action.openSettings', 'ctools.i18n.apiName');
                    }
                });
        }
        if (isI18nReay) { return vscode.window.setStatusBarMessage('ctools.i18n 已启动', 2000); }
        // if (isI18nReay) { return vscode.window.showInformationMessage('ctools.i18n 已启动'); }
        isI18nReay = true;
        afterI18nOptionsChange();
        readI18nOptionsfiles().then(()=>{
            CTX.subscriptions.push(i18nCodeLens());
        });
        // vscode.window.showInformationMessage('ctools.i18n complete!');
        // vscode.window.setStatusBarMessage('ctools.i18n complete!', 2000)
    }
    const handleI18nRefresh = () => {
        if(!isI18nReay){
            vscode.commands.executeCommand('ctools.i18n');
            return;
        }
        readI18nOptionsfiles();
    };
    
    const i18nCommand = vscode.commands.registerCommand('ctools.i18n',handleI18nStart);
    const i18nRefreshCommand = vscode.commands.registerCommand('ctools.i18n.refresh',handleI18nRefresh);

    if(isDevMode(CTX.extensionMode)) handleI18nStart();
    /** 代码透镜 */
    const i18nCodeLens = () => {
        const codeLensDomSelector:vscode.DocumentSelector = {
            pattern: '**/*.vue'
        };
        const inlayHintsProvider = new CodeInlayHints(i18nOptionsCatch);
        return vscode.languages.registerInlayHintsProvider(codeLensDomSelector, inlayHintsProvider);
    };
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

    return [i18nCommand, i18nRefreshCommand, statusBarItem, i18nProvide];

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
        if (statusBarItem) updateStatusBarLoading(true);
        try {
            const options = await getI18nOptionsConfiguration();
            const loaderRes = await filterConfigI18nOptions(options);
            if(!loaderRes.length) {
                vscode.window.showErrorMessage('ctools.i18n.option 请配置有效路径', { title: 'Open Settings' })
                    .then(selection => {
                        if (selection && selection.title === 'Open Settings') {
                            vscode.commands.executeCommand('workbench.action.openSettings', 'ctools.i18n.options');
                        }
                    });
            } else {
                /**
                 * 这里在配置文件更新后 仅set加载后的新值
                 */
                loaderRes.forEach(({mapKey, content, path, modeName}) => i18nOptionsCatch.set(mapKey, {content, path, modeName}))
                if (isFresh) {
                    isFresh = false;
                    vscode.window.setStatusBarMessage('i18n 配置加载完成!', 2000);
                } else {
                    vscode.window.setStatusBarMessage('i18n 配置已更新!', 2000);
                }
            }
            if (statusBarItem) setTimeout(() => {
                updateStatusBarLoading(false);
            }, 500);            
        } catch (error) {
            if (statusBarItem) setTimeout(() => {
                updateStatusBarLoading(false);
            }, 500);            
        }
    }
    /** 加载文件 */
    async function loaderFile(filePath: string, relativePath: string, modeName: string) {
        try {
            filePath = await ayncReadFile(filePath, relativePath);
            // delete require.cache[require.resolve(filePath)];
        } catch (error) {
            return undefined;            
        }
        // console.log(relativePath, filePath, filePath.replace(/\\/g, '/'));
        // i18nOptionsCatch.set(filePath.replace(/\\/g, '/'), {
        //     content: require(filePath),
        //     path: relativePath
        // });
        let jsCode:string;
        try {
            jsCode = await loadFile(filePath).then(res=>res||'');
            const moduleContext:ModuleContext = { exports: {}, require, module:{exports: {}} };
            vm.runInNewContext(jsCode, moduleContext);
            const importedData = afterFileLoadGetDefaultReturn(moduleContext);
            return {
                mapKey: filePath.replace(/\\/g, '/'),
                content: importedData,
                path: relativePath,
                modeName,
            };
        } catch (error:any) {
            console.log(error.message);
            return undefined;
        }
        // return {
        //     mapKey: filePath.replace(/\\/g, '/'),
        //     content: require(filePath),
        //     path: relativePath
        // };
    }

    /** 过滤出 可被被加载的I18n.options配置 */
    type FilterI18nReturn = NonNullable<PickPromiseReturn<ReturnType<typeof loaderFile>>>[];
    async function filterConfigI18nOptions(options: PickPromiseReturn<ReturnType<typeof getI18nOptionsConfiguration>>) {
        const loaders:ReturnType<typeof loaderFile>[] = [];
        for (let languagesItem in options) {
            const filePath = path.resolve(workspacePath, options[languagesItem]);
            loaders.push((loaderFile(filePath, options[languagesItem], languagesItem)))
        }
        const loadersRes = await Promise.all(loaders);
        const r = loadersRes.filter(Boolean) as FilterI18nReturn;
        return r;
    }

    function afterI18nOptionsChange() {
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

    }
    /**　i18n 配置加载状态 */
    async function updateStatusBarLoading(isRun: boolean) {
        if (isRun){
            statusBarItem.text = `$(sync~spin)`;
        }else {
            statusBarItem.text = `$(refresh)`;
        }
    }
}

function afterFileLoadGetDefaultReturn(moduleContext: ModuleContext){
    if(moduleContext.exports.default) { // Esm
        return moduleContext.exports.default; 
    }else if(moduleContext.module.exports) { // CommondJs
        return moduleContext.module.exports;
    }else {
        return moduleContext.exports;
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