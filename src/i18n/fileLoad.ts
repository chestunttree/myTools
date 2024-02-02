import { access, readFile } from 'fs/promises';
import { isString } from 'lodash';
// import fs from 'fs';
import * as vscode from 'vscode';

type CodeLineItem = {code: string, l:number}
let codeLineArr:Record<string, CodeLineItem[]> = {};
const codeTextMap:Record<string, string> = {}; 

const wrapParserRegExp = /\r\n/g;
/** 查询 冒号前的属性名 */
const objParamsRegExp = /[^,{]+(?=\:)/g;
export async function ayncReadFile(path:string, relativePath:string){
    console.log(path)
    await validFileAccess(path);
    const result = await readFile(path, {encoding:'utf8'});
    codeLineArr[relativePath] = codeStringParser(result);
    // return codeLineArr;
}
async function validFileAccess(path: string) {
    try {
        await access(path)
        return true;   
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
        return false;
    }
}
function codeStringParser(codeStr: string){
    return codeStr.split(wrapParserRegExp).reduce<CodeLineItem[]>((result,code, i)=>{
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
