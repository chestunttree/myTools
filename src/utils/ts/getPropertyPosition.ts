import * as ts from 'typescript';
// import fs from "fs";
// import path from "path";

/** 解析ts代码， 传入特定属性名找到代码的位置（line，row） */
export function findPropertyInCode(code: string, propertyName: string): ts.LineAndCharacter | null {
    // 创建编译器选项
    const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.CommonJS,
    };

    // 解析代码
    const sourceFile = ts.createSourceFile('dummy.ts', code, ts.ScriptTarget.ES2018, true);

    let propertyPosition: ts.LineAndCharacter | null = null;

    // 遍历 AST
    function visitNode(node: ts.Node): void {
        /** 
         * ts.isPropertyAssignment 表示一个属性访问表达式节点,属性表达式分成两个点: 对象部分和属性部分;
         * ts.isIdentifier 表示一个标识节点, 用于命名 变量、函数、属性、参数等
         *   当前情况下 是找到访问对象中的目标属性名，属于标识节点的范畴，所以需要先做 ts.isIdentifier的判断
         * 
         */
        if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === propertyName) {
            propertyPosition = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile));
        }

        // 递归遍历子节点
        ts.forEachChild(node, visitNode);
    }

    // 开始遍历 AST
    visitNode(sourceFile);

    return propertyPosition;
}
/**
    示例用法
    const typescriptCode = `
        const obj = {
            nested: {
            property: 123
            }
        };
        
        console.log(obj.nested.property);
    `;
    const propertyName = 'data2';
    const propertyPosition = findPropertyInCode(typescriptCode, propertyName);
    if (propertyPosition) {
        console.log(`The property '${propertyName}' is found at line ${propertyPosition.line + 1}, column ${propertyPosition.character + 1}.`);
    } else {
        console.log(`The property '${propertyName}' is not found.`);
    }
 */