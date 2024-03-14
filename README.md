# mytools README
i18n 辅助插件
## Features

主要用以辅助开发者查看i18n对应Code在配置中的文本内容

## Requirements

安装完成后 需要配置ctools.i18n.options 才能正常运行

## Extension Settings

* `ctools.i18n.options`: 配置一个object，键唯一， 值为配置的相对项目根目录的路径
* `ctools.i18n.apiName`: 需要匹配的i18n方法名
    - 例如：`"\\$t"`,`"\\$tcc"`,`"\\$tc"`,`"TC"`

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0

Initial release

### 0.1.3

修复 i18n.refresh bug

优化i18n.options配置读取
* 文件路径后缀自动获取匹配 `.js`,`.ts`,`.json`
* 无效路径报错提示，并引导配置

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
