import * as TS from 'typescript';
import fs from "fs";
import path from "path";
import { getSourceFile } from './compile';

/** 解析ts代码， 传入特定属性值找到代码的位置（line，row） */
export function findPropertyValuePosition(code: string, targetValue: string): TS.LineAndCharacter | null {
  // 创建编译器选项
  const compilerOptions: TS.CompilerOptions = {
    target: TS.ScriptTarget.ES2018,
    module: TS.ModuleKind.CommonJS
  };

  // 分析源代码
  const sourceFile = getSourceFile(code)

  let position: TS.LineAndCharacter | null = null;

  // 递归遍历 AST
  function visitNode(node: TS.Node): void {
    if (  TS.isPropertyAssignment(node)
          && (TS.isStringLiteral(node.initializer) || TS.isNumericLiteral(node.initializer))
          && node.initializer.text === targetValue
    ) {
      position = sourceFile.getLineAndCharacterOfPosition(node.initializer.getStart(sourceFile));
    }

    TS.forEachChild(node, visitNode);
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