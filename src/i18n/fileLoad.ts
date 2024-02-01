import { access, readFile } from 'fs/promises';
import * as vscode from 'vscode';

export async function ayncReadFile(path:string){
    console.log(path)
    await validFileAccess(path);
    const result = await readFile(path);
    return result;
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