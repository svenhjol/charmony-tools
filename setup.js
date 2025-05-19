import fs from 'fs';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { argv } from 'process';
import { clone, setConfig, push, checkout, commit, execute } from './libs/git.js';
import { hideBin } from 'yargs/helpers';
import { logError } from './libs/log.js';
dotenv.config();

const repoPrefix = process.env.REPO_PREFIX || 'git@github.com:';
const srcFolder = process.env.SRC_FOLDER || 'src';
const projectsFile = process.env.PROJECTS_FILE || 'projects.json';
let overrideBranch = process.env.BRANCH || 'main'

const args = yargs(hideBin(argv))
    .option('branch', {
        alias: 'b',
        type: 'string',
        description: 'Specify a branch to checkout after cloning. The branch must exist.',
    })
    .option('commit', {
        alias: 'c',
        type: 'string',
        description: 'Specify a commit message. If provided, a commit action will be performed with this message.',
    })
    .option('push', {
        alias: 'p',
        type: 'boolean',
        description: 'Push changes to the remote repository after committing.',
    })
    .option('command', {
        alias: 'cmd',
        type: 'string',
        description: 'Specify a command to execute in each source folder.',
    })
    .help()
    .alias('help', 'h')
    .argv;

const projects = args._;
const doCommit = args['commit'];
const pushChanges = args['push'];
const command = args['command'];
overrideBranch = args['branch']; // Allow overriding via the command line

// Create src folder.
if (!fs.existsSync(srcFolder)) {
    fs.mkdirSync(srcFolder);
}

// Load the project repos from the projects.json file.
if (!fs.existsSync(projectsFile)) {
    logError(`Error: ${projectsFile} file not found. Copy projects.json.example to projects.json and customise.`);
    process.exit(1);
}
const projectRepos = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
const repos = Object.fromEntries(
    projectRepos.map(repo => [
        (repo.includes('/') ? repo : `svenhjol/${repo}`), `${srcFolder}/${repo.split('/').pop()}`
    ])
);

const gitConfig = { name: process.env.GIT_NAME || '', email: process.env.GIT_EMAIL || '' };

// Setup repositories dynamically
for (const [repo, src] of Object.entries(repos)) {
    const modId = repo.split('/').pop();

    if (projects.length > 0 && !projects.includes(modId)) {
        continue;
    }

    const repoUrl = repoPrefix + repo;
    let hasDoneAction = false;
    console.log(`Project \x1b[1m${repo}\x1b[0m...`);

    if (!fs.existsSync(src)) {
        clone(repoUrl, src);
        setConfig(src, gitConfig);
        hasDoneAction = true;
    }
    
    if (overrideBranch) {
        checkout(src, overrideBranch);
        hasDoneAction = true;
    }

    if (doCommit) {
        commit(src, doCommit);
        hasDoneAction = true;
    }

    if (pushChanges) {
        push(src);
        hasDoneAction = true;
    }

    if (command) {
        execute(src, command);
        hasDoneAction = true;
    }
    
    if (!hasDoneAction) {
        console.log("Nothing to do");    
    }

    console.log();
}