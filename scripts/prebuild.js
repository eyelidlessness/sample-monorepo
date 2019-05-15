const fs = require('@file-services/node').default;
const {
    readJsonFileSync,
    writeFileSync,
    findFilesSync,
    readFileSync,
    populateDirectorySync,
    path
} = fs
const buildFolder = 'dist';

const copyDirectoryToBuildFolder = (pathToDirectry) => {
    const directoryPaths = findFilesSync(pathToDirectry, {
        filterFile: ({name}) => name.indexOf("tsconfig") === -1,
        filterDirectory: ({name}) => ["test", "node_modules"].indexOf(name) !== -1
    });
    const directoryContents = directoryPaths.reduce((contents, filePath) => {
        const relativeFilePath = filePath.substr(pathToDirectry.length);
        contents[relativeFilePath] = readFileSync(filePath, 'utf8');
        return contents;
    }, {});
    populateDirectorySync(path.join(pathToDirectry, buildFolder), directoryContents);
}

copyDirectoryToBuildFolder(process.cwd());
