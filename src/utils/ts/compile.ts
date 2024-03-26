import { readFile } from 'fs/promises';
import * as TS from 'typescript';


export function trasform(sourceFile:TS.SourceFile){
    const jsCodeFile = TS.transpileModule(sourceFile.getFullText(), {
        compilerOptions: {
            module: TS.ModuleKind.Node16,
            target: TS.ScriptTarget.ES2021
        }
    });
    if (jsCodeFile.diagnostics && jsCodeFile.diagnostics.length > 0) {
      throw new Error(
        TS.formatDiagnosticsWithColorAndContext(jsCodeFile.diagnostics, {
          getCanonicalFileName: (fileName) => fileName,
          getCurrentDirectory: () => '',
          getNewLine: () => TS.sys.newLine,
        })
      );
    }
    return jsCodeFile.outputText;
}
export function getSourceFile(code: string) {
    return TS.createSourceFile('dummy.ts', code, TS.ScriptTarget.ES2021, true);
}


export async function transformTsFile(filePath: string){
    const tsCode = await readFile(filePath, {encoding:'utf8'});
    if(!tsCode) return '';
    return trasform(getSourceFile(tsCode));
}