import * as ts from 'typescript';
import fs from "fs";
import path from "path";

/** 解析ts代码， 传入特定属性名找到代码的位置（line，row） */
export function findPropertyValuePosition(code: string, targetValue: string): ts.LineAndCharacter | null {
  // 创建编译器选项
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS
  };

  // 分析源代码
  const sourceFile = ts.createSourceFile('dummy.ts', code, ts.ScriptTarget.ES2018, true);

  let position: ts.LineAndCharacter | null = null;

  // 递归遍历 AST
  function visitNode(node: ts.Node): void {
    if (ts.isPropertyAssignment(node) && ts.isNumericLiteral(node.initializer) && node.initializer.text === targetValue) {
      position = sourceFile.getLineAndCharacterOfPosition(node.initializer.getStart(sourceFile));
    }

    ts.forEachChild(node, visitNode);
  }

  // 开始遍历 AST
  visitNode(sourceFile);

  return position;
}

/**
 * 用法示例：
    const typescriptCode = `
      const obj = {
        nested: {
          property: 123
        }
      };

      console.log(obj.nested.property);
    `;

    const targetValue = '123';
    const propertyPosition = findPropertyValuePosition(typescriptCode, targetValue);
    if (propertyPosition) {
    console.log(`The value '${targetValue}' is found at line ${propertyPosition.line + 1}, column ${propertyPosition.character + 1}.`);
    } else {
    console.log(`The value '${targetValue}' is not found.`);
    }

 */