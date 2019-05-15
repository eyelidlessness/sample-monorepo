import fs from '@file-services/node';
import { spawnSync } from 'child_process';

const { findFilesSync, readFileSync, populateDirectorySync, path } = fs;
const buildFolder = 'dist';
const ignoredFolder = new Set(['test', 'node_modules', buildFolder, 'sources']);

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

const workDir = process.cwd();

fs.mkdirSync(path.join(workDir, buildFolder));

copySourcesToFolder(workDir, path.join(buildFolder, 'sources'));

const tsConfigPath = path.join(workDir, buildFolder, 'sources', 'tsconfig.json');
fs.writeFileSync(
    tsConfigPath,
    fs.readFileSync(tsConfigPath, 'utf8').replace('tsconfig.base.json', '../../tsconfig.base.json')
);
spawnSync('node', [require.resolve('typescript/bin/tsc')], {
    cwd: path.join(workDir, buildFolder, 'sources'),
    stdio: 'inherit'
});

copySourcesToFolder(workDir, buildFolder);

const tsFilesInDist = fs.findFilesSync(path.join(workDir, buildFolder), {
    filterDirectory: ({ name }) => !ignoredFolder.has(name),
    filterFile: ({ name }) => name.endsWith('.ts') && !name.endsWith('.d.ts')
});

for (const filePath of tsFilesInDist) {
    fs.removeSync(filePath);
}
