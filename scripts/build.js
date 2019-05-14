const fs = require('fs');
const path = require('path');

const changePackageJson = (pathToPackageJson) => {
    const packageJson = JSON.parse(fs.readFileSync(pathToPackageJson).toString());
    delete packageJson.scripts;
    delete packageJson.files;
    fs.writeFileSync(pathToPackageJson, JSON.stringify(packageJson, null, 2));
}

changePackageJson(path.join(process.cwd(), 'dist', 'package.json'));


