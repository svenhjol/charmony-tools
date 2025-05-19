import fs from 'fs';
import path from 'path';
import { javaFolder } from './paths.js';

/**
 * Reads all the properties from the gradle.properties file in the local java folder.
 * 
 * @returns {object|null} An object containing the properties from gradle.properties or null if the file doesn't exist.
 */
export function readGlobalProperties() {
    const propsFile = path.join(javaFolder, 'gradle.properties');

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