import { access, readFile } from 'fs/promises';
// import generator from '@babel/generator';
import {parse} from '@babel/parser';
import type parser from '@babel/parser';
import {transformSync} from '@babel/core';
import babelPresets from '@babel/preset-env';
// import parser from '@babel/traverse';
// import parser from '@babel/types';
import { extname } from 'path';
// import * as esm from 'esm';
// import fs from 'fs';
// import * as vscode from 'vscode';
import { fileExtensions } from './config';
import { transformTsFile } from './ts/compile';
import { File } from '@babel/types';

type CodeLineItem = {code: string, l:number}
const astMap = new Map<string,parser.ParseResult<File>>();

const wrapParserRegExp = /\r\n/g;
/** 查询 冒号前的属性名 */
const objParamsRegExp = /[^,{]+(?=\:)/g;
export async function ayncReadFile(path:string) {
    const extension = getFileExtension(path);
    if(!extension) path = await filePathFormat(path);
    await access(path);
    // codeLineArr[relativePath] = codeStringParser(result);
    // return codeLineArr;
    return path;
}

/**　对于没有文件后缀的路径　拼接一个默认文件后缀
 *   如果存在拼接后缀的路径则返回，如果都无法访问则返回原路径
 */
async function filePathFormat(filePath:string):Promise<string> {
    const check = fileExtensions.map((fileExt:string) => 
        access(filePath + '.' + fileExt)
        .then(()=> filePath + '.' + fileExt)
    );
    try {
       return await Promise.any(check);
    } catch (error) {
        return filePath;
    }
}

function getFileExtension(filePath: string) {
    let extension = extname(filePath);
    if(extension === '.') extension = '';
    return extension;
}

export async function loadFile(filePath: string){
    const extension = getFileExtension(filePath);
    const code = await readFile(filePath, {encoding:'utf8'});
    if(!extension) return undefined;
    if(extension === '.js') return transforEsmToCommodJS(code, filePath); //await loadJS(filePath);
    if(extension === '.ts') {
        return transformTsFile(filePath);
    }
}
async function loadJS(filePath: string){
    try {
        return require(filePath); 
    } catch (error) {
        return await loadEsModule(filePath);
    }
}
async function loadEsModule(filePath: string) {
    try {
        return await import(filePath);
    } catch (error) {
        return {};    
    }
}

async function transforEsmToCommodJS(code: string, filePath:string){
    const ast = parse(code);
    astMap.set(filePath, ast);
    const transformedCode = transformSync(code, {
        presets: [babelPresets]
    });
    return transformedCode?.code;
}
