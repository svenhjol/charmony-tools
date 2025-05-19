import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import readline from 'readline';
import { argv } from 'process';
import { hideBin } from 'yargs/helpers';
import { readProperties, bumpVersion } from './libs/project.js';
import { logError, logSuccess } from './libs/log.js';
import { srcFolder, javaFolder } from './libs/paths.js';

const propsFile = path.join(javaFolder, 'gradle.properties')
let localProps = fs.readFileSync(propsFile, 'utf8');

const args = yargs(hideBin(argv))
    .option('bump', {
        alias: 'b',
        type: 'boolean',
        description: 'Enable version bump',
        default: false
    })
    .help()
    .alias('help', 'h')
    .argv;

let shouldBump = args['bump'];
const projects = args._;

if (shouldBump && projects.length === 0) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = () => {
        return new Promise((resolve) => {
            rl.question('This will bump the version number for all projects. Are you sure? (y/n) ', (answer) => {
                resolve(answer.toLowerCase() === 'y');
                rl.close();
            });
        });
    };

    const main = async () => {
        const userConfirmed = await askQuestion();
        if (!userConfirmed) {
            shouldBump = false;
        }
    };

    await main();
}

// Iterate through each project folder in the src directory.
fs.readdir(srcFolder, (err, folders) => {
    if (err) {
        console.error('Error reading src folder:', err);
        return;
    }

    folders.forEach(folder => {
        const srcPath = path.join(srcFolder, folder);

        if (shouldBump && (projects.length === 0 || projects.includes(folder))) {
            try {
                bumpVersion(srcPath);
            } catch (err) {
                logError(`Failed to bump version for ${srcPath}: ${err.message}`);
            }
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            const srcProps = readProperties(srcPath);
            if (!srcProps?.short_id || !srcProps?.mod_version) return;

            try {
                let keyFound = false;
                const key = `${srcProps.short_id}_version`;

                localProps = localProps
                    .split('\n')
                    .map(line => {
                        if (line.startsWith(key)) {
                            keyFound = true;
                            const currentVersion = line.split('=')[1];
                            if (currentVersion === srcProps.mod_version) {
                                console.log(`No update needed for ${srcProps.short_id}, already at ${srcProps.mod_version}`);
                                return line;
                            }
                            logSuccess(`Updating ${srcProps.mod_id} from ${currentVersion} to ${srcProps.mod_version}`);
                            return `${key}=${srcProps.mod_version}`;
                        }
                        return line;
                    })
                    .join('\n');

                if (!keyFound) {
                    const lines = localProps.split('\n');
                    const commentIndex = lines.findIndex(line => line.trim() === '# Charmony mod versions');
                    if (commentIndex !== -1) {
                        lines.splice(commentIndex + 1, 0, `${key}=${srcProps.mod_version}`);
                        logSuccess(`Added ${srcProps.mod_id} with version ${srcProps.mod_version}`);
                    }
                    localProps = lines.join('\n');
                }

            } catch (err) {
                logError(err.message);
            }
        }
    });
    
    // Alphabetically sort the section between '# Charmony mod versions' and '# Copy from Fabric website'
    const lines = localProps.split('\n');
    const startIndex = lines.findIndex(line => line.trim() === '# Charmony mod versions');
    const endIndex = lines.findIndex(line => line.trim() === '# Copy from Fabric website');

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const sectionToSort = lines.slice(startIndex + 1, endIndex).filter(line => line.trim() !== '');
        sectionToSort.sort((a, b) => a.localeCompare(b));
        localProps = [
            ...lines.slice(0, startIndex + 1),
            ...sectionToSort,
            '', // Add a newline after the alphabetised lines
            ...lines.slice(endIndex)
        ].join('\n');
    }
    fs.writeFileSync(propsFile, localProps, 'utf8');
});