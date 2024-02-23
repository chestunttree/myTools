import * as vscode from 'vscode';
import path from 'path';
import apiName from './apiName';
import { createHover } from './hoverProvider';
import { ayncReadFile } from './fileLoad';


export const languages = ['javascript', 'typescript', 'vue', 'javascriptreact', 'typescriptreact'];
export function i18nInit(context: vscode.ExtensionContext) {

	const { i8nCodeRegExp, i18nApiNameRegExp, i18nApiName } = apiName();
	const i18nOptionsCatch = new Map<string, any>();
	let statusBarItem: vscode.StatusBarItem;
	let statusBarItemLoading: NodeJS.Timeout;
	let isFresh = true;
	let isI18nReay = false;
	/** 这里默认取第一个 workspace */
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : '';

	// 使用控制台输出诊断信息(控制台日志)和错误(控制台错误)
	// 当你的扩展被激活时，这行代码只会执行一次
	console.log('Congratulations, your extension "mytools" is now active!');

	// 该命令已在包中定义。
	// 现在使用registerCommand提供命令的实现
	// commanddid参数必须与package.json中的命令字段匹配
	let disposable = vscode.commands.registerCommand('mytools.i18n', () => {
		if (!i18nApiName || !i18nApiName.length) {
			return vscode.window.showErrorMessage('mytools.i18n 失败启动：i18nTools.apiName配置不能为空', { title: 'Open Settings' })
				.then(selection => {
					if (selection && selection.title === 'Open Settings') {
						/** 打开 setting.json 设置插件 */
						vscode.commands.executeCommand('workbench.action.openSettings', 'mytools.i18nTools.apiName');
					}
				});
		}
		if (isI18nReay) { return vscode.window.showInformationMessage('mytools.i18n 已启动'); }
		isI18nReay = true;
		readI18nOptionsfiles();
		// 向用户显示一个消息框
		// vscode.window.showInformationMessage('mytools.i18n go go go!');
		afterI18nOptionsChange();


		statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		statusBarItem.text = `$(refresh)`; // 使用内置的图标
		statusBarItem.tooltip = 'Refresh I18n cache';
		statusBarItem.command = 'mytools.i18n.refresh'; // 当点击图标时执行的命令
		context.subscriptions.push(statusBarItem, disposableRefresh);
		statusBarItem.show(); // 让状态栏项显示出来

		context.subscriptions.push();
	});

	let disposableRefresh = vscode.commands.registerCommand('mytools.i18n.refresh', () => {
		readI18nOptionsfiles()
	})
	// readI18nOptionsfiles();


	const i18nProvide = vscode.languages.registerHoverProvider(languages, {
		provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position, i18nApiNameRegExp);
			if (!range) { return Promise.reject(null); }
			return new Promise((resolve, reject) => {
				if (token.isCancellationRequested) {
					reject(null);
				} else {
					const text = document.getText(range);
					let [i8nCode, i8nApiName] = text.replace(i8nCodeRegExp, '$2|$1').split('|');
					const apiNameCheck = i18nApiName?.find((i)=> isArray(i)&& i8nApiName===i[0].replaceAll('/',''))
					if(apiNameCheck) i8nCode = `${apiNameCheck[1]}.${i8nCode}`;
					resolve((createHover(i8nCode, i18nOptionsCatch)));
				}

			});
		}
	});
	context.subscriptions.push(disposable, i18nProvide);

	async function getI18nOptionsConfiguration() {
		let config = vscode.workspace.getConfiguration('mytools.i18nTools');
		let options = config.get<Record<string, string>>('options');
		const validateOptions = options && isObj(options) && Object.keys(options).length > 0;
		let errorMessage = '';
		if (!Boolean(options)) { errorMessage = 'i18n 配置文件路径未设置: mytools.i18nTools.options'; }
		if (!isObj(options)) { errorMessage = 'mytools.i18nTools.option默认类型为Object: { [语言]: [配置文件路径] }'; }
		if (!(options && Object.keys(options).length > 0)) { errorMessage = 'mytools.i18nTools.option不能为空对象'; }
		if (!validateOptions) {
			vscode.window.showErrorMessage(errorMessage, { title: 'Open Settings' })
				.then(selection => {
					if (selection && selection.title === 'Open Settings') {
						vscode.commands.executeCommand('workbench.action.openSettings', 'mytools.i18nTools.options');
					}
				});
			return Promise.reject('fails');
		} else {
			return options;
		}
	}
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
	async function loaderFile(filePath: string, relativePath: string) {
		if (filePath) {
			delete require.cache[require.resolve(filePath)];
			console.log(relativePath, filePath, filePath.replace(/\\/g, '/'))
			try {
				await ayncReadFile(filePath, relativePath);
			} catch (error) {
				console.log('error', error)
				console.error(error)
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
			if (event.affectsConfiguration('mytools.i18nTools')) { readI18nOptionsfiles(); }
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

function isObj(target: any) {
	return Object.prototype.toString.call(target) === '[object Object]';
}
function isArray(target: any) {
	return Object.prototype.toString.call(target) === '[object Array]';
}
