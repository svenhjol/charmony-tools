import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logError, logSuccess, logWarn } from './log.js';
import { readGlobalProperties } from './tools.js';
import { buildFolder } from './paths.js';

/**
 * Reads all properties from the project's gradle.properties file.
 * 
 * @param {string} srcPath Path to the source project folder.
 * @returns {object|null} Props object or null if not found
 */
export function readProperties(srcPath) {
    const propsFile = path.join(srcPath, 'gradle.properties');

    if (fs.existsSync(propsFile)) {
        const content = fs.readFileSync(propsFile, 'utf-8');
        const props = {};
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=').map(part => part.trim());
            if (key && value) {
                props[key] = value;
            }
        });
        return props;
    }
    return null;
}

/**
 * Bumps the mod_version in the gradle.properties file by incrementing the patch version.
 * 
 * @param {string} srcPath Path to the source project folder.
 */
export function bumpVersion(srcPath) {
    const propsFile = path.join(srcPath, 'gradle.properties');
    const content = fs.readFileSync(propsFile, 'utf-8');
    const lines = content.split('\n');
    let versionUpdated = false;

    const updatedLines = lines.map(line => {
        if (line.startsWith('mod_version=')) {
            const version = line.split('=')[1].trim();
            const [major, minor, patch] = version.split('.').map(Number);

            if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
                logError(`Invalid version format in gradle.properties: ${version}`);
                return line;
            }

            const newVersion = `${major}.${minor}.${patch + 1}`;
            logSuccess(`Bumped version from ${version} to ${newVersion}`);
            versionUpdated = true;
            return `mod_version=${newVersion}`;
        }
        return line;
    });

    if (versionUpdated) {
        fs.writeFileSync(propsFile, updatedLines.join('\n'), 'utf-8');
    } else {
        logWarn(`mod_version key not found in gradle.properties`);
    }
}

/**
 * Executes the gradlew build command inside a source project folder.
 * Optionally cleans the build directory before building.
 * 
 * @param {string} srcPath Path to the source project folder.
 * @param {boolean} clean If true, cleans the build directory before building.
 */
export function buildAndCopy(srcPath, clean = false) {
    const srcProps = readProperties(srcPath);
    const globalProps = readGlobalProperties();

    if (!srcProps) {
        console.error(`Error reading properties for ${srcPath}`);
        return;
    }

    const jarFiles = [
        {
            name: `${srcProps.mod_id}-${srcProps.mod_version}+${globalProps.minecraft_version}.jar`,
            description: 'jar file'
        },
        {
            name: `${srcProps.mod_id}-${srcProps.mod_version}+${globalProps.minecraft_version}-sources.jar`,
            description: 'sources jar file'
        }
    ];

    const modId = srcProps.mod_id;
    console.log(`Building project \x1b[1m${modId}\x1b[0m...`);

    const existingJarPath = path.join(srcPath, 'build', 'libs', jarFiles[0].name);
    if (!clean && fs.existsSync(existingJarPath)) {
        console.log(`- Jar file ${jarFiles[0].name} already exists in ${srcPath}, skipping build`);
    } else {
        try {
            if (clean) {
                execSync(`cd ${srcPath} && ./gradlew clean`, { encoding: 'utf-8' });
                console.log(`- Deleted build directory`);
            }

            const out = execSync(`cd ${srcPath} && ./gradlew build`, { encoding: 'utf-8' });
            if (out.includes('SUCCESSFUL')) {
                logSuccess(`- Build was successful`);
            } else {
                logWarn(`- Build may not have been successful`);
            }
        } catch (err) {
            logError(`- Build was not successful: ${err.message}`);
            return;
        }
    }

    jarFiles.forEach(({ name, description }) => {
        const srcPathFull = path.join(srcPath, 'build', 'libs', name);
        const destPathFull = path.join(buildFolder, name);

        if (fs.existsSync(srcPathFull)) {
            fs.copyFileSync(srcPathFull, destPathFull);
            logSuccess(`- Copied ${name} to ${buildFolder}`);
        } else {
            logError(`- Could not find ${description} ${name}`);
        }
    });
}
