import { execSync } from 'child_process';
import { logError, logSuccess } from './log.js';

export function clone(url, target, branch = 'main') {
    try {
        execSync(`git clone ${url} ${target} --branch ${branch}`);
        logSuccess(`- Cloned repository from ${url} to ${target} on branch ${branch}`);
    } catch (err) {
        logError(`- Error cloning project: ${err.message}`);
    }
}

export function setConfig(target, config) {
    try {
        if (config.name) {
            execSync(`cd ${target} && git config user.name "${config.name}"`);
            logSuccess(`- Set name of ${target} to ${config.name}`);
        }
        if (config.email) {
            execSync(`cd ${target} && git config user.email "${config.email}"`);
            logSuccess(`- Set email of ${target} to ${config.email}`);
        }
    } catch (err) {
        logError(`- Error setting config: ${err.message}`);
    }
}

export function commit(target, message = 'Changes') {
    try {
        execSync(`cd ${target} && git add . && git commit -m "${message}"`);
        logSuccess(`- Committed changes in ${target} with message: "${message}"`);
    } catch (err) {
        console.log(`- No commits made`);
    }
}

export function checkout(target, branch) {
    try {
        execSync(`cd ${target} && git checkout ${branch}`, { stdio: 'ignore' });
        logSuccess(`- Checked out branch ${branch}`);
    } catch (err) {
        logError(`- Error checking out branch: ${err.message}`);
    }
}

export function push(target) {
    try {
        const branch = execSync(`cd ${target} && git rev-parse --abbrev-ref HEAD`).toString().trim();
        const stdout = execSync(`cd ${target} && git ls-remote --heads origin ${branch}`).toString().trim();
        if (stdout) {
            execSync(`cd ${target} && git push`, { stdio: 'ignore' });
            logSuccess(`- Pushed changes for ${target}`);
        } else {
            execSync(`cd ${target} && git push -u origin ${branch}`, { stdio: 'ignore' });
            logSuccess(`- Pushed changes for ${target} and set upstream to ${branch}`);
        }
    } catch (err) {
        logError(`- Error pushing changes: ${err.message}`);
    }
}

export function execute(target, command) {
    try {
        const result = execSync(`cd ${target} && ${command}`).toString().trim();
        logSuccess(`- Executed command: "${command}" in ${target}`);
        return result;
    } catch (err) {
        logError(`- Error executing command "${command}" in ${target}: ${err.message}`);
        throw err;
    }
}