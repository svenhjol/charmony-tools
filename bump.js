import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { srcFolder } from './libs/paths.js';
import { bumpVersion } from './libs/project.js';
import { logError, logSuccess } from './libs/log.js';
import { readProperties } from './libs/project.js';

// Collection mods to bump
const COLLECTION_MODS = ['charm', 'strange', 'charmonium'];

const argv = yargs(hideBin(process.argv))
    .option('all', {
        alias: 'a',
        type: 'boolean',
        description: 'Bump version for all collection mods',
        default: false
    })
    .option('sync', {
        alias: 's',
        type: 'boolean',
        description: 'Sync all collection mods to the highest version number',
        default: false
    })
    .help()
    .argv;

const specifiedMods = argv._;
const modsToProcess = argv.all ? COLLECTION_MODS : specifiedMods.length > 0 ? specifiedMods : COLLECTION_MODS;

fs.readdir(srcFolder, (err, folders) => {
    if (err) {
        console.error('Error reading src folder:', err);
        return;
    }

    let bumpCount = 0;
    const modVersions = new Map();
    let highestVersion = { major: 0, minor: 0, patch: 0 };

    // First pass: collect all versions and find the highest
    folders.forEach(folder => {
        if (modsToProcess.includes(folder)) {
            const srcPath = path.join(srcFolder, folder);
            if (fs.lstatSync(srcPath).isDirectory()) {
                try {
                    const props = readProperties(srcPath);
                    if (props?.mod_version) {
                        const [major, minor, patch] = props.mod_version.split('.').map(Number);
                        modVersions.set(folder, { major, minor, patch });
                        
                        // Compare versions
                        if (major > highestVersion.major || 
                            (major === highestVersion.major && minor > highestVersion.minor) ||
                            (major === highestVersion.major && minor === highestVersion.minor && patch > highestVersion.patch)) {
                            highestVersion = { major, minor, patch };
                        }
                    }
                } catch (err) {
                    logError(`Failed to read version for ${folder}: ${err.message}`);
                }
            }
        }
    });

    // Bump the highest version
    highestVersion.patch += 1;

    // Second pass: apply versions
    folders.forEach(folder => {
        if (modsToProcess.includes(folder)) {
            const srcPath = path.join(srcFolder, folder);
            if (fs.lstatSync(srcPath).isDirectory()) {
                try {
                    if (argv.sync) {
                        // In sync mode, update the gradle.properties directly with the new highest version
                        const propsFile = path.join(srcPath, 'gradle.properties');
                        const content = fs.readFileSync(propsFile, 'utf-8');
                        const newVersion = `${highestVersion.major}.${highestVersion.minor}.${highestVersion.patch}`;
                        const updatedContent = content.replace(/^mod_version=.+$/m, `mod_version=${newVersion}`);
                        fs.writeFileSync(propsFile, updatedContent, 'utf-8');
                        logSuccess(`Synced ${folder} to version ${newVersion}`);
                    } else {
                        // Regular bump mode
                        bumpVersion(srcPath);
                    }
                    bumpCount++;
                } catch (err) {
                    logError(`Failed to ${argv.sync ? 'sync' : 'bump'} version for ${folder}: ${err.message}`);
                }
            }
        }
    });

    if (bumpCount === 0) {
        console.log('No collection mods were found to bump.');
    } else {
        if (argv.sync) {
            const newVersion = `${highestVersion.major}.${highestVersion.minor}.${highestVersion.patch}`;
            logSuccess(`Successfully synced ${bumpCount} collection mod(s) to version ${newVersion}`);
        } else {
            logSuccess(`Successfully bumped version for ${bumpCount} collection mod(s).`);
        }
    }
});
