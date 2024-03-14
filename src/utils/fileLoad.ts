import { access, readFile } from 'fs/promises';
import { isString } from 'lodash';
import { extname } from 'path';
// import fs from 'fs';
import * as vscode from 'vscode';
import { fileExtensions } from './config';

type CodeLineItem = {code: string, l:number}
let codeLineArr:Record<string, CodeLineItem[]> = {};
const codeTextMap:Record<string, string> = {}; 

const wrapParserRegExp = /\r\n/g;
/** 查询 冒号前的属性名 */
const objParamsRegExp = /[^,{]+(?=\:)/g;
export async function ayncReadFile(path:string, relativePath:string) {
    const extension = getFileExtension(path);
    if(!extension) path = await filePathFormat(path);
    await validFileAccess(path);
    const result = await readFile(path, {encoding:'utf8'});
    codeLineArr[relativePath] = codeStringParser(result);
    // return codeLineArr;
    return path;
}
/** 检查文件路径是否可访问 */
async function validFileAccess(path: string) {
    try {
        await access(path);
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
        return false;
    }
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
    if(extension==='.') extension = '';
    return extension;
}


function codeStringParser(codeStr: string){
    return codeStr.split(wrapParserRegExp).reduce<CodeLineItem[]>((result,code, i)=>{
        // 过滤 注释的代码
        if(/^\/\/.*/.test(code.trim())) return result;
        return [
            ...result,
            {
                code,
                l: i+1,
            }
        ]
    },[])
}

export default function getCodesLine(codes:string[], relativePath:string){
    const codeLines = codeLineArr[relativePath];
    let codeLineCount:number | undefined;
    codeLines.find(line => {
        const parameterMatch = line.code.match(objParamsRegExp);
        let currentCodes = [...codes];
        if(parameterMatch) {
            const parameters:string[] = [];
            parameterMatch.forEach((param,matchKey) => {
                if(!isString(param)) return;
                parameters.push(param.trim())
            })
            parameters.find(itemParameter => {
                if(itemParameter === currentCodes[0]) currentCodes.shift();
                if(currentCodes.length===0) return true;
            })
            if(currentCodes.length===0) {
                codeLineCount = line.l;
                return true;
            }
        }
    })
    return codeLineCount;
}

// function codeMapParser(){
//     for(const codePath in codeLineArr) {
//         let currentParameter:string[] = [];
//         codeLineArr[codePath].forEach(({code,l}) => {
//             const checkObjParams = code.match(objParamsRegExp);
//             if(checkObjParams&&checkObjParams.length) {
                
//                 // currentParameter.push(checkObjParams[0]);
//                 // checkObjParams.reduce(i => {
//                 //     i
//                 // }, )
//             }
//         });
//     }
// }
