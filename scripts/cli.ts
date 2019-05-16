if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'production';
}

import program from 'commander';
import { build } from './build';

interface IBuildParams {
    outDir?: string;
    src?: string;
}

program
    .command('build [path]')
    .option('--out-dir <outDir>')
    .option('--src <src>')
    .action(async (path: string, cmd: IBuildParams) => {
        const { outDir, src } = cmd;
        build(path, src, outDir);
    });

program.parse(process.argv);
