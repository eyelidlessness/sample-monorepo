import fs from '@file-services/node';
import { spawnSync } from 'child_process';

const { findFilesSync, readFileSync, populateDirectorySync, path } = fs;

const copySourcesToFolder = (
    pathToDirectry: string,
    folderName: string,
    ignoredFolder: Set<string>,
    ignoredFiles?: string[]
) => {
    const directoryPaths = findFilesSync(pathToDirectry, {
        filterDirectory: ({ name }) => !ignoredFolder.has(name),
        filterFile: ({ name }) => !ignoredFiles || ignoredFiles.filter(endsWith => name.endsWith(endsWith)).length === 0
    });
    const directoryContents = directoryPaths.reduce(
        (contents, filePath) => {
            const relativeFilePath = filePath.substr(pathToDirectry.length);
            contents[relativeFilePath] = readFileSync(filePath, 'utf8');
            return contents;
        },
        {} as Record<string, string>
    );
    populateDirectorySync(path.join(pathToDirectry, folderName), directoryContents);
};

export function build(workDir: string = process.cwd(), srcDir: string = 'src', outDir: string = 'npm') {
    const tsConfigPath = path.join(workDir, outDir, srcDir, 'tsconfig.json');
    const ignoredFolder = new Set(['test', 'node_modules', outDir, srcDir]);

    // creating 'npm' folder
    fs.ensureDirectorySync(path.join(workDir, outDir));

    // copying all files in repo into 'npm/src' folder
    copySourcesToFolder(workDir, path.join(outDir, srcDir), ignoredFolder);

    // modifying tsconfig reference
    fs.writeFileSync(
        tsConfigPath,
        fs.readFileSync(tsConfigPath, 'utf8').replace('tsconfig.base.json', '../../tsconfig.base.json')
    );

    // building code
    spawnSync('node', [require.resolve('typescript/bin/tsc'), '--outDir', '..'], {
        cwd: path.join(workDir, outDir, srcDir),
        stdio: 'inherit'
    });

    // copying all files in repo into 'npm' folder
    copySourcesToFolder(workDir, outDir, ignoredFolder, ['.ts']);

    // finding all tsconfig files in 'npm' folder
    const tsConfigFilesInNpm = fs.findFilesSync(path.join(workDir, outDir), {
        filterFile: ({ name }) => name.indexOf('tsconfig') !== -1
    });

    // removing all tsconfigs
    for (const filePath of tsConfigFilesInNpm) {
        fs.removeSync(filePath);
    }
}
