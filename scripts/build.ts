import fs from '@file-services/node';
import { spawnSync } from 'child_process';

const { findFilesSync, readFileSync, populateDirectorySync, path } = fs;

const workDir = process.cwd();
const buildFolder = 'dist';
const sourcesFolder = 'sources';
const tsConfigPath = path.join(workDir, buildFolder, sourcesFolder, 'tsconfig.json');
const ignoredFolder = new Set(['test', 'node_modules', buildFolder, sourcesFolder]);

const copySourcesToFolder = (pathToDirectry: string, folderName: string) => {
    const directoryPaths = findFilesSync(pathToDirectry, {
        filterDirectory: ({ name }) => !ignoredFolder.has(name)
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

// creating 'dist' folder
fs.mkdirSync(path.join(workDir, buildFolder));

// copying all files in repo into 'dist/sources' folder
copySourcesToFolder(workDir, path.join(buildFolder, sourcesFolder));

// modifying tsconfig reference
fs.writeFileSync(
    tsConfigPath,
    fs.readFileSync(tsConfigPath, 'utf8').replace('tsconfig.base.json', '../../tsconfig.base.json')
);

// building code
spawnSync('node', [require.resolve('typescript/bin/tsc')], {
    cwd: path.join(workDir, buildFolder, sourcesFolder),
    stdio: 'inherit'
});

// copying all files in repo into 'dist' folder
copySourcesToFolder(workDir, buildFolder);

// finding all source files in 'dist' folder (that are not in sources folder)
const tsFilesInDist = fs.findFilesSync(path.join(workDir, buildFolder), {
    filterDirectory: ({ name }) => !ignoredFolder.has(name),
    filterFile: ({ name }) => name.endsWith('.ts') && !name.endsWith('.d.ts')
});

// removing all sources that are not under the 'sources' folder
for (const filePath of tsFilesInDist) {
    fs.removeSync(filePath);
}
