if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'production';
}

import program from 'commander';
import { build } from './build';

interface BuildParams {
    outDir?: string;
    src?: string;
}

program
    .command('build [path]')
    .option('--out-dir <outDir>')
    .option('--src <src>')
    .action(async (path: string, cmd: BuildParams) => {
        const { outDir, src } = cmd;
        build(path, src, outDir);
    });

program.parse(process.argv);
