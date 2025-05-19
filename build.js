import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { srcFolder } from './libs/paths.js';
import { buildAndCopy } from './libs/project.js';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('clean', {
        alias: 'c',
        type: 'boolean',
        description: 'Clean existing builds before building',
        default: false
    })
    .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'Force rebuilds (same as clean for now)',
        default: false
    })
    .help()
    .argv;

const cleanFlag = argv.clean || argv.force; // Combine clean and force flags
const specifiedFolders = argv._;

if (cleanFlag) {
    console.log('Clean or force flag detected: existing builds will be deleted first.');
}

fs.readdir(srcFolder, (err, folders) => {
    if (err) {
        console.error('Error reading src folder:', err);
        return;
    }

    // If specific folders are provided, limit the build to those folders.
    const foldersToBuild = specifiedFolders.length > 0 
        ? folders.filter(folder => specifiedFolders.includes(folder)) 
        : folders;

    // Specify a list of folders to process first and last.
    const highPriorityFolders = ['charmony-api', 'charmony', 'charmony-echolocation', 'charmony-rune-dictionary', 'charmony-runestones', 'charmony-stone-chests'];
    const lowPriorityFolders = ['charmony-relics', 'charmony-runic-tomes', 'charm', 'charmonium', 'strange'];

    foldersToBuild.sort((a, b) => {
        const aPriorityIndex = highPriorityFolders.indexOf(a);
        const bPriorityIndex = highPriorityFolders.indexOf(b);
        const aLowPriorityIndex = lowPriorityFolders.indexOf(a);
        const bLowPriorityIndex = lowPriorityFolders.indexOf(b);

        if (aPriorityIndex !== -1 && bPriorityIndex !== -1) {
            return aPriorityIndex - bPriorityIndex; // Both are in the high-priority list, sort by their order in the list.
        }
        if (aPriorityIndex !== -1) return -1; // 'a' is in the high-priority list, prioritize it.
        if (bPriorityIndex !== -1) return 1;  // 'b' is in the high-priority list, prioritize it.

        if (aLowPriorityIndex !== -1 && bLowPriorityIndex !== -1) {
            return aLowPriorityIndex - bLowPriorityIndex; // Both are in the low-priority list, sort by their order in the list.
        }
        if (aLowPriorityIndex !== -1) return 1; // 'a' is in the low-priority list, deprioritize it.
        if (bLowPriorityIndex !== -1) return -1; // 'b' is in the low-priority list, deprioritize it.

        return 0; // Neither is in the high-priority or low-priority list, leave their order unchanged.
    });

    foldersToBuild.forEach(folder => {
        const srcPath = path.join(srcFolder, folder);
        if (fs.lstatSync(srcPath).isDirectory()) {
            buildAndCopy(srcPath, cleanFlag);
            console.log();
        }
    });
});