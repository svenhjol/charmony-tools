import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { templatesFolder, srcFolder, projectsFile } from './libs/paths.js';
import { logError, logSuccess } from './libs/log.js';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const templateModFolder = path.join(templatesFolder, 'mod');

const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const args = yargs(hideBin(process.argv))
    .option('modId', {
        alias: 'i',
        type: 'string',
        description: 'The mod ID (e.g., charmony-ghost-busters)',
    })
    .option('shortId', {
        alias: 's',
        type: 'string',
        description: 'The short ID (e.g., ghost_busters)',
    })
    .help()
    .alias('help', 'h')
    .argv;

const main = async () => {
    try {
        const modId = args.modId || await askQuestion('Enter the mod ID (e.g. charmony-ghost-busters): ');
        const shortId = args.shortId || await askQuestion('Enter the short ID (e.g. ghost_busters): ');
        const niceId = shortId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
        const niceName = niceId.replace(/([A-Z])/g, ' $1').trim();
        const description = niceName.charAt(0).toUpperCase() + niceName.slice(1).toLowerCase();

        if (!modId || !shortId) {
            logError('modId and shortId are required');
            rl.close();
            return;
        }

        const destinationFolder = path.join(srcFolder, modId);

        if (fs.existsSync(destinationFolder)) {
            logError(`The folder ${destinationFolder} already exists. Exiting`);
            rl.close();
            return;
        }

        fs.mkdirSync(destinationFolder, { recursive: true });

        const copyFolder = (source, destination) => {
            const entries = fs.readdirSync(source, { withFileTypes: true });
            for (const entry of entries) {
                const sourcePath = path.join(source, entry.name);
                const destinationName = entry.name
                    .replace(/charmony-example-template/g, modId)
                    .replace(/example_template/g, shortId)
                    .replace(/ExampleTemplate/g, niceId)
                    .replace(/ExampleName/g, niceName)
                    .replace(/ExampleDescription/g, description);
                const destinationPath = path.join(destination, destinationName);

                if (entry.isDirectory()) {
                    fs.mkdirSync(destinationPath, { recursive: true });
                    copyFolder(sourcePath, destinationPath);
                } else {
                    if (path.extname(sourcePath) === '.png') {
                        fs.copyFileSync(sourcePath, destinationPath);
                    } else {
                        const content = fs.readFileSync(sourcePath, 'utf8')
                            .replace(/charmony-example-template/g, modId)
                            .replace(/example_template/g, shortId)
                            .replace(/ExampleTemplate/g, niceId)
                            .replace(/ExampleName/g, niceName)
                            .replace(/ExampleDescription/g, description);
                        fs.writeFileSync(destinationPath, content, 'utf8');
                    }
                }
            }
        };

        copyFolder(templateModFolder, destinationFolder);
        logSuccess(`Mod template copied to ${destinationFolder}.`);

        // Update projects.json
        if (fs.existsSync(projectsFile)) {
            const projectsJson = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
            if (!projectsJson.includes(modId)) {
                projectsJson.push(modId);
                fs.writeFileSync(projectsFile, JSON.stringify(projectsJson, null, 2), 'utf8');
                logSuccess(`Added ${modId} to ${projectsFile}.`);
            }
        } else {
            logError(`${projectsFile} not found. Could not update mods array.`);
        }
    } catch (error) {
        logError(`An error occurred: ${error.message}`);
    } finally {
        rl.close();
    }
};

main();

